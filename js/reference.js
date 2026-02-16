// === D&D 5.5 QUICK REFERENCE ===
const Reference = (() => {
  let data = null;
  let openSections = new Set();

  async function init() {
    try {
      const res = await fetch('data/reference.json');
      data = await res.json();
    } catch { console.error('Failed to load reference data'); return; }
    render();
  }

  function render(filter) {
    const el = document.getElementById('refContent');
    if (!data) return;
    const q = (filter || '').toLowerCase().trim();

    el.innerHTML = data.sections.map(sec => {
      let items = sec.items;
      if (q) items = items.filter(it => it.name.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q));
      if (q && !items.length) return '';
      const isOpen = openSections.has(sec.id) || !!q;
      return `
        <div class="ref-section">
          <div class="ref-section-head${isOpen ? ' open' : ''}" onclick="Reference.toggle('${sec.id}')">
            <span class="ref-icon">${sec.icon}</span>
            <span class="ref-title">${sec.title}</span>
            <span class="ref-count">${items.length}</span>
            <span class="ref-chevron">${isOpen ? '▼' : '▶'}</span>
          </div>
          <div class="ref-section-body${isOpen ? ' open' : ''}">
            ${items.map(it => `
              <div class="ref-item">
                <div class="ref-item-name">${highlight(it.name, q)}</div>
                <div class="ref-item-desc">${highlight(it.desc, q)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  function highlight(text, q) {
    if (!q) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  function toggle(id) {
    if (openSections.has(id)) openSections.delete(id);
    else openSections.add(id);
    render();
  }

  function search() {
    const q = document.getElementById('refSearch')?.value || '';
    render(q);
  }

  function expandAll() {
    if (!data) return;
    data.sections.forEach(s => openSections.add(s.id));
    render();
  }

  function collapseAll() {
    openSections.clear();
    render();
  }

  return { init, toggle, search, expandAll, collapseAll };
})();
