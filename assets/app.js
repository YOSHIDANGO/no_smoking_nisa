const YEARS = 15;
const MONTHS = YEARS * 12;
const RATES = [0.03, 0.05, 0.07, 0.10, 0.15];
const CIGARETTES_PER_PACK = 20;
const STORAGE_KEY = 'noSmokingNisaSettings';
const SHARE_RATE = 0.05;

const healthItems = [
    {
        period: '数日〜数週間',
        title: 'ニコチン・一酸化炭素が抜けていく',
        text: '体内のニコチンはかなり減り、血中の一酸化炭素も改善していきます。まずは毒抜きの時期です。',
        icon: 'assets/images/camp/14_icon_lungs.png'
    },
    {
        period: '1ヶ月',
        title: '咳・息切れ・味覚の変化を感じやすい',
        text: '呼吸器や血流の改善を感じ始める人が増えます。まだ習慣の記憶は残りやすい時期です。',
        icon: 'assets/images/camp/17_icon_eating.png'
    },
    {
        period: '3ヶ月',
        title: '肺・血流の回復が進む',
        text: '階段や運動時のしんどさが軽くなる人もいます。ここまで来ると禁煙生活がかなり現実になります。',
        icon: 'assets/images/camp/16_icon_walking.png'
    },
    {
        period: '1年',
        title: '心臓・血管リスクが大きく下がる節目',
        text: '冠動脈疾患などのリスクが下がっていく大きな区切りです。1年禁煙はかなり強い実績です。',
        icon: 'assets/images/camp/15_icon_heart.png'
    },
    {
        period: '5年',
        title: '脳卒中や一部のがんリスクがさらに低下',
        text: '長期リスクの低下が見えやすくなってきます。元喫煙者感がかなり薄くなる時期です。',
        icon: 'assets/images/camp/18_icon_brain_health.png'
    },
    {
        period: '10年',
        title: '肺がんリスクが大きく下がる',
        text: '喫煙者と比べた肺がんリスクが大きく下がる目安です。長年喫煙していた人にとってかなり大きい地点です。',
        icon: 'assets/images/camp/19_icon_lung_recovery.png'
    },
    {
        period: '15年',
        title: '非喫煙者にかなり近い状態へ',
        text: '心血管系を中心に、病気のリスクが非喫煙者に近づいていく目安です。禁煙NISAのゴール地点です。',
        icon: 'assets/images/camp/20_icon_full_recovery.png'
    }
];

const elements = {
    startDate: document.getElementById('startDate'),
    price: document.getElementById('price'),
    packs: document.getElementById('packs'),
    chartRate: document.getElementById('chartRate'),
    heroDays: document.getElementById('heroDays'),
    daysSmokeFree: document.getElementById('daysSmokeFree'),
    daysComment: document.getElementById('daysComment'),
    avoidedPacks: document.getElementById('avoidedPacks'),
    avoidedCigarettes: document.getElementById('avoidedCigarettes'),
    savedSoFar: document.getElementById('savedSoFar'),
    dailyCost: document.getElementById('dailyCost'),
    monthlyCost: document.getElementById('monthlyCost'),
    saving15Years: document.getElementById('saving15Years'),
    nisa5Future: document.getElementById('nisa5Future'),
    chartMilestones: document.getElementById('chartMilestones'),
    heroMonthly: document.getElementById('heroMonthly'),
    investmentTable: document.getElementById('investmentTable'),
    yearlyTable: document.getElementById('yearlyTable'),
    milestoneGrid: document.getElementById('milestoneGrid'),
    monthlyInvestmentLabel: document.getElementById('monthlyInvestmentLabel'),
    healthTimeline: document.getElementById('healthTimeline'),
    milestoneMessage: document.getElementById('milestoneMessage'),
    shareButton: document.getElementById('shareButton'),
    canvas: document.getElementById('growthChart')
};

let latestSimulation = null;

function setText(element, value) {
    if (element) {
        element.textContent = value;
    }
}

function setHtml(element, value) {
    if (element) {
        element.innerHTML = value;
    }
}

function hasElement(element) {
    return Boolean(element);
}

function formatYen(value) {
    return `${Math.round(value).toLocaleString('ja-JP')}円`;
}

function plainYen(value) {
    return Math.round(value).toLocaleString('ja-JP');
}

function formatNumber(value, digits = 0) {
    return Number(value).toLocaleString('ja-JP', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    });
}

function clamp(value, min, max) {
    if (Number.isNaN(value)) {
        return min;
    }

    return Math.min(Math.max(value, min), max);
}

