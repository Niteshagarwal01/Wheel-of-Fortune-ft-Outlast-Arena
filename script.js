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
    const scene = $('#scene');
    const curtain = $('#curtain');
    const starter = $('#starter');
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

    // ── Ambient Background Sound (Haunted Carnival / Calliope) ──
    let ambientCtx = null;
    function startAmbientSound() {
        if (ambientCtx) return;
        try {
            ambientCtx = new (window.AudioContext || window.webkitAudioContext)();
            const masterGain = ambientCtx.createGain();
            masterGain.gain.value = 0.15; // Moderate volume
            masterGain.connect(ambientCtx.destination);

            // Melody Sequencer (Simple Waltz in C Minor)
            const bpm = 110;
            const beatDur = 60 / bpm;
            const notes = [
                // Bar 1
                { f: 261.63, t: 0, d: 0.5 },    // C4
                { f: 311.13, t: 1, d: 0.25 },   // Eb4
                { f: 392.00, t: 2, d: 0.25 },   // G4
                // Bar 2
                { f: 311.13, t: 3, d: 0.5 },    // Eb4
                { f: 261.63, t: 4, d: 0.25 },   // C4
                { f: 196.00, t: 5, d: 0.25 },   // G3
                // Bar 3
                { f: 207.65, t: 6, d: 0.5 },    // Ab3
                { f: 261.63, t: 7, d: 0.25 },   // C4
                { f: 311.13, t: 8, d: 0.25 },   // Eb4
                // Bar 4
                { f: 293.66, t: 9, d: 1.0 },    // D4

                // Bar 5
                { f: 261.63, t: 10, d: 0.5 },   // C4
                { f: 311.13, t: 11, d: 0.25 },  // Eb4
                { f: 392.00, t: 12, d: 0.25 },  // G4
                // Bar 6
                { f: 415.30, t: 13, d: 0.5 },   // Ab4
                { f: 392.00, t: 14, d: 0.25 },  // G4
                { f: 349.23, t: 15, d: 0.25 },  // F4
                // Bar 7
                { f: 311.13, t: 16, d: 0.5 },   // Eb4
                { f: 293.66, t: 17, d: 0.25 },  // D4
                { f: 246.94, t: 18, d: 0.25 },  // B3
                // Bar 8
                { f: 261.63, t: 19, d: 1.0 },   // C4
            ];

            const loopDuration = 20 * beatDur;

            function playNote(freq, time, dur) {
                const osc = ambientCtx.createOscillator();
                const gain = ambientCtx.createGain();

                // Calliope-style: Triangle/Sine blend with slight detune
                osc.type = 'triangle';
                osc.frequency.value = freq;

                // Slight random detune for "old organ" feel
                osc.detune.value = (Math.random() - 0.5) * 15;

                // Organ envelope (quick attack, full sustain, quick release)
                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(0.2, time + 0.05);
                gain.gain.setValueAtTime(0.2, time + dur - 0.05);
                gain.gain.linearRampToValueAtTime(0, time + dur);

                osc.connect(gain);
                gain.connect(masterGain);

                osc.start(time);
                osc.stop(time + dur + 0.1);
            }

            function scheduleLoop() {
                const now = ambientCtx.currentTime;
                // Add a small lookahead buffer to keep loop smooth
                notes.forEach(n => {
                    playNote(n.f, now + n.t * beatDur, n.d * beatDur);
                    // Add subtle harmony (lower octave) for richness
                    playNote(n.f * 0.5, now + n.t * beatDur, n.d * beatDur);
                });
            }

            scheduleLoop();
            setInterval(scheduleLoop, loopDuration * 1000);

            // Background "Fairground" Noise (Pink Noise + Low Pass)
            const noise = ambientCtx.createBufferSource();
            const bufferSize = 2 * ambientCtx.sampleRate;
            const noiseBuffer = ambientCtx.createBuffer(1, bufferSize, ambientCtx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            let lastOut = 0; // Initialize lastOut for the pink noise generator
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5;
            }

            noise.buffer = noiseBuffer;
            noise.loop = true;

            const noiseFilter = ambientCtx.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.value = 400; // Muffled distant crowd/wind
            const noiseGain = ambientCtx.createGain();
            noiseGain.gain.value = 0.05; // Very subtle

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(masterGain);
            noise.start();

        } catch (e) { /* Audio not supported */ }
    }

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
    function playCurtainSwoosh() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const now = audioCtx.currentTime;
            const duration = 1.5; // Synced with CSS animation
            const sampleRate = audioCtx.sampleRate;

            // Heavy fabric swoosh — noise with shaped envelope
            const bufSize = sampleRate * duration;
            const buffer = audioCtx.createBuffer(2, bufSize, sampleRate);
            for (let ch = 0; ch < 2; ch++) {
                const data = buffer.getChannelData(ch);
                for (let i = 0; i < bufSize; i++) {
                    const t = i / sampleRate;
                    // Sharper attack for sync
                    const hit = Math.exp(-t * 4.0) * Math.min(t * 20, 1);
                    const tail = Math.exp(-t * 1.5) * 0.3;
                    const env = hit + tail;
                    data[i] = (Math.random() * 2 - 1) * env * 0.4; // Louder
                }
            }
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;

            // Sweeping bandpass for fabric movement feel
            const bpf = audioCtx.createBiquadFilter();
            bpf.type = 'bandpass';
            bpf.frequency.setValueAtTime(800, now);
            bpf.frequency.exponentialRampToValueAtTime(100, now + duration);
            bpf.Q.value = 0.6;

            // Low rumble layer
            const rumble = audioCtx.createOscillator();
            rumble.type = 'sine';
            rumble.frequency.setValueAtTime(60, now);
            rumble.frequency.exponentialRampToValueAtTime(30, now + duration);
            const rumbleGain = audioCtx.createGain();
            rumbleGain.gain.setValueAtTime(0.3, now);
            rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            const masterGain = audioCtx.createGain();
            masterGain.gain.setValueAtTime(0.8, now);
            masterGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

            noise.connect(bpf);
            bpf.connect(masterGain);
            rumble.connect(rumbleGain);
            rumbleGain.connect(masterGain);
            masterGain.connect(audioCtx.destination);

            noise.start();
            rumble.start();
            rumble.stop(now + duration);
            noise.onended = () => audioCtx.close();
        } catch (e) { /* silently ignore */ }
    }

    let curtainOpened = false;
    function openCurtain() {
        if (curtainOpened) return;
        curtainOpened = true;

        playCurtainSwoosh();
        window.scrollTo(0, 0); // Ensure we start at top

        // Animate curtain open
        curtain.className = 'open';
        // scene.className = 'expand'; // Removed to prevent "second app" feel
        starter.className = 'fade-out';

        setTimeout(() => { starter.style.display = 'none'; }, 500);

        // Fade in main content immediately
        setTimeout(() => {
            mainWrapper.style.opacity = '1';
            startAmbientSound();
        }, 300);

        // Remove scene overlay after animation
        setTimeout(() => { scene.style.display = 'none'; }, 1600);
    }

    function setupCurtain() {
        window.scrollTo(0, 0); // Reset scroll on load
        mainWrapper.style.opacity = '0';
        mainWrapper.style.transition = 'opacity 1s ease';

        // Enter key trigger
        document.addEventListener('keydown', (e) => {
            if (e.keyCode === 13) openCurtain();
        });

        // Click trigger
        scene.addEventListener('click', openCurtain);
        starter.addEventListener('click', openCurtain);
    }

    // ── Navbar ──────────────────────────────────────────
    // ── Navbar ──────────────────────────────────────────
    function setupNavbar() {
        const nav = $('#navbar');
        const navToggle = $('#navToggle');
        const navLinks = $('#navLinks');
        const navIcon = navToggle.querySelector('i');

        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 60);
        });

        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isActive = navLinks.classList.contains('active');
            navIcon.className = isActive ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navIcon.className = 'fa-solid fa-bars';
            });
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

            // Save to Supabase
            if (sbClient) {
                sbClient.from('entries').insert([{
                    name: passInfo.name,
                    phone: passInfo.phone,
                    reward: passInfo.reward,
                    fee: passInfo.fee,
                    type: passInfo.type,
                    reward_id: passInfo.id,
                    code: passInfo.code,
                    timestamp: new Date().toISOString()
                }]).then(({ error }) => {
                    if (error) console.error('Supabase Error:', error);
                });
            } else {
                console.warn('Supabase client not initialized. Check config.js');
                // Fallback to local storage for demo/offline
                const allEntries = JSON.parse(localStorage.getItem('oa2_entries') || '[]');
                allEntries.push(passInfo);
                localStorage.setItem('oa2_entries', JSON.stringify(allEntries));
            }

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
