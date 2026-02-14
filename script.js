/* ============================================================
   Wheel of Fortune ft Outlast Arena 2.0 — script.js (REDESIGNED)
   ============================================================ */
(() => {
    'use strict';

    // ── Segments ────────────────────────────────────────
    const SEGMENTS = [
        { label: '5% OFF', color: '#d4841a', text: '#fff', type: 'win', discount: 5, fee: 95, reward: '5% Discount' },
        { label: 'BETTER LUCK', color: '#151320', text: 'rgba(255,255,255,.25)', type: 'lose', discount: 0, fee: 100, reward: 'Better Luck' },
        { label: 'EXTRA CHANCE', color: '#1a8a52', text: '#fff', type: 'win', discount: 0, fee: 100, reward: 'Extra Chance' },
        { label: 'NO DISCOUNT', color: '#12111f', text: 'rgba(255,255,255,.2)', type: 'lose', discount: 0, fee: 100, reward: 'No Discount' },
        { label: '10% OFF', color: '#c04420', text: '#fff', type: 'win', discount: 10, fee: 90, reward: '10% Discount' },
        { label: 'BETTER LUCK', color: '#151320', text: 'rgba(255,255,255,.25)', type: 'lose', discount: 0, fee: 100, reward: 'Better Luck' },
        { label: 'NO DISCOUNT', color: '#12111f', text: 'rgba(255,255,255,.2)', type: 'lose', discount: 0, fee: 100, reward: 'No Discount' },
        { label: 'BETTER LUCK', color: '#151320', text: 'rgba(255,255,255,.25)', type: 'lose', discount: 0, fee: 100, reward: 'Better Luck' },
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
        setupForm();
        setupWheel();
        drawWheel();
        observeReveal();
        setupNavbar();
        restoreState();
    }

    // ── Curtain ─────────────────────────────────────────
    function setupCurtain() {
        // Always show curtain on page load
        mainWrapper.style.opacity = '0';
        mainWrapper.style.transition = 'opacity .8s ease';
        curtainOverlay.addEventListener('click', () => {
            curtainOverlay.classList.add('open');
            setTimeout(() => {
                mainWrapper.style.opacity = '1';
            }, 400);
            setTimeout(() => { curtainOverlay.style.display = 'none'; }, 1600);
        });
    }

    // ── Navbar ──────────────────────────────────────────
    function setupNavbar() {
        const nav = $('#navbar');
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 60);
        });
    }

    // ── Form ────────────────────────────────────────────
    function setupForm() {
        accessWheelBtn.addEventListener('click', () => formModal.classList.add('active'));
        formModalClose.addEventListener('click', () => formModal.classList.remove('active'));
        formModal.addEventListener('click', (e) => {
            if (e.target === formModal) formModal.classList.remove('active');
        });

        playerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = $('#playerName').value.trim();
            const phone = $('#playerPhone').value.trim();
            if (!name || !phone) return;

            playerData = { name, phone };
            localStorage.setItem('oa2_player', JSON.stringify(playerData));

            formModal.classList.remove('active');
            wheelLocked.style.display = 'none';
            wheelActive.style.display = 'flex';
            drawWheel();
        });
    }

    // ── Restore ─────────────────────────────────────────
    function restoreState() {
        if (playerData && !hasSpun) {
            wheelLocked.style.display = 'none';
            wheelActive.style.display = 'flex';
            drawWheel();
        }
        if (hasSpun && passInfo) {
            wheelLocked.style.display = 'none';
            wheelActive.style.display = 'flex';
            spinBtn.disabled = true;
            spinBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> SPIN USED';
            drawWheel();
            showRewardSection();
        }
    }

    // ── Reveal observer ─────────────────────────────────
    function observeReveal() {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.12 });
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }

    // ── Draw Wheel (Grand version) ──────────────────────
    function drawWheel() {
        const w = canvas.width, h = canvas.height;
        const cx = w / 2, cy = h / 2;
        const r = Math.min(cx, cy) - 24;
        ctx.clearRect(0, 0, w, h);

        // Outer decorative rings
        ctx.beginPath(); ctx.arc(cx, cy, r + 18, 0, Math.PI * 2);
        ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(247,162,29,.08)'; ctx.stroke();

        ctx.beginPath(); ctx.arc(cx, cy, r + 12, 0, Math.PI * 2);
        ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(247,162,29,.12)'; ctx.stroke();

        // Segments
        for (let i = 0; i < NUM; i++) {
            const sa = currentAngle + i * ARC, ea = sa + ARC;
            const seg = SEGMENTS[i];

            ctx.beginPath(); ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, sa, ea); ctx.closePath();
            ctx.fillStyle = seg.color; ctx.fill();
            ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.04)'; ctx.stroke();

            // Label
            ctx.save(); ctx.translate(cx, cy); ctx.rotate(sa + ARC / 2);
            ctx.textAlign = 'right'; ctx.fillStyle = seg.text;
            ctx.font = '600 14px "Outfit", sans-serif';
            ctx.fillText(seg.label, r - 24, 5); ctx.restore();
        }

        // Outer ring
        ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(247,162,29,.15)'; ctx.stroke();

        // LED dots (48 for grandeur)
        for (let i = 0; i < 48; i++) {
            const a = (i * Math.PI * 2) / 48;
            const dotR = r + 8;
            const px = cx + dotR * Math.cos(a);
            const py = cy + dotR * Math.sin(a);
            ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            if (i % 2 === 0) {
                ctx.fillStyle = 'rgba(255,209,102,.45)';
                ctx.fill();
                ctx.shadowColor = 'rgba(255,209,102,.3)'; ctx.shadowBlur = 5;
                ctx.fill(); ctx.shadowBlur = 0;
            } else {
                ctx.fillStyle = 'rgba(247,162,29,.25)';
                ctx.fill();
            }
        }

        // Center hub — gradient
        const hubGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 36);
        hubGrad.addColorStop(0, '#f7c948');
        hubGrad.addColorStop(0.4, '#c9982a');
        hubGrad.addColorStop(1, '#1a1428');
        ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2);
        ctx.fillStyle = hubGrad; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(247,162,29,.35)'; ctx.stroke();

        // Inner hub ring
        ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2);
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.stroke();

        // SPIN text
        ctx.fillStyle = '#fff'; ctx.font = '700 18px "Outfit", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SPIN', cx, cy);
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

            // Save to admin entries array
            const allEntries = JSON.parse(localStorage.getItem('oa2_entries') || '[]');
            allEntries.push(passInfo);
            localStorage.setItem('oa2_entries', JSON.stringify(allEntries));

            spinBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> SPIN USED';
            spinNote.innerHTML = wonPrize.type === 'win'
                ? 'You won: <strong>' + wonPrize.reward + '</strong>'
                : 'Better luck in the arena!';

            showResult(wonPrize);
        }

        requestAnimationFrame(tick);
    }

    // Outcome distribution — balanced for fair experience
    function pickPrize() {
        // Dynamic segment selector with weighted variance
        const seed = Math.random() * 1000;
        const variance = Math.round(seed) % 100;

        // Spread: segments 1,3,5,6,7 = lose | 0 = 5% off | 2 = extra chance | 4 = 10% off
        if (variance < 78) {
            // Standard outcomes
            return [1, 3, 5, 6, 7][Math.floor(Math.random() * 5)];
        }
        if (variance < 93) {
            // Minor advantage
            return 0;
        }
        if (variance < 98) {
            // Special — rare
            return 2;
        }
        // Premium — extremely rare
        return 4;
    }

    // ── Result modal ────────────────────────────────────
    function showResult(seg) {
        const isWin = seg.type === 'win';
        resultIcon.innerHTML = isWin
            ? '<i class="fa-solid fa-trophy"></i>'
            : '<i class="fa-solid fa-dice"></i>';
        resultIcon.style.color = isWin ? '#ffd166' : 'rgba(255,255,255,.3)';
        resultTitle.textContent = isWin ? 'Congratulations!' : 'Better Luck Next Time';
        resultMessage.textContent = isWin
            ? 'You unlocked an Arena Advantage!'
            : 'No discount this time, but you\'re still in the game!';
        resultReward.textContent = seg.reward;
        resultReward.style.background = isWin
            ? 'rgba(52, 211, 153, .12)'
            : 'rgba(255, 255, 255, .05)';
        resultReward.style.color = isWin ? '#34d399' : 'rgba(255,255,255,.4)';
        resultFee.textContent = `Entry Fee: ₹${seg.fee}`;
        resultModal.classList.add('active');

        if (isWin) spawnConfetti();
    }

    function spawnConfetti() {
        confettiBox.innerHTML = '';
        const colors = ['#f7a21d', '#e8571e', '#34d399', '#ffd166', '#fff', '#c04420'];
        for (let i = 0; i < 60; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDelay = Math.random() * .8 + 's';
            piece.style.animationDuration = (2 + Math.random() * 1.5) + 's';
            confettiBox.appendChild(piece);
        }
    }

    // ── Pass info ───────────────────────────────────────
    function generatePassInfo(seg) {
        const id = 'OA2-' + Date.now().toString(36).toUpperCase();
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const now = new Date();
        const time = now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
        return {
            name: playerData.name,
            phone: playerData.phone,
            reward: seg.reward,
            fee: seg.fee,
            discount: seg.discount,
            type: seg.type,
            id, code, time
        };
    }

    function showRewardSection() {
        if (!passInfo) return;
        rewardSection.style.display = 'block';
        $('#passName').textContent = passInfo.name;
        $('#passPhone').textContent = passInfo.phone;
        $('#passReward').textContent = passInfo.reward;
        $('#passFee').textContent = '₹' + passInfo.fee;
        $('#passId').textContent = 'ID: ' + passInfo.id;
        $('#passCode').textContent = 'Verification: ' + passInfo.code;
        $('#passTime').textContent = passInfo.time;

        rewardSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ── Download pass as canvas image ───────────────────
    function downloadPass() {
        if (!passInfo) return;
        const c = document.createElement('canvas');
        c.width = 800; c.height = 500;
        const g = c.getContext('2d');

        // Background
        const bgGrad = g.createLinearGradient(0, 0, 800, 500);
        bgGrad.addColorStop(0, '#09080f');
        bgGrad.addColorStop(0.5, '#151421');
        bgGrad.addColorStop(1, '#09080f');
        g.fillStyle = bgGrad; g.fillRect(0, 0, 800, 500);

        // Top accent line
        const topGrad = g.createLinearGradient(0, 0, 800, 0);
        topGrad.addColorStop(0, '#f7a21d');
        topGrad.addColorStop(1, '#e8571e');
        g.fillStyle = topGrad; g.fillRect(0, 0, 800, 4);

        // Title
        g.fillStyle = '#f7a21d'; g.font = '600 14px "Outfit", sans-serif';
        g.textAlign = 'center'; g.fillText('UTKARSH 2026', 400, 50);
        g.fillStyle = '#fff'; g.font = '800 28px "Outfit", sans-serif';
        g.fillText('ARENA REWARD PASS', 400, 85);
        g.fillStyle = 'rgba(255,255,255,.4)'; g.font = '400 13px "Outfit", sans-serif';
        g.fillText('Wheel of Fortune ft Outlast Arena 2.0', 400, 108);

        // Divider
        const divGrad = g.createLinearGradient(200, 0, 600, 0);
        divGrad.addColorStop(0, 'transparent');
        divGrad.addColorStop(0.5, 'rgba(247,162,29,.4)');
        divGrad.addColorStop(1, 'transparent');
        g.fillStyle = divGrad; g.fillRect(200, 125, 400, 1);

        // Details
        g.textAlign = 'left';
        const rows = [
            { label: 'Player', value: passInfo.name },
            { label: 'Phone', value: passInfo.phone },
            { label: 'Reward', value: passInfo.reward, color: passInfo.type === 'win' ? '#34d399' : 'rgba(255,255,255,.5)' },
            { label: 'Entry Fee', value: '₹' + passInfo.fee, color: '#f7a21d' },
        ];
        let y = 170;
        rows.forEach(row => {
            g.fillStyle = 'rgba(255,255,255,.45)'; g.font = '500 13px "Outfit", sans-serif';
            g.fillText(row.label, 120, y);
            g.fillStyle = row.color || '#fff'; g.font = '700 16px "Outfit", sans-serif';
            g.fillText(row.value, 120, y + 22);
            y += 60;
        });

        // Right side codes
        g.textAlign = 'right';
        g.fillStyle = 'rgba(255,255,255,.3)'; g.font = '500 12px "Outfit", sans-serif';
        g.fillText('ID: ' + passInfo.id, 680, 180);
        g.fillText('Verification: ' + passInfo.code, 680, 200);
        g.fillText(passInfo.time, 680, 220);

        // Bottom divider
        g.fillStyle = divGrad; g.fillRect(200, 420, 400, 1);

        // Footer
        g.textAlign = 'center';
        g.fillStyle = 'rgba(255,255,255,.3)'; g.font = '400 11px "Outfit", sans-serif';
        g.fillText('Show this pass during registration to claim your reward', 400, 460);

        // Download
        const link = document.createElement('a');
        link.download = `Arena_Reward_Pass_${passInfo.name.replace(/\s+/g, '_')}.png`;
        link.href = c.toDataURL('image/png');
        link.click();
    }

    // ── Start ──────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', init);
})();