function readSavedSettings() {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        return null;
    }
}

function restoreSettings() {
    const saved = readSavedSettings();

    if (!saved) {
        return;
    }

    if (saved.startDate && elements.startDate) {
        elements.startDate.value = saved.startDate;
    }

    if (saved.price && elements.price) {
        elements.price.value = saved.price;
    }

    if (saved.packs && elements.packs) {
        elements.packs.value = saved.packs;
    }

    if (saved.chartRate && elements.chartRate) {
        elements.chartRate.value = saved.chartRate;
    }
}

function saveSettings() {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
            startDate: elements.startDate ? elements.startDate.value : '',
            price: elements.price ? elements.price.value : '',
            packs: elements.packs ? elements.packs.value : '',
            chartRate: elements.chartRate ? elements.chartRate.value : ''
        }));
    } catch (error) {
        // Storage may be disabled in private browsing; the simulator should still work.
    }
}

function getMilestoneMessage(days) {
    const messages = {
        7: ['7日達成。最初の山を越えました。', 'ここからは「続けられる自分」を育てるフェーズです。'],
        30: ['30日達成。もう禁煙1ヶ月です。', 'ここまで来たら、積み上げたものを守るフェーズです。'],
        100: ['100日達成。かなり大きな節目です。', '浮いたお金も健康の変化も、しっかり形になり始めています。'],
        365: ['365日達成。禁煙1年です。', 'この1年の積み上げは、未来の自分へのかなり強い投資です。'],
        500: ['500日達成。もう習慣が変わっています。', '続けた時間と浮いたお金を、次の安心につなげましょう。'],
        1000: ['1000日達成。これは誇っていい数字です。', '禁煙も積立も、長く続けた人だけが見られる景色です。']
    };

    return messages[days] || null;
}

function renderMilestoneMessage(days) {
    if (!hasElement(elements.milestoneMessage)) {
        return;
    }

    const message = getMilestoneMessage(days);

    if (!message) {
        elements.milestoneMessage.hidden = true;
        elements.milestoneMessage.innerHTML = '';
        return;
    }

    elements.milestoneMessage.hidden = false;
    elements.milestoneMessage.innerHTML = `<strong>${message[0]}</strong>${message[1]}`;
}

function buildShareText() {
    if (!latestSimulation) {
        return '';
    }

    return [
        `禁煙${formatNumber(latestSimulation.daysSmokeFree)}日目。`,
        `吸わなかった箱数：${formatNumber(latestSimulation.avoidedPacks, 1)}箱`,
        `浮いたたばこ代：約${plainYen(latestSimulation.savedSoFar)}円`,
        `このまま15年積み立てると、NISA年利5%で約${plainYen(latestSimulation.nisa5Future)}円。`,
        '',
        '#禁煙NISA #禁煙 #NISA'
    ].join('\n');
}

async function shareCurrentResult() {
    const text = buildShareText();
    const url = window.location.href.split('#')[0];

    if (!text) {
        return;
    }

    if (navigator.share) {
        try {
            await navigator.share({
                title: '禁煙NISA',
                text,
                url
            });
            return;
        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }
        }
    }

    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text}\n${url}`)}`;
    window.open(intentUrl, '_blank', 'noopener,noreferrer');
}

function getDaysSmokeFree(startDateValue) {
    if (!startDateValue) {
        return 0;
    }

    const start = new Date(`${startDateValue}T00:00:00`);
    const today = new Date();
    const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (Number.isNaN(start.getTime()) || start > current) {
        return 0;
    }

    return Math.floor((current - start) / 86400000);
}

function futureValue(monthlyAmount, annualRate, months) {
    const monthlyRate = annualRate / 12;
    let total = 0;

    // Month-end contribution: growth is applied first, then that month's saved tobacco money is added.
    for (let i = 0; i < months; i++) {
        total = total * (1 + monthlyRate) + monthlyAmount;
    }

    return total;
}

function buildYearlyRows(monthlyAmount) {
    const rows = [];

    for (let year = 1; year <= YEARS; year++) {
        const months = year * 12;
        const saving = monthlyAmount * months;
        const investments = RATES.map((rate) => futureValue(monthlyAmount, rate, months));

        rows.push({
            year,
            saving,
            investments
        });
    }

    return rows;
}


