/* ============================================================
   KARNAMEH DEMO — interactions (no backend, pure frontend)
   ============================================================ */
(function () {
    'use strict';

    /* ---------- STATE ---------- */
    const state = {
        students: [
            { id: 1, first: 'بردیا',       last: 'طوفانی موقر', cls: '7a' },
            { id: 2, first: 'فرسام',       last: 'فرهادی',      cls: '7a' },
            { id: 3, first: 'محمد مهدی',   last: 'اکبری',       cls: '7a' },
            { id: 4, first: 'سارا',        last: 'محمدی',       cls: '7b' },
            { id: 5, first: 'علی',         last: 'رضایی',       cls: '7b' },
            { id: 6, first: 'مهدی',        last: 'کریمی',       cls: '8a' },
            { id: 7, first: 'فاطمه',       last: 'حسینی',       cls: '8a' },
            { id: 8, first: 'رضا',         last: 'احمدی',       cls: '7a' },
        ],
        courses: [
            { id: 'math',       title: 'ریاضی',      teacher: 'مهدی نوروزی',   level: 'هفتم', published: true,  quizzes: 8 },
            { id: 'physics',    title: 'فیزیک',      teacher: 'محسن کیهانی',   level: 'هشتم', published: true,  quizzes: 6 },
            { id: 'literature', title: 'ادبیات',     teacher: 'سمیه رستمی',    level: 'هفتم', published: true,  quizzes: 4 },
            { id: 'science',    title: 'علوم تجربی', teacher: 'حسین موسوی',    level: 'هفتم', published: true,  quizzes: 5 },
            { id: 'english',    title: 'زبان انگلیسی', teacher: 'نازنین فلاحی', level: 'هفتم', published: true, quizzes: 3 },
            { id: 'arabic',     title: 'عربی',       teacher: 'سعید نوری',     level: 'هشتم', published: false, quizzes: 2 },
        ],
        quizzes: [
            { id: 1, title: 'کوییز اول ریاضی',  course: 'ریاضی',   date: '۱۴۰۴/۰۵/۱۲', max: 20 },
            { id: 2, title: 'کوییز دوم ریاضی',  course: 'ریاضی',   date: '۱۴۰۴/۰۶/۰۳', max: 20 },
            { id: 3, title: 'کوییز فیزیک — حرکت', course: 'فیزیک',   date: '۱۴۰۴/۰۵/۲۰', max: 10 },
            { id: 4, title: 'کوییز ادبیات — شعر', course: 'ادبیات',  date: '۱۴۰۴/۰۵/۲۵', max: 15 },
            { id: 5, title: 'کوییز علوم — سلول',  course: 'علوم تجربی', date: '۱۴۰۴/۰۶/۰۱', max: 10 },
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

    const toFa = (num) => {
        const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
        return String(num).replace(/\d/g, d => fa[+d]);
    };

    const escapeHtml = (str) =>
        String(str).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));

    /* ---------- NAV ---------- */
    $$('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;

            $$('.nav-item').forEach(n => n.classList.toggle('is-active', n === item));
            $$('.view').forEach(v => v.classList.toggle('is-active', v.dataset.view === view));

            // Re-run animations for this view
            if (view === 'dashboard') animateCounters();
            if (view === 'students')  renderStudents();
            if (view === 'courses')   renderCourses();
            if (view === 'quizzes')   renderQuizzes();
        });
    });

    /* ---------- DASHBOARD COUNTERS ---------- */
    function animateCounters() {
        $$('[data-count]').forEach(el => {
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
    const searchInput   = $('#search-students');

    function renderStudents(filter = '') {
        if (!studentsTbody) return;
        const q = filter.trim().toLowerCase();
        const list = state.students.filter(s =>
            !q || s.first.toLowerCase().includes(q) || s.last.toLowerCase().includes(q)
        );

        if (list.length === 0) {
            studentsTbody.innerHTML = `<tr><td colspan="5" class="table__empty">هیچ دانش‌آموزی یافت نشد</td></tr>`;
            return;
        }

        studentsTbody.innerHTML = list.map((s, i) => `
            <tr>
                <td>${toFa(i + 1)}</td>
                <td>${escapeHtml(s.first)}</td>
                <td>${escapeHtml(s.last)}</td>
                <td>${CLASS_NAMES[s.cls] || s.cls}</td>
                <td>
                    <div class="table__actions">
                        <button class="btn-icon" data-del-student="${s.id}" title="حذف">🗑</button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Delete handlers
        studentsTbody.querySelectorAll('[data-del-student]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.delStudent, 10);
                state.students = state.students.filter(s => s.id !== id);
                renderStudents(searchInput.value);
                syncDropdowns();
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => renderStudents(searchInput.value));
    }

    /* ---------- ADD STUDENT MODAL ---------- */
    $('#add-student-btn')?.addEventListener('click', () => {
        openModal('افزودن دانش‌آموز جدید', `
            <label style="display:flex;flex-direction:column;gap:6px">
                <span style="font-size:12.5px;font-weight:700;color:#4b5563">نام</span>
                <input class="input" id="new-first" placeholder="نام">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px">
                <span style="font-size:12.5px;font-weight:700;color:#4b5563">نام خانوادگی</span>
                <input class="input" id="new-last" placeholder="نام خانوادگی">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px">
                <span style="font-size:12.5px;font-weight:700;color:#4b5563">کلاس</span>
                <select class="input" id="new-cls">
                    <option value="7a">پایه هفتم الف</option>
                    <option value="7b">پایه هفتم ب</option>
                    <option value="8a">پایه هشتم الف</option>
                </select>
            </label>
            <button class="btn btn--primary" id="new-save">ذخیره</button>
        `);

        $('#new-save')?.addEventListener('click', () => {
            const first = $('#new-first').value.trim();
            const last  = $('#new-last').value.trim();
            const cls   = $('#new-cls').value;
            if (!first || !last) return;
            const newId = Math.max(0, ...state.students.map(s => s.id)) + 1;
            state.students.push({ id: newId, first, last, cls });
            closeModal();
            renderStudents(searchInput.value);
            syncDropdowns();
        });
    });

    /* ---------- COURSES ---------- */
    function renderCourses() {
        const grid = $('#courses-grid');
        if (!grid) return;
        grid.innerHTML = state.courses.map(c => `
            <div class="course-card">
                <div class="course-card__title">${escapeHtml(c.title)}</div>
                <div class="course-card__meta">معلم: ${escapeHtml(c.teacher)} | پایه: ${escapeHtml(c.level)}</div>
                <div class="course-card__footer">
                    <span>${toFa(c.quizzes)} کوییز</span>
                    ${c.published ? '<span class="course-card__badge">منتشر شده</span>' : '<span class="course-card__badge" style="background:#f3f4f6;color:#6b7280">پیش‌نویس</span>'}
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
                <td>${escapeHtml(q.title)}</td>
                <td>${escapeHtml(q.course)}</td>
                <td>${escapeHtml(q.date)}</td>
                <td>${toFa(q.max)}</td>
                <td>
                    <div class="table__actions">
                        <button class="btn-icon" data-quiz-grade="${q.id}" title="ثبت نمرات">📝</button>
                    </div>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('[data-quiz-grade]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.quizGrade, 10);
                const quiz = state.quizzes.find(q => q.id === id);
                openModal(`ثبت نمرات: ${quiz.title}`, `
                    <p style="font-size:13px;color:#6b7280;margin-bottom:12px">
                        در سامانه‌ی واقعی، اینجا لیست کامل دانش‌آموزان با فیلد ورود نمره نمایش داده می‌شود.
                    </p>
                    ${state.students.slice(0, 4).map(s => `
                        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6">
                            <span>${escapeHtml(s.first)} ${escapeHtml(s.last)}</span>
                            <input class="input" style="max-width:90px" placeholder="نمره">
                        </div>
                    `).join('')}
                    <button class="btn btn--primary">ذخیره (نمایشی)</button>
                `);
            });
        });
    }

    /* ---------- PREDICT ---------- */
    const predictClass   = $('#predict-class');
    const predictStudent = $('#predict-student');
    const predictCourse  = $('#predict-course');
    const predictBtn     = $('#predict-btn');
    const predictResult  = $('#predict-result');

    function syncDropdowns() {
        // report student dropdown
        const rep = $('#report-student');
        if (rep) {
            const current = rep.value;
            rep.innerHTML = '<option value="">— انتخاب دانش‌آموز —</option>' +
                state.students.map(s => `<option value="${s.id}">${escapeHtml(s.first)} ${escapeHtml(s.last)}</option>`).join('');
            if (current) rep.value = current;
        }
    }

    function updatePredictStudentList() {
        if (!predictStudent) return;
        const cls = predictClass.value;
        const list = state.students.filter(s => s.cls === cls);
        predictStudent.innerHTML = '<option value="">— انتخاب دانش‌آموز —</option>' +
            list.map(s => `<option value="${s.id}">${escapeHtml(s.first)} ${escapeHtml(s.last)}</option>`).join('');
    }

    function updatePredictBtn() {
        if (!predictBtn) return;
        predictBtn.disabled = !(predictClass.value && predictStudent.value && predictCourse.value);
    }

    predictClass?.addEventListener('change', () => {
        updatePredictStudentList();
        updatePredictBtn();
    });
    predictStudent?.addEventListener('change', updatePredictBtn);
    predictCourse?.addEventListener('change', updatePredictBtn);

    predictBtn?.addEventListener('click', () => {
        const sid = parseInt(predictStudent.value, 10);
        const cid = predictCourse.value;
        const student = state.students.find(s => s.id === sid);
        const course  = state.courses.find(c => c.id === cid);
        if (!student || !course) return;

        predictResult.innerHTML = `
            <div class="predict-empty">
                <span class="predict-empty__icon" style="animation:pulse 1.4s ease-in-out infinite">🤖</span>
                <p>در حال تحلیل با مدل رگرسیون...</p>
            </div>
        `;

        setTimeout(() => {
            // Fake but realistic-looking prediction
            const predicted = +(14 + Math.random() * 4).toFixed(2);
            const margin = +(1.2 + Math.random() * 0.8).toFixed(2);
            const lower = Math.max(0, +(predicted - margin).toFixed(2));
            const upper = Math.min(20, +(predicted + margin).toFixed(2));

            const features = {
                'مستمر':       +(13 + Math.random() * 5).toFixed(1),
                'امتحان':      +(12 + Math.random() * 6).toFixed(1),
                'میانگین کوییز': +(11 + Math.random() * 7).toFixed(1),
            };

            predictResult.innerHTML = `
                <div class="predict-score">
                    <div class="predict-score__label">نمره‌ی نهایی پیش‌بینی‌شده</div>
                    <div class="predict-score__value">${toFa(predicted)}</div>
                    <div class="predict-score__ci">بازه‌ی اطمینان ۹۵٪: ${toFa(lower)} — ${toFa(upper)}</div>
                </div>
                <div style="text-align:center;font-size:12.5px;color:#6b7280;margin-bottom:8px">
                    دانش‌آموز: <strong style="color:#111827">${escapeHtml(student.first)} ${escapeHtml(student.last)}</strong>
                    · درس: <strong style="color:#111827">${escapeHtml(course.title)}</strong>
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

    reportStudent?.addEventListener('change', () => {
        reportGenerate.disabled = !reportStudent.value;
    });

    reportGenerate?.addEventListener('click', () => {
        const sid = parseInt(reportStudent.value, 10);
        const student = state.students.find(s => s.id === sid);
        if (!student) return;

        reportPreview.innerHTML = `
            <div class="predict-empty">
                <span class="predict-empty__icon" style="animation:pulse 1.4s ease-in-out infinite">📄</span>
                <p>در حال تولید کارنامه...</p>
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
                        دانش‌آموز: ${escapeHtml(student.first)} ${escapeHtml(student.last)} — ${CLASS_NAMES[student.cls]}
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
        }, 1200);
    });

    /* ---------- MODAL ---------- */
    const modal = $('#modal');
    function openModal(title, body) {
        $('#modal-title').textContent = title;
        $('#modal-body').innerHTML = body;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
    }
    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    }
    modal?.addEventListener('click', (e) => {
        if (e.target.closest('[data-close]')) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeModal();
    });

    /* ---------- INIT ---------- */
    animateCounters();
    renderStudents();
    renderCourses();
    renderQuizzes();
    syncDropdowns();

})();
