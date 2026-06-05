<?php
$today = date('Y-m-d');
$defaultStartDate = date('Y-m-d', strtotime('-35 days'));
$defaultPrice = 600;
$defaultPacks = 0.5;
$fundCandidates = [];
$brokers = [];

$fundsPath = __DIR__ . '/data/funds.json';
$brokersPath = __DIR__ . '/data/brokers.json';

if (is_readable($fundsPath)) {
    $fundCandidates = json_decode(file_get_contents($fundsPath), true) ?: [];
}

if (is_readable($brokersPath)) {
    $brokers = json_decode(file_get_contents($brokersPath), true) ?: [];
}

$fundIconMap = [
    'assets/images/camp/18_icon_global_equity.png',
    'assets/images/camp/19_icon_sp500_category.png',
    'assets/images/camp/20_icon_nasdaq100_category.png',
    'assets/images/camp/21_icon_fangplus_category.png',
];

$brokerLogoMap = [
    'SBI証券' => 'assets/images/brokers/sbi.svg',
    '楽天証券' => 'assets/images/brokers/rakuten.svg',
    'マネックス証券' => 'assets/images/brokers/monex.svg',
    'auカブコム証券' => 'assets/images/brokers/aukabucom.svg',
    '松井証券' => 'assets/images/brokers/matsui.svg',
];

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$siteUrl = $scheme . '://' . $host . strtok($_SERVER['REQUEST_URI'] ?? '/index.php', '?');
$basePath = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');
if ($basePath === '.') {
    $basePath = '';
}
$ogpImageUrl = $scheme . '://' . $host . $basePath . '/assets/images/ogp/ogp.png';
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>禁煙NISAシミュレーター</title>
    <meta name="description" content="禁煙日数、浮いたたばこ代、NISA積立シミュレーションを毎日確認できるカウンターです。">
    <meta property="og:type" content="website">
    <meta property="og:title" content="禁煙NISAシミュレーター">
    <meta property="og:description" content="禁煙日数、浮いたたばこ代、NISA積立シミュレーションを毎日確認できるカウンターです。">
    <meta property="og:url" content="<?= htmlspecialchars($siteUrl, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:image" content="<?= htmlspecialchars($ogpImageUrl, ENT_QUOTES, 'UTF-8') ?>">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="禁煙NISAシミュレーター">
    <meta name="twitter:description" content="禁煙日数、浮いたたばこ代、NISA積立シミュレーションを毎日確認できるカウンターです。">
    <meta name="twitter:image" content="<?= htmlspecialchars($ogpImageUrl, ENT_QUOTES, 'UTF-8') ?>">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#1f6f5b">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="禁煙NISA">
    <link rel="apple-touch-icon" href="assets/images/pwa/icon-192.png">
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>
<main class="app-shell">
    <section class="hero-card">
        <div class="hero-copy">
            <p class="eyebrow">QUIT &amp; INVEST</p>
            <h1>禁煙NISA<br>シミュレーター</h1>
            <p class="lead">たばこ代を「未来の自分」へ。禁煙で健康を取り戻し、お金も育てるシミュレーション。</p>
            <div class="hero-pills">
                <span><b id="heroDays">0</b>日継続</span>
                <span id="heroMonthly">浮いた分を積立</span>
            </div>
        </div>
    </section>

    <section class="section-card input-card">
        <div class="section-title compact">
            <h2>シミュレーション条件</h2>
        </div>

        <div class="condition-list">
            <label class="condition-row">
                <span class="condition-icon"><img src="assets/images/camp/22_icon_calendar_days.png" alt=""></span>
                <span class="condition-copy">
                    <strong>禁煙開始日</strong>
                    <small>この日から今日までを計算</small>
                </span>
                <input type="date" id="startDate" value="<?= htmlspecialchars($defaultStartDate, ENT_QUOTES, 'UTF-8') ?>" max="<?= htmlspecialchars($today, ENT_QUOTES, 'UTF-8') ?>">
            </label>

            <label class="condition-row">
                <span class="condition-icon"><img src="assets/images/camp/24_icon_money_saved.png" alt=""></span>
                <span class="condition-copy">
                    <strong>1箱のたばこ代</strong>
                    <small>例：600円</small>
                </span>
                <input type="number" id="price" min="1" step="10" value="<?= $defaultPrice ?>">
            </label>

            <label class="condition-row">
                <span class="condition-icon"><img src="assets/images/camp/23_icon_box_count.png" alt=""></span>
                <span class="condition-copy">
                    <strong>1日の箱数</strong>
                    <small>2日で1箱なら0.5</small>
                </span>
                <input type="number" id="packs" min="0.5" max="10" step="0.5" value="<?= $defaultPacks ?>">
            </label>
        </div>
    </section>

    <section class="summary-strip" aria-label="禁煙サマリー">
        <article class="summary-tile">
            <img src="assets/images/camp/22_icon_calendar_days.png" alt="" decoding="async">
            <span>禁煙日数</span>
            <strong id="daysSmokeFree">0日</strong>
        </article>
        <article class="summary-tile">
            <img src="assets/images/camp/23_icon_box_count.png" alt="" decoding="async">
            <span>吸わなかった箱数</span>
            <strong id="avoidedPacks">0箱</strong>
        </article>
        <article class="summary-tile summary-gold">
            <img src="assets/images/camp/24_icon_money_saved.png" alt="" decoding="async">
            <span>浮いたたばこ代</span>
            <strong id="savedSoFar">0円</strong>
        </article>
    </section>
    <p class="hidden-count">吸わなかった本数：<span id="avoidedCigarettes">0本</span></p>

    <section class="share-panel" aria-label="禁煙NISAの共有">
        <p class="share-message" id="milestoneMessage" hidden></p>
        <button class="share-button" id="shareButton" type="button">結果をシェアする</button>
    </section>

    <section class="section-card health-card">
        <div class="section-title inline-title health-title">
            <div>
                <p class="eyebrow green">HEALTH MERIT</p>
                <h2>健康メリット</h2>
                <p>禁煙の価値はお金だけじゃありません。身体の回復もメインで見える化します。</p>
            </div>
        </div>

        <div class="health-road carousel" id="healthTimeline"></div>
        <a class="self-invest-banner" href="#moneySection">
            <img src="assets/images/camp/13_icon_leaf_recovery.png" alt="" loading="lazy" decoding="async">
            <span><strong>禁煙は、最高の自己投資。</strong><small>心臓・肺・血管が着実に回復していきます。</small></span>
            <b>›</b>
        </a>
        <p class="note">※ 医学的な個別診断ではなく、禁煙後の一般的な回復目安です。</p>
    </section>

    <section class="section-card money-card" id="moneySection">
        <div class="section-title inline-title">
            <div>
                <p class="eyebrow gold">MONEY MERIT</p>
                <h2>お金のメリット</h2>
            </div>
        </div>
        <div class="money-mini-grid">
            <div><span>1日あたり</span><strong id="dailyCost">0円</strong></div>
            <div><span>1ヶ月あたり</span><strong id="monthlyCost">0円</strong></div>
            <div><span>15年で貯金</span><strong id="saving15Years">0円</strong></div>
            <div class="dark-box"><span>15年後 NISA5%</span><strong id="nisa5Future">0円</strong></div>
        </div>
    </section>

    <section class="section-card chart-card">
        <div class="section-title row-title">
            <div>
                <p class="eyebrow">GRAPH</p>
                <h2>貯金 vs NISA</h2>
            </div>
            <select id="chartRate" aria-label="グラフに表示するNISA年利">
                <option value="0.03">年利3%</option>
                <option value="0.05" selected>年利5%</option>
                <option value="0.07">年利7%</option>
                <option value="0.10">年利10%</option>
                <option value="0.15">年利15%</option>
            </select>
        </div>
        <div class="chart-wrap"><canvas id="growthChart" width="760" height="360"></canvas></div>
        <div class="chart-milestones" id="chartMilestones"></div>
        <p class="note">※ 線は年末時点の概算です。税金・手数料・価格変動リスクは考慮していません。</p>
    </section>

    <section class="section-card projection-card">
        <div class="section-title row-title">
            <div>
                <p class="eyebrow">PROJECTION</p>
                <h2>年別推移</h2>
            </div>
            <p class="mini-label" id="monthlyInvestmentLabel">浮いた分を積立</p>
        </div>
                <div class="milestone-grid carousel" id="milestoneGrid"></div>
        <details class="detail-drawer">
            <summary>全データを見る（1〜15年）</summary>
            <div class="table-scroll">
                <table>
                    <thead>
                    <tr>
                        <th>年数</th><th>貯金</th><th>NISA 3%</th><th>NISA 5%</th><th>NISA 7%</th><th>NISA 10%</th><th>NISA 15%</th>
                    </tr>
                    </thead>
                    <tbody id="yearlyTable"></tbody>
                </table>
            </div>
        </details>
    </section>

    <section class="section-card result-card">
        <div class="section-title compact">
            <h2>NISAで積み立てた場合</h2>
        </div>
        <div class="result-list" id="investmentTable"></div>
        <p class="note">※ 10％・15％はかなり強気です。現実的には3％〜7％あたりを中心に見るのが無難です。</p>
    </section>

    <section class="section-card fund-panel">
        <div class="section-title">
            <p class="eyebrow green">FUND IDEAS</p>
            <h2>候補ファンド</h2>
            <p>購入推奨ではなく、リスク感を把握するためのカテゴリ表示です。</p>
        </div>
                <div class="fund-grid carousel">
            <?php foreach ($fundCandidates as $index => $fund): ?>
                <?php $fundIcon = $fundIconMap[$index % count($fundIconMap)]; ?>
                <article class="fund-card visual-card">
                    <span class="fund-rate"><?= htmlspecialchars($fund['rate'] ?? '', ENT_QUOTES, 'UTF-8') ?></span>
                    <img src="<?= htmlspecialchars($fundIcon, ENT_QUOTES, 'UTF-8') ?>" alt="" loading="lazy" decoding="async">
                    <h3><?= htmlspecialchars($fund['category'] ?? '', ENT_QUOTES, 'UTF-8') ?></h3>
                    <strong class="fund-name"><?= htmlspecialchars($fund['name'] ?? '', ENT_QUOTES, 'UTF-8') ?></strong>
                    <p class="fund-point"><?= htmlspecialchars($fund['point'] ?? '', ENT_QUOTES, 'UTF-8') ?></p>
                    <small class="fund-risk">
                        リスク：<?= htmlspecialchars($fund['risk'] ?? '', ENT_QUOTES, 'UTF-8') ?> / <?= htmlspecialchars($fund['level'] ?? '', ENT_QUOTES, 'UTF-8') ?>
                    </small>
                </article>
            <?php endforeach; ?>
        </div>
        <div class="soft-warning">
            <strong>候補表示について</strong>
            <p>実際に購入する前に、NISA対象区分、信託報酬、純資産総額、投資対象、目論見書を確認してください。</p>
        </div>
    </section>

    <section class="section-card broker-panel">
        <div class="section-title">
            <p class="eyebrow gold">OPEN NISA ACCOUNT</p>
            <h2>証券口座を準備する</h2>
            <p>NISAを始めるには、NISA口座を開設できる証券会社・金融機関が必要です。</p>
        </div>
                <div class="broker-grid carousel">
            <?php foreach ($brokers as $broker): ?>
                <?php $brokerLogo = $brokerLogoMap[$broker['name']] ?? 'assets/images/camp/17_icon_coins.png'; ?>
                <article class="broker-card visual-card">
                    <span><?= htmlspecialchars($broker['label'], ENT_QUOTES, 'UTF-8') ?></span>
                    <img class="broker-logo" src="<?= htmlspecialchars($brokerLogo, ENT_QUOTES, 'UTF-8') ?>" alt="<?= htmlspecialchars($broker['name'], ENT_QUOTES, 'UTF-8') ?>" loading="lazy" decoding="async">
                    <h3><?= htmlspecialchars($broker['name'], ENT_QUOTES, 'UTF-8') ?></h3>
                    <p><?= htmlspecialchars($broker['feature'], ENT_QUOTES, 'UTF-8') ?></p>
                    <a href="<?= htmlspecialchars($broker['url'], ENT_QUOTES, 'UTF-8') ?>" target="_blank" rel="noopener noreferrer">確認する</a>
                </article>
            <?php endforeach; ?>
        </div>
        <div class="ad-disclosure" hidden>
            <strong>広告表示について</strong>
            <p>このエリアにはアフィリエイト広告を掲載できます。当サイトは特定の証券会社・金融商品の購入を推奨するものではありません。</p>
        </div>
    </section>

    <footer class="site-footer">
        <a href="privacy.php">プライバシーポリシー</a>
        <a href="disclaimer.php">免責事項・広告表記</a>
    </footer>
</main>

<script src="assets/app.js"></script>
</body>
</html>
