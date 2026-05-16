/**
 * words.js - Manages vocabulary data and rendering with pagination
 */

import { loadWords } from '../data/words/index.js';


export class WordManager {
    constructor(speechEngine) {
        this.speech = speechEngine;
        this.allWords = [];
        this.filteredWords = [];
        this.currentPage = 1;
        this.itemsPerPage = 50;
        this.currentCategory = 'all';
        this.currentSearch = '';
    }

    async init() {
        this.allWords = await loadWords();
        this.filteredWords = [...this.allWords];
        this.renderFilters();
        this.renderList();
    }

    renderFilters() {
        const selectEl = document.getElementById('word-category');
        if (!selectEl) return;

        const categories = ['all', ...new Set(this.allWords.map(w => w.category))];
        const optionsContainer = selectEl.querySelector('.custom-select-options');
        const trigger = selectEl.querySelector('.custom-select-trigger');
        optionsContainer.innerHTML = '';

        categories.forEach(cat => {
            const opt = document.createElement('div');
            opt.className = 'custom-select-option' + (cat === this.currentCategory ? ' selected' : '');
            opt.dataset.value = cat;
            opt.innerText = cat === 'all' ? '全部分类' : cat;
            opt.addEventListener('click', () => {
                this.currentCategory = cat;
                selectEl.dataset.value = cat;
                trigger.querySelector('.select-text').innerText = cat === 'all' ? '全部分类' : cat;
                selectEl.classList.remove('open');
                optionsContainer.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                this.currentPage = 1;
                this.applyFilters();
            });
            optionsContainer.appendChild(opt);
        });

        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.custom-select.open').forEach(el => {
                if (el !== selectEl) el.classList.remove('open');
            });
            selectEl.classList.toggle('open');
        });

        const searchInput = document.getElementById('word-search');
        if (searchInput) {
            searchInput.oninput = (e) => {
                this.currentSearch = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.applyFilters();
            };
        }
    }

    applyFilters() {
        this.filteredWords = this.allWords.filter(w => {
            const matchesSearch = w.jp.includes(this.currentSearch) || 
                                w.kana.includes(this.currentSearch) || 
                                w.en.toLowerCase().includes(this.currentSearch) || 
                                w.cn.includes(this.currentSearch);
            const matchesCat = this.currentCategory === 'all' || w.category === this.currentCategory;
            return matchesSearch && matchesCat;
        });
        this.currentPage = 1;
        this.renderList();
    }

    renderList() {
        const container = document.getElementById('words-container');
        const pagination = document.getElementById('words-pagination');
        if (!container || !pagination) return;

        container.innerHTML = '';

        const totalPages = Math.ceil(this.filteredWords.length / this.itemsPerPage);
        if (this.currentPage > totalPages) this.currentPage = totalPages || 1;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageItems = this.filteredWords.slice(start, end);

        pageItems.forEach(w => {
            const item = document.createElement('div');
            item.className = 'word-card';
            item.innerHTML = `
                <div class="word-card-header">
                    <span class="item-main">${w.jp}</span>
                    <span class="item-audio" onclick="event.stopPropagation(); window.speechEngine.speak('${w.jp}')">🔊</span>
                </div>
                <span class="item-sub">${w.kana}</span>
                <span class="item-desc">${w.cn} · ${w.en}</span>
                <span class="item-tag" data-level="${w.level || 'N5'}">${w.level || 'N5'}</span>
            `;
            item.addEventListener('click', () => window.speechEngine.speak(w.jp));
            container.appendChild(item);
        });

        this._renderPagination(pagination, totalPages, container);
    }

    _renderPagination(pagination, totalPages, container) {
        pagination.innerHTML = '';
        if (totalPages <= 1) return;

        const info = document.createElement('span');
        info.className = 'page-info';
        info.innerText = `第 ${this.currentPage} / ${totalPages} 页 (${this.filteredWords.length} 个单词)`;
        pagination.appendChild(info);

        const btnGroup = document.createElement('div');
        btnGroup.className = 'page-btns';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.innerText = '‹';
        prevBtn.disabled = this.currentPage <= 1;
        prevBtn.onclick = () => { this.currentPage--; this.renderList(); };
        btnGroup.appendChild(prevBtn);

        const maxShow = 7;
        let startP = Math.max(1, this.currentPage - Math.floor(maxShow / 2));
        let endP = Math.min(totalPages, startP + maxShow - 1);
        if (endP - startP < maxShow - 1) startP = Math.max(1, endP - maxShow + 1);

        if (startP > 1) {
            btnGroup.appendChild(this._pageBtn(1));
            if (startP > 2) {
                const dots = document.createElement('span');
                dots.className = 'page-dots';
                dots.innerText = '…';
                btnGroup.appendChild(dots);
            }
        }
        for (let i = startP; i <= endP; i++) {
            btnGroup.appendChild(this._pageBtn(i));
        }
        if (endP < totalPages) {
            if (endP < totalPages - 1) {
                const dots = document.createElement('span');
                dots.className = 'page-dots';
                dots.innerText = '…';
                btnGroup.appendChild(dots);
            }
            btnGroup.appendChild(this._pageBtn(totalPages));
        }

        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.innerText = '›';
        nextBtn.disabled = this.currentPage >= totalPages;
        nextBtn.onclick = () => { this.currentPage++; this.renderList(); };
        btnGroup.appendChild(nextBtn);

        pagination.appendChild(btnGroup);
    }

    _pageBtn(n) {
        const btn = document.createElement('button');
        btn.className = 'page-btn' + (n === this.currentPage ? ' active' : '');
        btn.innerText = n;
        btn.onclick = () => { this.currentPage = n; this.renderList(); };
        return btn;
    }
}