function renderChartMilestones(rows, annualRate) {
    if (!hasElement(elements.chartMilestones)) {
        return;
    }

    const milestoneYears = [1, 5, 10, 15];
    const rateIndex = RATES.findIndex((rate) => rate === annualRate);

    elements.chartMilestones.innerHTML = milestoneYears.map((year) => {
        const row = rows.find((item) => item.year === year);
        const value = row.investments[rateIndex];

        return `
            <article class="chart-chip">
                <span>${year}年後</span>
                <strong>${formatYen(value)}</strong>
            </article>
        `;
    }).join('');
}

function renderMilestones(rows) {
    if (!hasElement(elements.milestoneGrid)) {
        return;
    }

    const milestoneYears = [1, 5, 10, 15];

    elements.milestoneGrid.innerHTML = milestoneYears.map((year) => {
        const row = rows.find((item) => item.year === year);
        const nisa5 = row.investments[RATES.indexOf(0.05)];
        const nisa7 = row.investments[RATES.indexOf(0.07)];

        return `
            <article class="milestone-card">
                <span>${year}年目</span>
                <strong>${formatYen(row.saving)}</strong>
                <small>貯金した場合</small>
                <div>
                    <em>NISA 5%</em><b>${formatYen(nisa5)}</b>
                </div>
                <div>
                    <em>NISA 7%</em><b>${formatYen(nisa7)}</b>
                </div>
            </article>
        `;
    }).join('');
}

function renderHealthTimeline() {
    if (!hasElement(elements.healthTimeline)) {
        return;
    }

    elements.healthTimeline.innerHTML = healthItems.map((item) => `
        <div class="health-item">
            <time>${item.period}</time>
            <img class="health-icon" src="${item.icon}" alt="" loading="lazy" decoding="async" onerror="this.hidden=true">
            <strong>${item.title}</strong>
            <p>${item.text}</p>
        </div>
    `).join('');
}

