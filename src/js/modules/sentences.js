/**
 * sentences.js - Manages sentence data and rendering with pagination
 */

import { loadSentences } from '../data/sentences/index.js';

export class SentenceManager {
    constructor(speechEngine) {
        this.speech = speechEngine;
        this.allSentences = [];
        this.filteredSentences = [];
        this.currentPage = 1;
        this.itemsPerPage = 30;
        this.currentCategory = 'all';
        this.currentSearch = '';
    }

    async init() {
        this.allSentences = await loadSentences();
        this.filteredSentences = [...this.allSentences];
        this.renderFilters();
        this.renderList();
    }

    renderFilters() {
        const selectEl = document.getElementById('sentence-category');
        if (!selectEl) return;

        const categories = ['all', ...new Set(this.allSentences.map(s => s.category))];
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

        const searchInput = document.getElementById('sentence-search');
        if (searchInput) {
            searchInput.oninput = (e) => {
                this.currentSearch = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.applyFilters();
            };
        }
    }

    applyFilters() {
        this.filteredSentences = this.allSentences.filter(s => {
            const matchesSearch = s.jp.includes(this.currentSearch) || 
                                s.kana.includes(this.currentSearch) || 
                                s.en.toLowerCase().includes(this.currentSearch) || 
                                s.cn.includes(this.currentSearch);
            const matchesCat = this.currentCategory === 'all' || s.category === this.currentCategory;
            return matchesSearch && matchesCat;
        });
        this.currentPage = 1;
        this.renderList();
    }

    renderList() {
        const container = document.getElementById('sentences-container');
        const pagination = document.getElementById('sentences-pagination');
        if (!container || !pagination) return;

        container.innerHTML = '';

        const totalPages = Math.ceil(this.filteredSentences.length / this.itemsPerPage);
        if (this.currentPage > totalPages) this.currentPage = totalPages || 1;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageItems = this.filteredSentences.slice(start, end);

        pageItems.forEach(s => {
            const item = document.createElement('div');
            item.className = 'sentence-item';
            item.innerHTML = `
                <span class="item-audio" onclick="window.speechEngine.speak('${s.jp}')">🔊</span>
                <div style="flex:1; min-width:0;">
                    <div class="item-main">${s.jp}</div>
                    <div class="item-sub">${s.kana} · ${s.en}</div>
                    <div class="item-sub" style="color: var(--text); font-weight:500;">${s.cn}</div>
                </div>
                <span class="item-tag" style="font-size:0.75rem; padding:2px 8px; background:var(--accent2); border-radius:4px; color:white; flex-shrink:0;">${s.level || 'N5'}</span>
            `;
            container.appendChild(item);
        });

        this._renderPagination(pagination, totalPages, container);
    }

    _renderPagination(pagination, totalPages, container) {
        pagination.innerHTML = '';
        if (totalPages <= 1) return;

        const info = document.createElement('span');
        info.className = 'page-info';
        info.innerText = `第 ${this.currentPage} / ${totalPages} 页 (${this.filteredSentences.length} 个句子)`;
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
