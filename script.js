/* ============================================================
   Wheel of Fortune ft Outlast Arena 2.0 — script.js (REDESIGNED)
   ============================================================ */
(() => {
    'use strict';

    // ── Segments ────────────────────────────────────────
    const SEGMENTS = [
        { label: '5% OFF', color: '#d4841a', text: '#fff', type: 'win', discount: 5, fee: 95, reward: '5% Discount' },
        { label: 'BETTER LUCK NEXT TIME', color: '#151320', text: 'rgba(255,255,255,.25)', type: 'lose', discount: 0, fee: 100, reward: 'Better Luck Next Time' },
        { label: '10% OFF', color: '#c04420', text: '#fff', type: 'win', discount: 10, fee: 90, reward: '10% Discount' },
        { label: '5% OFF', color: '#d4841a', text: '#fff', type: 'win', discount: 5, fee: 95, reward: '5% Discount' },
        { label: 'EXTRA CHANCE', color: '#1a8a52', text: '#fff', type: 'win', discount: 0, fee: 100, reward: 'Extra Chance' },
        { label: '5% OFF', color: '#d4841a', text: '#fff', type: 'win', discount: 5, fee: 95, reward: '5% Discount' },
        { label: '10% OFF', color: '#c04420', text: '#fff', type: 'win', discount: 10, fee: 90, reward: '10% Discount' },
        { label: 'BETTER LUCK NEXT TIME', color: '#151320', text: 'rgba(255,255,255,.25)', type: 'lose', discount: 0, fee: 100, reward: 'Better Luck Next Time' },
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
        setupSecurity();
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
    let userIP = '0.0.0.0';

    // Fetch IP on load
    fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => { userIP = data.ip; })
        .catch(err => console.warn('IP Fetch Error:', err));

    function setupForm() {
        accessWheelBtn.addEventListener('click', () => formModal.classList.add('active'));
        formModalClose.addEventListener('click', () => formModal.classList.remove('active'));
        formModal.addEventListener('click', (e) => {
            if (e.target === formModal) formModal.classList.remove('active');
        });

        playerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const idxButton = playerForm.querySelector('button[type="submit"]');
            const originalText = idxButton.innerHTML;
            idxButton.disabled = true;
            idxButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking...';

            const name = $('#playerName').value.trim();
            const phone = $('#playerPhone').value.trim();

            if (!name || !phone) {
                idxButton.disabled = false;
                idxButton.innerHTML = originalText;
                return;
            }

            // Check duplicates in Supabase
            if (sbClient) {
                // First try checking both Phone AND IP (Requires updated schema)
                let { count, error } = await sbClient
                    .from('entries')
                    .select('*', { count: 'exact', head: true })
                    .or(`phone.eq.${phone},ip_address.eq.${userIP}`);

                // If error (e.g., missing ip_address column), try checking JUST phone
                if (error) {
                    console.warn('Complex check failed (likely schema mismatch), retrying phone only:', error);
                    const phoneCheck = await sbClient
                        .from('entries')
                        .select('*', { count: 'exact', head: true })
                        .eq('phone', phone);

                    count = phoneCheck.count;
                    error = phoneCheck.error;
                }

                if (count > 0) {
                    alert('You have already used your free spin from this device or phone number!');
                    idxButton.disabled = false;
                    idxButton.innerHTML = originalText;
                    return;
                }
            }

            // Proceed if no duplicates
            playerData = { name, phone, ip: userIP };
            localStorage.setItem('oa2_player', JSON.stringify(playerData));

            formModal.classList.remove('active');
            wheelLocked.style.display = 'none';
            wheelActive.style.display = 'flex';
            drawWheel();

            idxButton.disabled = false;
            idxButton.innerHTML = originalText;
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

            if (seg.label === 'BETTER LUCK NEXT TIME') {
                ctx.font = '600 12px "Outfit", sans-serif';
                ctx.fillText('BETTER LUCK', r - 24, -2);
                ctx.fillText('NEXT TIME', r - 24, 14);
            } else {
                ctx.font = '600 14px "Outfit", sans-serif';
                ctx.fillText(seg.label, r - 24, 5);
            }
            ctx.restore();
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

        // WEIGHTED PROBABILITY LOGIC
        // 5% (3 segments) -> High
        // 10% (2 segments) -> High
        // Better Luck (2 segments) -> Medium
        // Extra Chance (1 segment) -> Very Low

        // Improved Weighted Selection:
        // 1. Pick a type based on probability
        const rand = Math.random() * 100;
        let targetType = '';

        if (rand < 30) targetType = '5% OFF';           // 0-30 (30%)
        else if (rand < 50) targetType = '10% OFF';     // 30-50 (20%)
        else if (rand < 99) targetType = 'BETTER LUCK'; // 50-99 (49%)
        else targetType = 'EXTRA CHANCE';               // 99-100 (1%)

        // 2. Find all indices matching this type
        const matchingIndices = [];
        SEGMENTS.forEach((seg, i) => {
            if (targetType === 'BETTER LUCK' && seg.label.includes('BETTER LUCK')) matchingIndices.push(i);
            else if (seg.label === targetType) matchingIndices.push(i);
        });

        // 3. Pick random index from matches
        // Fallback to random if something goes wrong (shouldn't happen)
        let winnerIndex;
        if (matchingIndices.length > 0) {
            winnerIndex = matchingIndices[Math.floor(Math.random() * matchingIndices.length)];
        } else {
            winnerIndex = Math.floor(Math.random() * NUM);
        }

        wonPrize = SEGMENTS[winnerIndex];

        // Calculate stop angle
        // Arc index is from 0 to NUM-1.
        // Angle to stop at center of segment:
        // We want pointer (at top, -PI/2) to point to center of segment.
        // The segment 'i' is at angle [current + i*ARC, current + (i+1)*ARC]
        // We need to rotate such that the center of segment 'i' ends up at -PI/2 (270 deg)

        // Current Rotation + Delta = Final Rotation
        // Final Rotation % 2PI = Target Position

        const segmentCenter = (winnerIndex * ARC) + (ARC / 2);

        // Target: We want segmentCenter + finalRotation = 3 * PI / 2 (270 deg)
        // So finalRotation = (3PI/2 - segmentCenter) mod 2PI
        // But we are at currentAngle. We want to find delta such that:
        // (currentAngle + delta) % 2PI = targetPointer - segmentCenter

        let targetPointer = 3 * Math.PI / 2; // 270 degrees (Top)
        let targetRotation = targetPointer - segmentCenter;

        // Current normalized angle
        let currentNorm = currentAngle % (2 * Math.PI);
        if (currentNorm < 0) currentNorm += 2 * Math.PI;

        // Calculate delta needed
        let delta = targetRotation - currentNorm;

        // Normalize delta to be positive (rotate forward)
        // We want to force it to be positive to spin clockwise/forward
        while (delta < 0) delta += 2 * Math.PI;

        // Add random full spins (5 to 8)
        const fullSpins = 5 + Math.floor(Math.random() * 4);
        const spinAngle = fullSpins * 2 * Math.PI;

        let finalTarget = currentAngle + delta + spinAngle;

        // Add randomness within the segment (±35% of arc) to be safe
        const safeZone = ARC * 0.7;
        const randomOffset = (Math.random() - 0.5) * safeZone;
        finalTarget += randomOffset;

        // Animate
        animateWheel(currentAngle, finalTarget, 5000 + Math.random() * 1000);
    }

    // Helper function for animation (extracted from original spin logic)
    function animateWheel(startAngle, endAngle, duration) {
        const t0 = performance.now();

        function tick(now) {
            const p = Math.min((now - t0) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            currentAngle = startAngle + (endAngle - startAngle) * ease;
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
                    ip_address: passInfo.ip,
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
        resultTitle.textContent = isWin ? 'Congratulations!' : seg.reward;
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
            ip: playerData.ip,
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
        g.fillText('Wheel of Fortune Outlast Arena 2.0', 400, 108);

        // Divider
        const divGrad = g.createLinearGradient(200, 0, 600, 0);
        divGrad.addColorStop(0, 'rgba(255,255,255,0)');
        divGrad.addColorStop(0.5, 'rgba(255,255,255,0.3)');
        divGrad.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = divGrad; g.fillRect(150, 130, 500, 1);

        // Details
        g.textAlign = 'left';
        g.font = '600 16px "Inter", sans-serif'; g.fillStyle = '#aaa';
        g.fillText('PLAYER', 150, 180);
        g.font = '500 24px "Outfit", sans-serif'; g.fillStyle = '#fff';
        g.fillText(passInfo.name, 150, 215);

        g.font = '600 16px "Inter", sans-serif'; g.fillStyle = '#aaa';
        g.fillText('PHONE', 450, 180);
        g.font = '500 24px "Outfit", sans-serif'; g.fillStyle = '#fff';
        g.fillText(passInfo.phone, 450, 215);

        g.font = '600 16px "Inter", sans-serif'; g.fillStyle = '#aaa';
        g.fillText('REWARD', 150, 280);
        g.font = '700 32px "Outfit", sans-serif'; g.fillStyle = '#34d399';
        g.fillText(passInfo.reward, 150, 325);

        g.font = '600 16px "Inter", sans-serif'; g.fillStyle = '#aaa';
        g.fillText('FEE', 450, 280);
        g.font = '700 32px "Outfit", sans-serif'; g.fillStyle = '#fff';
        g.fillText('₹' + passInfo.fee, 450, 325);

        // Footer codes
        g.font = '500 14px "Space Grotesk", sans-serif'; g.fillStyle = '#555';
        g.textAlign = 'center';
        g.fillText(`ID: ${passInfo.id}  •  VERIFICATION: ${passInfo.code}  •  ${passInfo.time}`, 400, 460);

        // Download
        const link = document.createElement('a');
        link.download = `ArenaPass_${passInfo.name.replace(/\s+/g, '_')}.png`;
        link.href = c.toDataURL('image/png');
        link.click();
    }

    // ── Security & Anti-Tamper ──────────────────────────
    function setupSecurity() {
        // 1. Disable Right Click
        document.addEventListener('contextmenu', e => e.preventDefault());

        // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
        document.addEventListener('keydown', e => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
                (e.ctrlKey && e.key === 'U')
            ) {
                e.preventDefault();
            }
        });

        // 3. Mutation Observer to prevent Reward Text Tampering
        const observer = new MutationObserver((mutations) => {
            if (!wonPrize) return;
            mutations.forEach(mutation => {
                const target = mutation.target;
                if (target.id === 'resultReward' || target.id === 'passReward') {
                    if (target.textContent !== wonPrize.reward) {
                        target.textContent = wonPrize.reward; // Revert immediately
                    }
                }
                if (target.id === 'resultTitle') {
                    const expected = wonPrize.type === 'win' ? 'Congratulations!' : wonPrize.reward;
                    if (target.textContent !== expected) {
                        target.textContent = expected;
                    }
                }
            });
        });

        const config = { childList: true, subtree: true, characterData: true };
        const resRewardEl = document.getElementById('resultReward');
        const passRewardEl = document.getElementById('passReward');
        const resTitleEl = document.getElementById('resultTitle');

        if (resRewardEl) observer.observe(resRewardEl, config);
        if (passRewardEl) observer.observe(passRewardEl, config);
        if (resTitleEl) observer.observe(resTitleEl, config);

        // 4. Console Clearing & Debugger Loop (Annoy Script Kiddies)
        setInterval(() => {
            // console.clear(); // Keep console clean to hide logic
            // debugger; // Pauses execution if dev tools are open
        }, 2000);
        // Commented out debugger for now to avoid accidental annoyance during dev, 
        // enable `debugger` line for production.
    }

    // Start
    init();
})();

