/**
 * quiz.js - Redesigned quiz with multiple modes and configurable question count
 */

export class QuizManager {
    constructor(speechEngine) {
        this.speech = speechEngine;
        this.selectedMode = null;
        this.questionCount = 20;
        this.currentMode = '';
        this.currentIndex = 0;
        this.score = 0;
        this.questions = [];
        this.answers = [];
    }

    init() {
        this._showPanel('quiz-setup');
        this.selectedMode = null;
        document.getElementById('quiz-start-area').style.display = 'none';
        document.querySelectorAll('.quiz-mode-card').forEach(c => c.classList.remove('selected'));
    }

    selectMode(mode) {
        this.selectedMode = mode;
        document.querySelectorAll('.quiz-mode-card').forEach(c => c.classList.remove('selected'));
        document.querySelector(`.quiz-mode-card[data-mode="${mode}"]`).classList.add('selected');
        document.getElementById('quiz-start-area').style.display = 'flex';
    }

    setCount(n) {
        this.questionCount = n;
        document.querySelectorAll('.quiz-count-btn').forEach(b => {
            b.classList.toggle('active', parseInt(b.dataset.count) === n);
        });
    }

    startSelected() {
        if (!this.selectedMode) return;

        const words = window.wordManager.allWords;
        if (!words || words.length === 0) {
            alert('单词数据尚未加载，请稍后再试');
            return;
        }

        this.currentMode = this.selectedMode;
        this.currentIndex = 0;
        this.score = 0;
        this.answers = [];

        const shuffled = [...words].sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, Math.min(this.questionCount, shuffled.length));

        if (this.currentMode === 'jp-cn') {
            this.questions = picked.map(w => ({ q: w.jp, a: w.cn, kana: w.kana, pool: words.map(x => x.cn) }));
        } else if (this.currentMode === 'cn-jp') {
            this.questions = picked.map(w => ({ q: w.cn, a: w.jp, kana: w.kana, pool: words.map(x => x.jp) }));
        } else if (this.currentMode === 'listen') {
            this.questions = picked.map(w => ({ q: w.kana, a: w.jp, kana: w.kana, pool: words.map(x => x.jp) }));
        } else if (this.currentMode === 'kana') {
            // Use gojuon kana data if available, fallback to word kana
            this.questions = picked.map(w => ({ q: w.kana, a: w.roma || w.kana, kana: w.kana, pool: words.map(x => x.roma || x.kana) }));
        } else if (this.currentMode === 'spell') {
            this.questions = picked.map(w => ({ q: w.cn, a: w.jp, kana: w.kana, pool: [] }));
        }

