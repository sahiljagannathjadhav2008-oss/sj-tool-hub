/* ============================================================
   Tool Hub — script.js
   Loads tools.json and renders everything dynamically.
   Add a tool by editing tools.json only — never this file.
   ============================================================ */

(function () {
  'use strict';

  const state = {
    tools: [],
    activeCategory: 'all',
    query: '',
  };

  const els = {
    grid: document.getElementById('tool-grid'),
    emptyState: document.getElementById('empty-state'),
    noResultsState: document.getElementById('no-results-state'),
    toolCount: document.getElementById('tool-count'),
    categoryRail: document.getElementById('category-rail'),
    searchInput: document.getElementById('search-input'),
    settingsTrigger: document.getElementById('settings-trigger'),
    settingsPanel: document.getElementById('settings-panel'),
    settingsOverlay: document.getElementById('settings-overlay'),
    settingsClose: document.getElementById('settings-close'),
    themeDark: document.getElementById('theme-dark'),
    themeLight: document.getElementById('theme-light'),
    aboutTrigger: document.getElementById('about-trigger'),
    aboutModal: document.getElementById('about-modal'),
    aboutOverlay: document.getElementById('about-overlay'),
    aboutClose: document.getElementById('about-close'),
  };

  /* ----------------------------------------------------------
     Theme
     ---------------------------------------------------------- */

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('toolhub-theme', theme);
    els.themeDark.checked = theme === 'dark';
    els.themeLight.checked = theme === 'light';
  }

  function initTheme() {
    const saved = localStorage.getItem('toolhub-theme');
    const preferred = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    applyTheme(preferred);
  }

  els.themeDark.addEventListener('change', () => applyTheme('dark'));
  els.themeLight.addEventListener('change', () => applyTheme('light'));

  /* ----------------------------------------------------------
     Data loading
     ---------------------------------------------------------- */

  async function loadTools() {
    try {
      const res = await fetch('tools.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('tools.json responded with ' + res.status);
      const data = await res.json();
      state.tools = Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Tool Hub: could not load tools.json —', err.message);
      state.tools = [];
    }
    buildCategoryRail();
    render();
  }

  /* ----------------------------------------------------------
     Category rail
     ---------------------------------------------------------- */

  function buildCategoryRail() {
    const categories = Array.from(
      new Set(state.tools.map((t) => (t.category || '').trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    els.categoryRail.innerHTML = '';

    const allChip = makeChip('all', 'all');
    els.categoryRail.appendChild(allChip);

    categories.forEach((cat) => {
      els.categoryRail.appendChild(makeChip(cat, cat.toLowerCase()));
    });
  }

  function makeChip(category, label) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'category-chip mono' + (state.activeCategory === category ? ' is-active' : '');
    btn.dataset.category = category;
    btn.textContent = label;
    btn.addEventListener('click', () => {
      state.activeCategory = category;
      document
        .querySelectorAll('.category-chip')
        .forEach((chip) => chip.classList.toggle('is-active', chip.dataset.category === category));
      render();
    });
    return btn;
  }

  /* ----------------------------------------------------------
     Search
     ---------------------------------------------------------- */

  let searchDebounce;
  els.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    const value = e.target.value;
    searchDebounce = setTimeout(() => {
      state.query = value.trim().toLowerCase();
      render();
    }, 80);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== els.searchInput) {
      e.preventDefault();
      els.searchInput.focus();
    }
    if (e.key === 'Escape') {
      closeSettings();
      closeAbout();
    }
  });

  /* ----------------------------------------------------------
     Rendering
     ---------------------------------------------------------- */

  function getFilteredTools() {
    return state.tools.filter((tool) => {
      const matchesCategory =
        state.activeCategory === 'all' ||
        (tool.category || '').toLowerCase() === state.activeCategory.toLowerCase();

      const haystack = `${tool.name || ''} ${tool.description || ''} ${tool.category || ''}`.toLowerCase();
      const matchesQuery = state.query === '' || haystack.includes(state.query);

      return matchesCategory && matchesQuery;
    });
  }

  function render() {
    const filtered = getFilteredTools();

    els.toolCount.textContent = String(state.tools.length).padStart(3, '0') + ' tools';

    els.grid.innerHTML = '';

    if (state.tools.length === 0) {
      els.emptyState.hidden = false;
      els.noResultsState.hidden = true;
      return;
    }

    els.emptyState.hidden = true;

    if (filtered.length === 0) {
      els.noResultsState.hidden = false;
      return;
    }

    els.noResultsState.hidden = true;

    filtered.forEach((tool, index) => {
      els.grid.appendChild(buildCard(tool, index));
    });
  }

  function buildCard(tool, index) {
    const card = document.createElement('a');
    card.className = 'tool-card';
    card.href = tool.folder ? `${tool.folder.replace(/\/$/, '')}/index.html` : '#';
    card.style.animationDelay = Math.min(index * 40, 400) + 'ms';

    const top = document.createElement('div');
    top.className = 'tool-card-top';

    const name = document.createElement('span');
    name.className = 'tool-card-name';
    name.textContent = tool.name || 'Untitled tool';
    top.appendChild(name);

    if (tool.category) {
      const cat = document.createElement('span');
      cat.className = 'tool-card-category mono';
      cat.textContent = tool.category;
      top.appendChild(cat);
    }

    const desc = document.createElement('p');
    desc.className = 'tool-card-desc';
    desc.textContent = tool.description || '';

    const footer = document.createElement('div');
    footer.className = 'tool-card-footer';

    const version = document.createElement('span');
    version.className = 'tool-card-version mono';
    version.textContent = tool.version ? `v${tool.version}` : '';

    const open = document.createElement('span');
    open.className = 'tool-card-open';
    open.innerHTML = 'Open <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';

    footer.appendChild(version);
    footer.appendChild(open);

    card.appendChild(top);
    card.appendChild(desc);
    card.appendChild(footer);

    return card;
  }

  /* ----------------------------------------------------------
     Settings panel
     ---------------------------------------------------------- */

  function openSettings() {
    els.settingsOverlay.hidden = false;
    els.settingsPanel.hidden = false;
    els.settingsPanel.classList.remove('is-closing');
    els.settingsClose.focus();
  }

  function closeSettings() {
    if (els.settingsPanel.hidden) return;
    els.settingsPanel.classList.add('is-closing');
    els.settingsOverlay.hidden = true;
    setTimeout(() => {
      els.settingsPanel.hidden = true;
      els.settingsPanel.classList.remove('is-closing');
    }, 300);
    els.settingsTrigger.focus();
  }

  els.settingsTrigger.addEventListener('click', openSettings);
  els.settingsClose.addEventListener('click', closeSettings);
  els.settingsOverlay.addEventListener('click', closeSettings);

  /* ----------------------------------------------------------
     About modal
     ---------------------------------------------------------- */

  function openAbout() {
    els.aboutOverlay.hidden = false;
    els.aboutModal.hidden = false;
    els.aboutModal.classList.remove('is-closing');
    els.aboutClose.focus();
  }

  function closeAbout() {
    if (els.aboutModal.hidden) return;
    els.aboutModal.classList.add('is-closing');
    els.aboutOverlay.hidden = true;
    setTimeout(() => {
      els.aboutModal.hidden = true;
      els.aboutModal.classList.remove('is-closing');
    }, 180);
    els.aboutTrigger.focus();
  }

  els.aboutTrigger.addEventListener('click', openAbout);
  els.aboutClose.addEventListener('click', closeAbout);
  els.aboutOverlay.addEventListener('click', closeAbout);

  /* ----------------------------------------------------------
     Footer GitHub placeholder
     ---------------------------------------------------------- */

  document.getElementById('footer-github').addEventListener('click', (e) => {
    e.preventDefault();
  });

  /* ----------------------------------------------------------
     Init
     ---------------------------------------------------------- */

  initTheme();
  loadTools();
})();
