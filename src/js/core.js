/**
 * core.js - Core application logic, state management, and routing
 */

import { renderGojuon } from './modules/gojuon.js';
import { WordManager } from './modules/words.js';
import { SentenceManager } from './modules/sentences.js';
import { QuizManager } from './modules/quiz.js';
import { SpeechEngine } from './modules/speech.js';

// Global State
const state = {
    currentTab: 'gojuon',
    voice: 'google',
    speech: null
};

// Storage helpers
const storage = {
    _get(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key)) || fallback; }
        catch { return fallback; }
    },
    _set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },

    getFavorites() { return new Set(this._get('nihongo_favs', [])); },
    toggleFavorite(jp) {
        const favs = this.getFavorites();
        favs.has(jp) ? favs.delete(jp) : favs.add(jp);
        this._set('nihongo_favs', [...favs]);
        return favs.has(jp);
    },
    isFavorite(jp) { return this.getFavorites().has(jp); },

    getWrongAnswers() { return this._get('nihongo_wrong', []); },
    addWrongAnswer(item) {
        const wrong = this.getWrongAnswers();
        wrong.push({ ...item, date: Date.now() });
        if (wrong.length > 200) wrong.splice(0, wrong.length - 200);
        this._set('nihongo_wrong', wrong);
    },
    clearWrongAnswers() { this._set('nihongo_wrong', []); },

    getDarkMode() { return localStorage.getItem('nihongo_dark') === 'true'; },
    setDarkMode(v) { localStorage.setItem('nihongo_dark', v); }
};

window.storage = storage;

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Initializing application...");
    try {
        // Initialize Speech
        console.log("Initializing Speech Engine...");
        state.speech = new SpeechEngine();
        
        // IMMEDIATELY make it globally available to prevent UI crashes
        window.speechEngine = state.speech; 

        // Now await the async initialization (e.g. loading voices)
        console.log("Waiting for Speech Engine to be ready...");
        await state.speech.init();
        console.log("Speech Engine ready.");

        // Initialize Managers
        console.log("Initializing Managers...");
        const wordManager = new WordManager(state.speech);
        const sentenceManager = new SentenceManager(state.speech);
        const quizManager = new QuizManager(state.speech);

        // Attach Managers to window for global access by modules/HTML
        window.wordManager = wordManager;
        window.sentenceManager = sentenceManager;
        window.quizManager = quizManager;
        console.log("Managers initialized and attached to window.");

        // Setup Tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                switchTab(tab.dataset.tab);
            });
        });

        // Preload data for quiz
        wordManager.loadData();

        // Dark mode
        if (storage.getDarkMode()) document.body.classList.add('dark');
        const darkToggle = document.getElementById('dark-toggle');
        if (darkToggle) {
            darkToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark');
                storage.setDarkMode(document.body.classList.contains('dark'));
            });
        }

        // Initial Render
        console.log("Performing initial render...");
        switchTab('gojuon');
        console.log("Application ready!");

        // Header particles
        const particlesContainer = document.getElementById('header-particles');
        if (particlesContainer) {
            for (let i = 0; i < 18; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                p.style.setProperty('--duration', (6 + Math.random() * 8) + 's');
                p.style.setProperty('--delay', (Math.random() * 10) + 's');
                p.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
                p.style.setProperty('--dy', (-50 - Math.random() * 150) + 'px');
                p.style.setProperty('--max-opacity', (0.2 + Math.random() * 0.4).toFixed(2));
                p.style.left = Math.random() * 100 + '%';
                p.style.top = 40 + Math.random() * 50 + '%';
                p.style.width = (3 + Math.random() * 5) + 'px';
                p.style.height = p.style.width;
                particlesContainer.appendChild(p);
            }
        }

        // Back to top button
        const backToTop = document.getElementById('back-to-top');
        if (backToTop) {
            window.addEventListener('scroll', () => {
                backToTop.classList.toggle('visible', window.scrollY > 400);
            });
            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Cursor particles
        const canvas = document.getElementById('cursor-particles');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const MAX = 50;
            const pool = Array.from({ length: MAX }, () => ({ alive: false }));
            let count = 0;
            let mouseX = -999, mouseY = -999;
            let prevMX = -999, prevMY = -999;
            let tick = 0;

            const COLORS = ['#2A9D8F', '#C4956A', '#8A9AAA'];

            function resize() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            resize();
            window.addEventListener('resize', resize);

            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            });

            function spawn(x, y) {
                for (let i = 0; i < MAX; i++) {
                    if (!pool[i].alive) {
                        const p = pool[i];
                        p.x = x;
                        p.y = y;
                        const a = Math.random() * 6.283;
                        const s = 0.3 + Math.random() * 1;
                        p.vx = Math.cos(a) * s;
                        p.vy = Math.sin(a) * s - 0.4;
                        p.life = 1;
                        p.decay = 0.012 + Math.random() * 0.018;
                        p.size = 1.5 + Math.random() * 2.5;
                        p.color = COLORS[(Math.random() * 3) | 0];
                        p.alive = true;
                        if (++count >= MAX) count = MAX;
                        return;
                    }
                }
            }

            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                tick++;

                const moved = Math.abs(mouseX - prevMX) + Math.abs(mouseY - prevMY) > 2;
                if (moved && tick % 3 === 0 && mouseX > 0) {
                    spawn(mouseX + (Math.random() - 0.5) * 6, mouseY + (Math.random() - 0.5) * 6);
                    prevMX = mouseX;
                    prevMY = mouseY;
                }

                for (let i = 0; i < MAX; i++) {
                    const p = pool[i];
                    if (!p.alive) continue;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.01;
                    p.life -= p.decay;
                    if (p.life <= 0) { p.alive = false; count--; continue; }

                    ctx.globalAlpha = p.life * 0.5;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * p.life, 0, 6.283);
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
                requestAnimationFrame(animate);
            }
            animate();
        }

        // Close custom selects when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.custom-select.open').forEach(el => {
                el.classList.remove('open');
            });
        });

    } catch (error) {
        console.error("CRITICAL ERROR during initialization:", error);
        alert("An error occurred while starting the application. Please check the console (F12) for details.");
    }
});

function switchTab(tabId) {
    state.currentTab = tabId;
    
    // Update UI
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    
    const targetPanel = document.getElementById(tabId);
    const targetTab = document.querySelector(`[data-tab="${tabId}"]`);
    
    if (targetPanel) targetPanel.classList.add('active');
    if (targetTab) targetTab.classList.add('active');

    // Trigger module-specific rendering
    if (tabId === 'gojuon') renderGojuon();
    if (tabId === 'words') window.wordManager.init();
    if (tabId === 'sentences') window.sentenceManager.init();
    if (tabId === 'quiz') window.quizManager.init();
}

// Expose to window for inline handlers if necessary
window.switchTab = switchTab;