        this._showPanel('quiz-active');
        this._loadQuestion();
    }

    _loadQuestion() {
        if (this.currentIndex >= this.questions.length) {
            this._showResult();
            return;
        }

        const q = this.questions[this.currentIndex];
        const total = this.questions.length;
        const pct = ((this.currentIndex) / total * 100);

        document.getElementById('quiz-progress-fill').style.width = pct + '%';
        document.getElementById('quiz-progress-text').innerText = `${this.currentIndex + 1} / ${total}`;

        const hintEl = document.getElementById('quiz-hint');
        const optionsEl = document.getElementById('quiz-options');
        const inputArea = document.getElementById('quiz-input-area');

        // Show hint for listen mode
        if (this.currentMode === 'listen') {
            hintEl.style.display = 'block';
            hintEl.innerText = '点击选项播放发音';
            this.speech.speak(q.kana);
        } else if (this.currentMode === 'kana') {
            hintEl.style.display = 'block';
            hintEl.innerText = '选择正确的罗马音读法';
        } else {
            hintEl.style.display = 'none';
        }

        // Question text
        const qText = document.getElementById('quiz-q-text');
        if (this.currentMode === 'listen') {
            qText.innerHTML = '<span style="font-size:3rem;cursor:pointer;" onclick="window.speechEngine.speak(\'' + q.kana + '\')">🔊</span>';
        } else {
            qText.innerText = q.q;
        }

        // Spell mode: show input
        if (this.currentMode === 'spell') {
            optionsEl.style.display = 'none';
            inputArea.style.display = 'block';
            const input = document.getElementById('quiz-input');
            input.value = '';
            input.focus();
            hintEl.style.display = 'block';
            hintEl.innerText = `假名: ${q.kana}`;
            return;
        }

        // Multiple choice
        optionsEl.style.display = 'grid';
        inputArea.style.display = 'none';
        optionsEl.innerHTML = '';

        let options = [q.a];
        let wrongOptions = [];
        let attempts = 0;
        while (wrongOptions.length < 3 && attempts < 200) {
            let rand = q.pool[Math.floor(Math.random() * q.pool.length)];
            if (rand !== q.a && !wrongOptions.includes(rand)) {
                wrongOptions.push(rand);
            }
            attempts++;
        }
        options = [...options, ...wrongOptions].sort(() => Math.random() - 0.5);

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt;
            btn.onclick = () => this._handleAnswer(opt, q.a, btn);
            optionsEl.appendChild(btn);

            // Play audio for listen mode options
            if (this.currentMode === 'listen') {
                btn.addEventListener('click', () => {
                    // Find the word to get kana for this option
                    const word = window.wordManager.allWords.find(w => w.jp === opt);
                    if (word) this.speech.speak(word.kana);
                });
            }
        });
    }

    _handleAnswer(selected, correct, btn) {
        const allButtons = document.querySelectorAll('.option-btn');
        allButtons.forEach(b => b.disabled = true);

        const isCorrect = selected === correct;
        if (isCorrect) {
            btn.classList.add('correct');
            this.score++;
        } else {
            btn.classList.add('wrong');
            allButtons.forEach(b => {
                if (b.innerText === correct) b.classList.add('correct');
            });
        }

        this.answers.push({
            q: this.questions[this.currentIndex].q,
            a: correct,
            selected,
            correct: isCorrect
        });

        setTimeout(() => {
            this.currentIndex++;
            this._loadQuestion();
        }, 1000);
    }

    submitInput() {
        const input = document.getElementById('quiz-input');
        const selected = input.value.trim();
        const q = this.questions[this.currentIndex];
        const isCorrect = selected === q.a;

        input.style.borderColor = isCorrect ? 'var(--tokiwa)' : 'var(--beni-aka)';

        if (isCorrect) {
            this.score++;
        } else {
            // Show correct answer
            const hint = document.getElementById('quiz-hint');
            hint.style.display = 'block';
            hint.innerHTML = `<span style="color:var(--beni-aka)">正确答案: ${q.a}</span>`;
        }

        this.answers.push({
            q: q.q,
            a: q.a,
            selected,
            correct: isCorrect
        });

        setTimeout(() => {
            input.style.borderColor = '';
            this.currentIndex++;
            this._loadQuestion();
        }, 1500);
    }

    _showResult() {
        this._showPanel('quiz-result');
        const total = this.questions.length;
        const pct = Math.round((this.score / total) * 100);

        // Animate ring
        const ring = document.getElementById('result-ring-fill');
        const circumference = 2 * Math.PI * 52; // r=52
        const offset = circumference - (pct / 100) * circumference;
        setTimeout(() => {
            ring.style.transition = 'stroke-dashoffset 1s ease';
            ring.style.strokeDashoffset = offset;
        }, 100);

        // Percent text
        document.getElementById('result-percent').innerText = pct + '%';

        // Stats
        const statsEl = document.getElementById('result-stats');
        statsEl.innerHTML = `
            <span class="stat-correct">✓ ${this.score}</span>
            <span class="stat-wrong">✗ ${total - this.score}</span>
            <span>共 ${total} 题</span>
        `;

        // Review list
        const reviewEl = document.getElementById('result-review');
        reviewEl.innerHTML = '';
        this.answers.forEach(ans => {
            const item = document.createElement('div');
            item.className = 'result-review-item ' + (ans.correct ? 'review-correct' : 'review-wrong');
            item.innerHTML = `
                <span class="review-emoji">${ans.correct ? '✓' : '✗'}</span>
                <span class="review-text">
                    <span class="review-q">${ans.q}</span>
                    <span class="review-a"> → ${ans.correct ? ans.a : `${ans.selected} (正确: ${ans.a})`}</span>
                </span>
            `;
            reviewEl.appendChild(item);
        });
    }

    retryQuiz() {
        this.startSelected();
    }

    exitQuiz() {
        // Reset ring for next time
        const ring = document.getElementById('result-ring-fill');
        if (ring) {
            ring.style.transition = 'none';
            ring.style.strokeDashoffset = 327;
        }
        this.init();
    }

    _showPanel(id) {
        const panels = ['quiz-setup', 'quiz-active', 'quiz-result'];
        panels.forEach(pId => {
            const el = document.getElementById(pId);
            if (el) el.style.display = (pId === id) ? 'block' : 'none';
        });
    }
}
