/* ============================================================
   Wheel of Fortune ft Outlast Arena 2.0 — script.js
   ============================================================ */
(() => {
    'use strict';

    // ── Segments ────────────────────────────────────────
    const SEGMENTS = [
        { label: '5% OFF', color: '#f7941d', text: '#000', type: 'win', discount: 5, fee: 95, reward: '5% Discount' },
        { label: 'BETTER LUCK', color: '#1a0e3e', text: '#555', type: 'lose', discount: 0, fee: 100, reward: 'Better Luck' },
        { label: 'EXTRA CHANCE', color: '#2ecc71', text: '#000', type: 'win', discount: 0, fee: 100, reward: 'Extra Chance' },
        { label: 'NO DISCOUNT', color: '#150f3d', text: '#555', type: 'lose', discount: 0, fee: 100, reward: 'No Discount' },
        { label: '10% OFF', color: '#e8571e', text: '#fff', type: 'win', discount: 10, fee: 90, reward: '10% Discount' },
        { label: 'BETTER LUCK', color: '#1a0e3e', text: '#555', type: 'lose', discount: 0, fee: 100, reward: 'Better Luck' },
        { label: 'NO DISCOUNT', color: '#150f3d', text: '#555', type: 'lose', discount: 0, fee: 100, reward: 'No Discount' },
        { label: 'BETTER LUCK', color: '#1a0e3e', text: '#555', type: 'lose', discount: 0, fee: 100, reward: 'Better Luck' },
    ];
    const NUM = SEGMENTS.length;
    const ARC = (2 * Math.PI) / NUM;

    // ── DOM ─────────────────────────────────────────────
    const $ = (s) => document.querySelector(s);
    const curtainOverlay = $('#curtainOverlay');
    const mainWrapper = $('#mainWrapper');
    const accessWheelBtn = $('#accessWheelBtn');
    const formModal = $('#formModal');
    const formModalClose = $('#formModalClose');
    const playerForm = $('#playerForm');
    const wheelLocked = $('#wheelLocked');
    const wheelActive = $('#wheelActive');
    const canvas = $('#wheelCanvas');
    const ctx = canvas.getContext('2d');
    const spinBtn = $('#spinBtn');
    const spinNote = $('#spinNote');
    const resultModal = $('#resultModal');
    const resultIcon = $('#resultIcon');
    const resultTitle = $('#resultTitle');
    const resultMessage = $('#resultMessage');
    const resultReward = $('#resultReward');
    const resultFee = $('#resultFee');
    const resultCloseBtn = $('#resultCloseBtn');
    const confettiBox = $('#confettiContainer');
    const rewardSection = $('#rewardSection');
    const downloadPassBtn = $('#downloadPassBtn');

    // ── State ───────────────────────────────────────────
    let currentAngle = 0;
    let isSpinning = false;
    let hasSpun = localStorage.getItem('oa2_spun') === 'true';
    let playerData = JSON.parse(localStorage.getItem('oa2_player') || 'null');
    let wonPrize = null;
    let passInfo = JSON.parse(localStorage.getItem('oa2_pass') || 'null');

    // ── Init ────────────────────────────────────────────
    function init() {
        setupCurtain();
        setupFormModal();
        setupWheel();
        setupScrollReveal();
        setupNavScroll();
        restoreState();
    }

    // ── Curtain ─────────────────────────────────────────
    function setupCurtain() {
        // Lock scroll while curtain is visible
        document.body.style.overflow = 'hidden';

        curtainOverlay.addEventListener('click', () => {
            curtainOverlay.classList.add('open');
            document.body.style.overflow = '';
            setTimeout(() => {
                curtainOverlay.classList.add('hidden');
            }, 1600);
        });
    }

    // ── Form Modal ──────────────────────────────────────
    function setupFormModal() {
        accessWheelBtn.addEventListener('click', () => {
            formModal.classList.add('active');
        });

        formModalClose.addEventListener('click', () => {
            formModal.classList.remove('active');
        });

        formModal.addEventListener('click', (e) => {
            if (e.target === formModal) formModal.classList.remove('active');
        });

        playerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = $('#playerName').value.trim();
            const phone = $('#playerPhone').value.trim();
            if (!name || !phone || phone.length !== 10) return;

            playerData = { name, phone };
            localStorage.setItem('oa2_player', JSON.stringify(playerData));

            formModal.classList.remove('active');
            unlockWheel();
        });
    }

    // ── Unlock Wheel ────────────────────────────────────
    function unlockWheel() {
        wheelLocked.style.display = 'none';
        wheelActive.style.display = 'flex';
        drawWheel();

        if (hasSpun) {
            spinBtn.disabled = true;
            spinBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> ALREADY SPUN';
            const saved = localStorage.getItem('oa2_reward');
            if (saved) spinNote.innerHTML = 'You already claimed: <strong>' + saved + '</strong>';
        }
    }

    // ── Draw Wheel ──────────────────────────────────────
    function drawWheel() {
        const w = canvas.width, h = canvas.height;
        const cx = w / 2, cy = h / 2;
        const r = Math.min(cx, cy) - 12;
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < NUM; i++) {
            const sa = currentAngle + i * ARC, ea = sa + ARC;
            const seg = SEGMENTS[i];

            ctx.beginPath(); ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, sa, ea); ctx.closePath();
            ctx.fillStyle = seg.color; ctx.fill();
            ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.stroke();

            // Label
            ctx.save(); ctx.translate(cx, cy); ctx.rotate(sa + ARC / 2);
            ctx.textAlign = 'right'; ctx.fillStyle = seg.text;
            ctx.font = 'bold 13px Anton, sans-serif';
            ctx.fillText(seg.label, r - 18, 4); ctx.restore();
        }

        // Center
        ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#0c0a2a'; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(232,87,30,.45)'; ctx.stroke();
        ctx.fillStyle = '#f7941d'; ctx.font = '18px Bebas Neue, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SPIN', cx, cy);

        // Outer ring
        ctx.beginPath(); ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
        ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(232,87,30,.22)'; ctx.stroke();

        // LED dots
        for (let i = 0; i < 32; i++) {
            const a = (i * Math.PI * 2) / 32;
            ctx.beginPath(); ctx.arc(cx + (r + 2) * Math.cos(a), cy + (r + 2) * Math.sin(a), 3, 0, Math.PI * 2);
            ctx.fillStyle = i % 2 === 0 ? 'rgba(247,162,29,.6)' : 'rgba(232,87,30,.5)'; ctx.fill();
        }
    }

    // ── Spin ────────────────────────────────────────────
    function setupWheel() {
        spinBtn.addEventListener('click', spin);
        downloadPassBtn.addEventListener('click', downloadPass);
        resultCloseBtn.addEventListener('click', () => {
            resultModal.classList.remove('active');
            showRewardSection();
        });
    }

    function spin() {
        if (isSpinning || hasSpun) return;
        isSpinning = true; spinBtn.disabled = true;

        const idx = pickPrize();
        wonPrize = SEGMENTS[idx];

        const segMid = idx * ARC + ARC / 2;
        const target = -Math.PI / 2 - segMid;
        const fullSpins = 5 + Math.floor(Math.random() * 3);
        const totalRot = fullSpins * 2 * Math.PI + (target - currentAngle) % (2 * Math.PI);
        const duration = 5500 + Math.random() * 2000;
        const t0 = performance.now();
        const startAng = currentAngle;

        function tick(now) {
            const p = Math.min((now - t0) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            currentAngle = startAng + totalRot * ease;
            drawWheel();
            if (p < 1) { requestAnimationFrame(tick); return; }

            currentAngle %= (2 * Math.PI);
            isSpinning = false; hasSpun = true;
            localStorage.setItem('oa2_spun', 'true');
            localStorage.setItem('oa2_reward', wonPrize.reward);

            // Generate pass info
            passInfo = generatePassInfo(wonPrize);
            localStorage.setItem('oa2_pass', JSON.stringify(passInfo));

            spinBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> SPIN USED';
            spinNote.innerHTML = wonPrize.type === 'win'
                ? 'You won: <strong>' + wonPrize.reward + '</strong>'
                : 'Better luck in the arena!';

            showResultModal(wonPrize);
        }
        requestAnimationFrame(tick);
    }

    function pickPrize() {
        const w = [1.5, 5, 0.5, 5, 1, 5, 5, 5];
        const tot = w.reduce((a, b) => a + b, 0);
        let r = Math.random() * tot;
        for (let i = 0; i < w.length; i++) { r -= w[i]; if (r <= 0) return i; }
        return 0;
    }

    // ── Generate Pass Info ──────────────────────────────
    function generatePassInfo(prize) {
        const id = 'OA2-' + Date.now().toString(36).toUpperCase().slice(-6);
        const code = rand3() + '-' + rand3();
        const time = new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        return {
            name: playerData.name,
            phone: playerData.phone,
            reward: prize.reward,
            fee: prize.fee,
            id: id,
            code: code,
            time: time,
            type: prize.type
        };
    }

    function rand3() {
        return String(Math.floor(100 + Math.random() * 900));
    }

    // ── Result Modal ────────────────────────────────────
    function showResultModal(prize) {
        const isWin = prize.type === 'win';
        resultIcon.innerHTML = isWin ? '<i class="fa-solid fa-trophy"></i>' : '<i class="fa-solid fa-face-frown"></i>';
        resultIcon.className = 'result-icon ' + (isWin ? 'win' : 'lose');
        resultTitle.textContent = isWin ? 'Congratulations!' : 'Better Luck Next Time!';
        resultMessage.textContent = isWin ? 'You unlocked an Arena Advantage!' : 'No reward this time, but the arena still awaits.';
        resultReward.textContent = prize.reward;
        resultReward.className = 'result-reward' + (isWin ? '' : ' lose');
        resultFee.innerHTML = 'Your Entry Fee: <strong>\u20B9' + prize.fee + '</strong>';
        resultCloseBtn.innerHTML = isWin
            ? '<i class="fa-solid fa-arrow-down"></i> View Your Reward Pass'
            : '<i class="fa-solid fa-arrow-down"></i> View Details';

        resultModal.classList.add('active');
        if (isWin) spawnConfetti();
    }

    // ── Confetti ────────────────────────────────────────
    function spawnConfetti() {
        confettiBox.innerHTML = '';
        const colors = ['#ffd700', '#dc143c', '#00e5ff', '#00e676', '#a855f7', '#ff7b2e'];
        for (let i = 0; i < 60; i++) {
            const p = document.createElement('div');
            p.classList.add('confetti-piece');
            p.style.left = Math.random() * 100 + '%';
            p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            p.style.animationDelay = Math.random() * 1.5 + 's';
            p.style.width = (6 + Math.random() * 6) + 'px';
            p.style.height = (6 + Math.random() * 6) + 'px';
            p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            confettiBox.appendChild(p);
        }
        setTimeout(() => { confettiBox.innerHTML = ''; }, 3500);
    }

    // ── Show Reward Section ─────────────────────────────
    function showRewardSection() {
        if (!passInfo) return;
        $('#passName').textContent = passInfo.name;
        $('#passPhone').textContent = passInfo.phone;
        $('#passReward').textContent = passInfo.reward;
        $('#passFee').textContent = '\u20B9' + passInfo.fee;
        $('#passId').textContent = passInfo.id;
        $('#passVerify').textContent = passInfo.code;
        $('#passTime').textContent = passInfo.time;

        rewardSection.style.display = 'block';
        rewardSection.scrollIntoView({ behavior: 'smooth' });
    }

    // ── Download Pass ───────────────────────────────────
    function downloadPass() {
        if (!passInfo) return;
        const c = document.createElement('canvas'); c.width = 820; c.height = 440;
        const g = c.getContext('2d');

        // BG
        let gr = g.createLinearGradient(0, 0, 820, 440);
        gr.addColorStop(0, '#0c0a2a'); gr.addColorStop(0.5, '#150f3d'); gr.addColorStop(1, '#0c0a2a');
        g.fillStyle = gr; g.fillRect(0, 0, 820, 440);

        // Border
        g.strokeStyle = 'rgba(232,87,30,.3)'; g.lineWidth = 3; g.strokeRect(12, 12, 796, 416);
        g.setLineDash([8, 6]); g.strokeStyle = 'rgba(247,162,29,.2)'; g.lineWidth = 1;
        g.strokeRect(22, 22, 776, 396); g.setLineDash([]);

        // Top gradient bar
        let tg = g.createLinearGradient(0, 0, 820, 0);
        tg.addColorStop(0, '#e8571e'); tg.addColorStop(0.5, '#f7941d'); tg.addColorStop(1, '#e8571e');
        g.fillStyle = tg; g.fillRect(12, 12, 796, 4);

        // Badge
        g.fillStyle = '#f7941d'; g.font = '14px Bebas Neue, sans-serif'; g.textAlign = 'center';
        g.fillText('UTKARSH 2026', 410, 55);

        // Title
        g.font = '32px Anton, sans-serif'; g.fillStyle = '#fff'; g.fillText('ARENA REWARD PASS', 410, 95);
        g.fillStyle = 'rgba(240,240,255,.4)'; g.font = '13px Open Sans, sans-serif';
        g.fillText('Wheel of Fortune ft Outlast Arena 2.0', 410, 118);

        // Divider
        let dg = g.createLinearGradient(80, 135, 740, 135);
        dg.addColorStop(0, 'transparent'); dg.addColorStop(0.3, 'rgba(232,87,30,.35)');
        dg.addColorStop(0.7, 'rgba(247,162,29,.3)'); dg.addColorStop(1, 'transparent');
        g.strokeStyle = dg; g.lineWidth = 1; g.beginPath(); g.moveTo(80, 135); g.lineTo(740, 135); g.stroke();

        // Details
        g.textAlign = 'left'; g.font = '13px Open Sans, sans-serif';
        const rows = [
            ['Player:', passInfo.name],
            ['Phone:', passInfo.phone],
            ['Reward:', passInfo.reward],
            ['Entry Fee:', '\u20B9' + passInfo.fee],
        ];
        let y = 168;
        rows.forEach(([lbl, val]) => {
            g.fillStyle = 'rgba(240,240,255,.4)'; g.fillText(lbl, 120, y);
            g.fillStyle = '#f0f0ff'; g.font = 'bold 14px Open Sans, sans-serif'; g.fillText(val, 300, y);
            g.font = '13px Open Sans, sans-serif';
            y += 32;
        });

        // Reward highlight
        g.fillStyle = passInfo.type === 'win' ? '#f7941d' : 'rgba(240,240,255,.3)';
        g.font = '38px Anton, sans-serif'; g.textAlign = 'center';
        g.fillText(passInfo.reward.toUpperCase(), 410, 330);

        // Codes
        g.font = '10px Open Sans, sans-serif'; g.fillStyle = 'rgba(240,240,255,.3)';
        g.fillText('Reward ID: ' + passInfo.id, 200, 380);
        g.fillText('Verification: ' + passInfo.code, 410, 380);
        g.fillText('Time: ' + passInfo.time, 600, 380);

        // Footer
        g.fillStyle = 'rgba(240,240,255,.15)'; g.font = '10px Open Sans, sans-serif';
        g.fillText('Show this pass during registration to claim your reward', 410, 415);

        const link = document.createElement('a');
        link.download = 'OutlastArena_RewardPass_' + passInfo.id + '.png';
        link.href = c.toDataURL('image/png'); link.click();
    }

    // ── Restore previous state ─────────────────────────
    function restoreState() {
        if (playerData) {
            unlockWheel();
        }
        if (hasSpun && passInfo) {
            showRewardSection();
        }
    }

    // ── Scroll Reveal ───────────────────────────────────
    function setupScrollReveal() {
        const targets = document.querySelectorAll('.reveal');
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.12 });
        targets.forEach(el => obs.observe(el));
    }

    // ── Nav scroll ──────────────────────────────────────
    function setupNavScroll() {
        const nav = $('#navbar');
        const sections = document.querySelectorAll('section');
        const links = document.querySelectorAll('.nav-links a');

        window.addEventListener('scroll', () => {
            nav.style.background = window.scrollY > 50 ? 'rgba(12,10,42,.95)' : 'rgba(12,10,42,.75)';
            let cur = '';
            sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) cur = s.id; });
            links.forEach(l => {
                l.style.color = l.getAttribute('href') === '#' + cur ? '#f4811e' : '';
            });
        });
    }

    // ── Boot ────────────────────────────────────────────
    init();
})();
