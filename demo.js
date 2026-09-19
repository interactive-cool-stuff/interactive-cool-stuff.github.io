/* ============================================================
   KARNAMEH DEMO — mock backend + UI wiring
   ============================================================ */
(function () {
    'use strict';

    /* ---------- DATA ---------- */
    const state = {
        students: [
            { id: 1, first: 'بردیا',     last: 'طوفانی موقر', cls: '7a' },
            { id: 2, first: 'فرسام',     last: 'فرهادی',      cls: '7a' },
            { id: 3, first: 'محمد مهدی', last: 'اکبری',       cls: '7a' },
            { id: 4, first: 'سارا',      last: 'محمدی',       cls: '7b' },
            { id: 5, first: 'علی',       last: 'رضایی',       cls: '7b' },
            { id: 6, first: 'مهدی',      last: 'کریمی',       cls: '8a' },
            { id: 7, first: 'فاطمه',     last: 'حسینی',       cls: '8a' },
            { id: 8, first: 'رضا',       last: 'احمدی',       cls: '7a' },
        ],
        courses: [
            { id: 'math',       title: 'ریاضی',       teacher: 'مهدی نوروزی',  level: 'هفتم', published: true,  quizzes: 8 },
            { id: 'physics',    title: 'فیزیک',       teacher: 'محسن کیهانی',  level: 'هشتم', published: true,  quizzes: 6 },
            { id: 'literature', title: 'ادبیات',      teacher: 'سمیه رستمی',   level: 'هفتم', published: true,  quizzes: 4 },
            { id: 'science',    title: 'علوم تجربی',  teacher: 'حسین موسوی',   level: 'هفتم', published: true,  quizzes: 5 },
            { id: 'english',    title: 'زبان انگلیسی', teacher: 'نازنین فلاحی', level: 'هفتم', published: true,  quizzes: 3 },
            { id: 'arabic',     title: 'عربی',        teacher: 'سعید نوری',    level: 'هشتم', published: false, quizzes: 2 },
        ],
        quizzes: [
            { id: 1, title: 'کوییز اول ریاضی',       course: 'ریاضی',       date: '۱۴۰۴/۰۵/۱۲', max: 20 },
            { id: 2, title: 'کوییز دوم ریاضی',       course: 'ریاضی',       date: '۱۴۰۴/۰۶/۰۳', max: 20 },
            { id: 3, title: 'کوییز فیزیک — حرکت',     course: 'فیزیک',       date: '۱۴۰۴/۰۵/۲۰', max: 10 },
            { id: 4, title: 'کوییز ادبیات — شعر',     course: 'ادبیات',      date: '۱۴۰۴/۰۵/۲۵', max: 15 },
            { id: 5, title: 'کوییز علوم — سلول',      course: 'علوم تجربی',  date: '۱۴۰۴/۰۶/۰۱', max: 10 },
        ],
    };

    const CLASS_NAMES = {
        '7a': 'پایه هفتم الف',
        '7b': 'پایه هفتم ب',
        '8a': 'پایه هشتم الف',
    };

    /* ---------- HELPERS ---------- */
    const $  = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const toFa = (n) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d]);

    const esc = (s) => String(s).replace(/[&<>"']/g, c =>
        ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

    /* ---------- NAV / VIEW SWITCHER ---------- */
    function switchView(name) {
        $$('.nav-link').forEach(a => a.classList.toggle('is-active', a.dataset.view === name));
        $$('.view').forEach(v => v.classList.toggle('is-active', v.dataset.view === name));

        if (name === 'dashboard') animateCounters();
        if (name === 'students')  renderStudents();
        if (name === 'courses')   renderCourses();
        if (name === 'quizzes')   renderQuizzes();
    }

    $$('.nav-link[data-view]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(a.dataset.view);
        });
    });

    // Quick-link cards inside dashboard
    $$('.quick-link-card[data-view]').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(card.dataset.view);
        });
    });

    /* ---------- COUNTERS ---------- */
    function animateCounters() {
        $$('[data-count]').forEach(el => {
            if (el.dataset.animated === '1') return;
            el.dataset.animated = '1';
            const target = parseInt(el.dataset.count, 10) || 0;
            const start = performance.now();
            const duration = 900;
            function tick(now) {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = toFa(Math.round(target * eased));
                if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    }

    /* ---------- STUDENTS ---------- */
    const studentsTbody = $('#students-tbody');
    const studentSearch = $('#student-search');
    const studentClassFilter = $('#student-class-filter');

    function renderStudents() {
        if (!studentsTbody) return;
        const q   = (studentSearch?.value || '').trim().toLowerCase();
        const cls = studentClassFilter?.value || '';

        const list = state.students.filter(s =>
            (!q || s.first.toLowerCase().includes(q) || s.last.toLowerCase().includes(q)) &&
            (!cls || s.cls === cls)
        );

        if (!list.length) {
            studentsTbody.innerHTML = `<tr><td colspan="5" class="table__empty">هیچ دانش‌آموزی یافت نشد</td></tr>`;
            return;
        }

        studentsTbody.innerHTML = list.map((s, i) => `
            <tr>
                <td>${toFa(i + 1)}</td>
                <td>${esc(s.first)}</td>
                <td>${esc(s.last)}</td>
                <td>${CLASS_NAMES[s.cls] || s.cls}</td>
                <td>
                    <button class="btn-sm-icon btn-sm-icon--danger" data-del-student="${s.id}" title="حذف">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        studentsTbody.querySelectorAll('[data-del-student]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.delStudent, 10);
                state.students = state.students.filter(s => s.id !== id);
                renderStudents();
                syncReportDropdown();
                if (window.Burst) {
                    const r = btn.getBoundingClientRect();
                    window.Burst.fire(r.left + r.width/2, r.top + r.height/2, { color: 'pink', count: 20 });
                }
            });
        });
    }

    studentSearch?.addEventListener('input', renderStudents);
    studentClassFilter?.addEventListener('change', renderStudents);

    // Add student via modal
    const modalEl = document.getElementById('mainModal');
    const modal   = new bootstrap.Modal(modalEl);

    $('#student-add-btn')?.addEventListener('click', () => {
        $('#modal-title').textContent = 'افزودن دانش‌آموز جدید';
        $('#modal-body').innerHTML = `
            <div class="mb-3">
                <label class="form-label">نام</label>
                <input type="text" class="form-control" id="new-first">
            </div>
            <div class="mb-3">
                <label class="form-label">نام خانوادگی</label>
                <input type="text" class="form-control" id="new-last">
            </div>
            <div class="mb-3">
                <label class="form-label">کلاس</label>
                <select class="form-control" id="new-cls">
                    <option value="7a">پایه هفتم الف</option>
                    <option value="7b">پایه هفتم ب</option>
                    <option value="8a">پایه هشتم الف</option>
                </select>
            </div>
            <button class="btn btn-primary w-100" id="new-save">
                <i class="bi bi-check-circle"></i> ذخیره
            </button>
        `;
        modal.show();

        $('#new-save').addEventListener('click', () => {
            const first = $('#new-first').value.trim();
            const last  = $('#new-last').value.trim();
            const cls   = $('#new-cls').value;
            if (!first || !last) return;
            const newId = Math.max(0, ...state.students.map(s => s.id)) + 1;
            state.students.push({ id: newId, first, last, cls });
            modal.hide();
            renderStudents();
            syncReportDropdown();
        });
    });

    /* ---------- COURSES ---------- */
    function renderCourses() {
        const grid = $('#courses-grid');
        if (!grid) return;
        grid.innerHTML = state.courses.map(c => `
            <div class="col-md-6 col-lg-4">
                <div class="course-card">
                    <div class="course-card__title">${esc(c.title)}</div>
                    <div class="course-card__meta">معلم: ${esc(c.teacher)} · پایه: ${esc(c.level)}</div>
                    <div class="course-card__footer">
                        <span><i class="bi bi-pencil-square"></i> ${toFa(c.quizzes)} کوییز</span>
                        ${c.published
                            ? '<span class="course-card__badge">منتشر شده</span>'
                            : '<span class="course-card__badge course-card__badge--draft">پیش‌نویس</span>'}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /* ---------- QUIZZES ---------- */
    function renderQuizzes() {
        const tbody = $('#quizzes-tbody');
        if (!tbody) return;
        tbody.innerHTML = state.quizzes.map((q, i) => `
            <tr>
                <td>${toFa(i + 1)}</td>
                <td>${esc(q.title)}</td>
                <td>${esc(q.course)}</td>
                <td>${esc(q.date)}</td>
                <td>${toFa(q.max)}</td>
                <td>
                    <button class="btn-sm-icon" data-quiz-grade="${q.id}" title="ثبت نمرات">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('[data-quiz-grade]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.quizGrade, 10);
                const quiz = state.quizzes.find(q => q.id === id);
                $('#modal-title').textContent = 'ثبت نمرات: ' + quiz.title;
                $('#modal-body').innerHTML = `
                    <p class="text-muted small mb-3">
                        در سامانه‌ی واقعی، اینجا لیست کامل دانش‌آموزان با فیلد ورود نمره نمایش داده می‌شود.
                    </p>
                    ${state.students.slice(0, 5).map(s => `
                        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                            <span>${esc(s.first)} ${esc(s.last)}</span>
                            <input type="number" class="form-control" style="max-width:100px" placeholder="نمره" min="0" max="${quiz.max}">
                        </div>
                    `).join('')}
                    <button class="btn btn-primary w-100 mt-3">
                        <i class="bi bi-check-circle"></i> ذخیره (نمایشی)
                    </button>
                `;
                modal.show();
            });
        });
    }

    /* ---------- PREDICT ---------- */
    const predictClass   = $('#predict-class');
    const predictStudent = $('#predict-student');
    const predictCourse  = $('#predict-course');
    const predictBtn     = $('#predict-btn');
    const predictResult  = $('#predict-result');

    function refreshPredictStudents() {
        if (!predictStudent) return;
        const cls = predictClass.value;
        const list = state.students.filter(s => s.cls === cls);
        predictStudent.innerHTML = '<option value="">— انتخاب دانش‌آموز —</option>' +
            list.map(s => `<option value="${s.id}">${esc(s.first)} ${esc(s.last)}</option>`).join('');
        predictStudent.disabled = !cls;
        updatePredictBtn();
    }

    function updatePredictBtn() {
        predictBtn.disabled = !(predictClass.value && predictStudent.value && predictCourse.value);
    }

    predictClass?.addEventListener('change', refreshPredictStudents);
    predictStudent?.addEventListener('change', updatePredictBtn);
    predictCourse?.addEventListener('change', updatePredictBtn);

    predictBtn?.addEventListener('click', () => {
        const sid = parseInt(predictStudent.value, 10);
        const cid = predictCourse.value;
        const student = state.students.find(s => s.id === sid);
        const course  = state.courses.find(c => c.id === cid);
        if (!student || !course) return;

        predictResult.innerHTML = `
            <div class="empty-state">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-3 text-muted">در حال تحلیل با مدل رگرسیون...</p>
            </div>
        `;

        setTimeout(() => {
            const predicted = +(14 + Math.random() * 4).toFixed(2);
            const margin = +(1.2 + Math.random() * 0.8).toFixed(2);
            const lower = Math.max(0, +(predicted - margin).toFixed(2));
            const upper = Math.min(20, +(predicted + margin).toFixed(2));

            const features = {
                'نمره‌ی مستمر':  +(13 + Math.random() * 5).toFixed(1),
                'نمره‌ی امتحان': +(12 + Math.random() * 6).toFixed(1),
                'میانگین کوییز': +(11 + Math.random() * 7).toFixed(1),
            };

            predictResult.innerHTML = `
                <div class="predict-score">
                    <div class="predict-score__label">نمره‌ی نهایی پیش‌بینی‌شده</div>
                    <div class="predict-score__value">${toFa(predicted)}</div>
                    <div class="predict-score__ci">بازه‌ی اطمینان ۹۵٪: ${toFa(lower)} — ${toFa(upper)}</div>
                </div>
                <div class="text-center mb-2" style="font-size:0.85rem;color:#64748b">
                    دانش‌آموز: <strong>${esc(student.first)} ${esc(student.last)}</strong>
                    · درس: <strong>${esc(course.title)}</strong>
                </div>
                <div class="predict-bars">
                    ${Object.entries(features).map(([k, v]) => `
                        <div class="predict-bar">
                            <span>${k}</span>
                            <div class="predict-bar__track">
                                <div class="predict-bar__fill" style="width:${(v / 20 * 100).toFixed(0)}%"></div>
                            </div>
                            <span class="predict-bar__value">${toFa(v)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }, 900);
    });

    /* ---------- REPORT ---------- */
    const reportStudent  = $('#report-student');
    const reportGenerate = $('#report-generate');
    const reportPreview  = $('#report-preview');

    function syncReportDropdown() {
        if (!reportStudent) return;
        const current = reportStudent.value;
        reportStudent.innerHTML = '<option value="">— انتخاب دانش‌آموز —</option>' +
            state.students.map(s => `<option value="${s.id}">${esc(s.first)} ${esc(s.last)}</option>`).join('');
        if (current) reportStudent.value = current;
        reportGenerate.disabled = !reportStudent.value;
    }

    reportStudent?.addEventListener('change', () => {
        reportGenerate.disabled = !reportStudent.value;
    });

    reportGenerate?.addEventListener('click', () => {
        const sid = parseInt(reportStudent.value, 10);
        const student = state.students.find(s => s.id === sid);
        if (!student) return;

        reportPreview.innerHTML = `
            <div class="empty-state">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-3 text-muted">در حال تولید کارنامه...</p>
            </div>
        `;

        setTimeout(() => {
            const rows = ['ریاضی', 'فیزیک', 'ادبیات', 'علوم تجربی'].map(c => {
                const m = +(13 + Math.random() * 6).toFixed(1);
                const e = +(12 + Math.random() * 7).toFixed(1);
                const f = +((m + e) / 2).toFixed(1);
                return `<div class="report-paper__row">
                    <span>${c}</span>
                    <span>${toFa(m)}</span>
                    <span>${toFa(f)}</span>
                </div>`;
            }).join('');

            const finalScore = +(15 + Math.random() * 4).toFixed(2);

            reportPreview.innerHTML = `
                <div class="report-paper">
                    <div class="report-paper__head">
                        <div class="report-paper__title">کارنامه‌ی تحصیلی</div>
                        <div class="report-paper__meta">نیم‌سال اول ۱۴۰۴ — ۱۴۰۵</div>
                    </div>
                    <div class="report-paper__student">
                        دانش‌آموز: ${esc(student.first)} ${esc(student.last)} — ${CLASS_NAMES[student.cls]}
                    </div>
                    <div class="report-paper__row report-paper__row--head">
                        <span>درس</span><span>مستمر</span><span>نهایی</span>
                    </div>
                    ${rows}
                    <div class="report-paper__final">
                        <span>معدل کل</span>
                        <span class="report-paper__final-value">${toFa(finalScore)}</span>
                    </div>
                </div>
            `;

            if (window.Burst) {
                const r = reportGenerate.getBoundingClientRect();
                window.Burst.fire(r.left + r.width/2, r.top + r.height/2, { color: 'green', count: 40 });
            }
        }, 1100);
    });

    /* ---------- 3D TILT ---------- */
    function attachTilt(el) {
        if (el.dataset.tilt === '1') return;
        el.dataset.tilt = '1';
        const MAX = 6;
        el.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width  - 0.5;
            const y = (e.clientY - r.top ) / r.height - 0.5;
            el.style.transform =
                `perspective(1000px) rotateY(${x * MAX}deg) rotateX(${-y * MAX}deg) translateY(-4px)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    }

    /* ---------- PARTICLE BURST (lightweight) ---------- */
    window.Burst = window.Burst || (function () {
        const canvas = document.createElement('canvas');
        Object.assign(canvas.style, {
            position: 'fixed', inset: '0',
            width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: '99999'
        });
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let W, H;
        function resize() {
            W = window.innerWidth; H = window.innerHeight;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.setTransform(dpr,0,0,dpr,0,0);
        }
        resize();
        window.addEventListener('resize', resize);

        const palettes = {
            violet:  ['#7c3aed','#a855f7','#c084fc'],
            pink:    ['#ec4899','#f472b6','#fb7185'],
            magenta: ['#c026d3','#e879f9','#d946ef'],
            green:   ['#4ade80','#86efac','#22c55e'],
            cyan:    ['#35d0c5','#67e8f9','#22d3ee'],
        };
        const particles = [];
        let raf = null;
        function fire(x, y, opts = {}) {
            const color = opts.color || 'violet';
            const count = opts.count || 26;
            const pal = palettes[color] || palettes.violet;
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
                const speed = 2 + Math.random() * 6;
                particles.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: 2 + Math.random() * 4,
                    color: pal[(Math.random() * pal.length) | 0],
                    life: 1,
                    decay: 0.016 + Math.random() * 0.014,
                    gravity: 0.06
                });
            }
            if (!raf) raf = requestAnimationFrame(animate);
        }
        function animate() {
            ctx.clearRect(0, 0, W, H);
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy;
                p.vy += p.gravity;
                p.vx *= 0.985; p.vy *= 0.985;
                p.life -= p.decay;
                if (p.life <= 0) { particles.splice(i, 1); continue; }
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            if (particles.length) raf = requestAnimationFrame(animate);
            else { raf = null; ctx.clearRect(0, 0, W, H); }
        }
        return { fire };
    })();

    // Auto-fire on [data-burst] click
    document.addEventListener('click', (e) => {
        const el = e.target.closest('[data-burst]');
        if (!el) return;
        const color = el.dataset.burst || 'violet';
        const r = el.getBoundingClientRect();
        window.Burst.fire(r.left + r.width/2, r.top + r.height/2, { color, count: 24 });
    });

    /* ---------- INIT ---------- */
    animateCounters();
    renderStudents();
    renderCourses();
    renderQuizzes();
    syncReportDropdown();
    $$('.tilt-card').forEach(attachTilt);

})();