function drawChart(rows, annualRate) {
    const canvas = elements.canvas;
    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext('2d');
    const displayWidth = Math.max(320, Math.floor(canvas.clientWidth || 760));
    const isMobile = window.matchMedia('(max-width: 760px)').matches;
    const displayHeight = isMobile ? 270 : 360;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(displayWidth * dpr);
    canvas.height = Math.floor(displayHeight * dpr);
    canvas.style.height = `${displayHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const width = displayWidth;
    const height = displayHeight;
    const padding = isMobile
        ? { top: 30, right: 18, bottom: 42, left: 58 }
        : { top: 32, right: 36, bottom: 48, left: 84 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const rateIndex = RATES.findIndex((rate) => rate === annualRate);
    const savings = rows.map((row) => row.saving);
    const investments = rows.map((row) => row.investments[rateIndex]);
    const maxValue = Math.max(...savings, ...investments) * 1.12;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(23, 32, 42, 0.08)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#6f7a86';
    ctx.font = `${isMobile ? 10 : 12}px sans-serif`;
    ctx.textAlign = 'right';

    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (plotHeight / 4) * i;
        const value = maxValue * (1 - i / 4);

        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        ctx.fillText(`${Math.round(value / 10000).toLocaleString('ja-JP')}万`, padding.left - 8, y + 4);
    }

    function point(index, value) {
        const x = padding.left + plotWidth * (index / (rows.length - 1));
        const y = padding.top + plotHeight * (1 - value / maxValue);
        return { x, y };
    }

    function drawLine(values, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = isMobile ? 3 : 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        values.forEach((value, index) => {
            const p = point(index, value);
            if (index === 0) {
                ctx.moveTo(p.x, p.y);
            } else {
                ctx.lineTo(p.x, p.y);
            }
        });

        ctx.stroke();

        values.forEach((value, index) => {
            if (isMobile && index % 3 !== 2 && index !== 0 && index !== rows.length - 1) {
                return;
            }

            const p = point(index, value);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, isMobile ? 3 : 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawLine(savings, '#17202a');
    drawLine(investments, '#d7a84f');

    ctx.fillStyle = '#17202a';
    ctx.font = `700 ${isMobile ? 10 : 12}px sans-serif`;
    ctx.textAlign = 'center';

    rows.forEach((row, index) => {
        const shouldShow = isMobile
            ? row.year === 1 || row.year === 5 || row.year === 10 || row.year === YEARS
            : row.year === 1 || row.year % 3 === 0 || row.year === YEARS;

        if (shouldShow) {
            const p = point(index, 0);
            ctx.fillText(`${row.year}年`, p.x, height - 20);
        }
    });

    const legendY = isMobile ? 16 : 24;
    const legendX = isMobile ? padding.left : width - 210;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#17202a';
    ctx.fillRect(legendX, legendY, 16, 4);
    ctx.fillText('貯金', legendX + 22, legendY + 6);
    ctx.fillStyle = '#d7a84f';
    ctx.fillRect(legendX + 72, legendY, 16, 4);
    ctx.fillText(`NISA ${Math.round(annualRate * 100)}%`, legendX + 94, legendY + 6);
}

function updateSimulation() {
    const price = Math.max(Number(elements.price.value) || 0, 0);
    const packs = clamp(Number(elements.packs.value), 0.5, 10);
    const rawRate = Number(elements.chartRate.value);
    const selectedRate = RATES.includes(rawRate) ? rawRate : SHARE_RATE;
    const daysSmokeFree = getDaysSmokeFree(elements.startDate.value);

    if (Number(elements.packs.value) !== packs) {
        elements.packs.value = packs;
    }

    if (Number(elements.chartRate.value) !== selectedRate) {
        elements.chartRate.value = String(selectedRate.toFixed(2));
    }

    const dailyCost = price * packs;
    const monthlyCost = dailyCost * 365 / 12;
    const tobaccoSaving15Years = monthlyCost * MONTHS;
    const principal = tobaccoSaving15Years;
    const nisa5Future = futureValue(monthlyCost, 0.05, MONTHS);
    const avoidedPacks = daysSmokeFree * packs;
    const avoidedCigarettes = avoidedPacks * CIGARETTES_PER_PACK;
    const savedSoFar = daysSmokeFree * dailyCost;
    const rows = buildYearlyRows(monthlyCost);

    latestSimulation = {
        daysSmokeFree,
        avoidedPacks,
        savedSoFar,
        nisa5Future
    };

    setText(elements.heroDays, formatNumber(daysSmokeFree));
    setText(elements.daysSmokeFree, `${formatNumber(daysSmokeFree)}日`);
    setText(elements.daysComment, daysSmokeFree >= 30 ? '1ヶ月超え。かなり強い' : 'まずは1ヶ月が目標');
    setText(elements.avoidedPacks, `${formatNumber(avoidedPacks, 1)}箱`);
    setText(elements.avoidedCigarettes, `${formatNumber(avoidedCigarettes, 0)}本`);
    setText(elements.savedSoFar, formatYen(savedSoFar));
    setText(elements.dailyCost, formatYen(dailyCost));
    setText(elements.monthlyCost, formatYen(monthlyCost));
    setText(elements.saving15Years, formatYen(tobaccoSaving15Years));
    setText(elements.nisa5Future, formatYen(nisa5Future));
    setText(elements.heroMonthly, `${formatYen(monthlyCost)}/月を積立`);
    setText(elements.monthlyInvestmentLabel, `${formatYen(monthlyCost)}/月`);

    const investmentHtml = RATES.map((rate) => {
        const value = futureValue(monthlyCost, rate, MONTHS);
        const profit = value - principal;
        const label = `${Math.round(rate * 100)}%`;

        return `
            <article class="result-row">
                <span><small>想定年利</small><b>${label}</b></span>
                <span><small>15年後の金額</small><b>${formatYen(value)}</b></span>
                <span><small>元本との差額</small><b>${formatYen(profit)}</b></span>
            </article>
        `;
    }).join('');
    setHtml(elements.investmentTable, investmentHtml);

    renderMilestones(rows);
    renderChartMilestones(rows, selectedRate);
    renderMilestoneMessage(daysSmokeFree);

    const yearlyHtml = rows.map((row) => `
        <tr>
            <td data-label="年数">${row.year}年目</td>
            <td data-label="貯金した場合">${formatYen(row.saving)}</td>
            ${row.investments.map((value, index) => `<td data-label="NISA ${Math.round(RATES[index] * 100)}%">${formatYen(value)}</td>`).join('')}
        </tr>
    `).join('');
    setHtml(elements.yearlyTable, yearlyHtml);

    drawChart(rows, selectedRate);
    saveSettings();
}

['input', 'change'].forEach((eventName) => {
    [elements.startDate, elements.price, elements.packs, elements.chartRate].forEach((element) => {
        if (element) {
            element.addEventListener(eventName, updateSimulation);
        }
    });
});

if (elements.shareButton) {
    elements.shareButton.addEventListener('click', shareCurrentResult);
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').catch(() => {});
    });
}

renderHealthTimeline();
restoreSettings();
updateSimulation();

window.addEventListener('resize', () => {
    window.requestAnimationFrame(updateSimulation);
});
