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
