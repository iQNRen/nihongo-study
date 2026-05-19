/**
 * speech.js - Handles all text-to-speech functionality
 */

export class SpeechEngine {
    constructor() {
        this.voiceType = 'auto';
        this.voices = [];
    }

    async init() {
        return new Promise((resolve) => {
            if ('speechSynthesis' in window) {
                this.voices = window.speechSynthesis.getVoices();
                if (this.voices.length === 0) {
                    window.speechSynthesis.onvoiceschanged = () => {
                        this.voices = window.speechSynthesis.getVoices();
                        resolve();
                    };
                } else {
                    resolve();
                }
            } else {
                console.warn("Web Speech API not supported");
                resolve();
            }
        });
    }

    setVoice(type) {
        this.voiceType = type;
    }

    speak(text) {
        if (!text) return;
        this._speakSystem(text);
    }

    _speakSystem(text) {
        if (!('speechSynthesis' in window)) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';

        const voices = this.voices.length ? this.voices : window.speechSynthesis.getVoices();
        if (this.voiceType === 'female') {
            const femaleVoice = voices.find(v =>
                v.lang.startsWith('ja') &&
                (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('nanami') || v.name.toLowerCase().includes('kyoko'))
            );
            if (femaleVoice) utterance.voice = femaleVoice;
        } else if (this.voiceType === 'male') {
            const maleVoice = voices.find(v =>
                v.lang.startsWith('ja') &&
                (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('takumi'))
            );
            if (maleVoice) utterance.voice = maleVoice;
        }

        window.speechSynthesis.speak(utterance);
    }
}
