// === RANDOM TABLES ===
const Tables = (() => {
  let data = null;
  const CUSTOM_KEY = 'ttrpg_custom_tables';
  let customTables = [];

  async function init() {
    try {
      const res = await fetch('data/random-tables.json');
      data = await res.json();
    } catch { console.error('Failed to load random tables'); return; }
    try { customTables = JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]'); } catch { customTables = []; }
    renderList();
  }

  function renderList() {
    const el = document.getElementById('tableList');
    if (!data) return;
    const all = [...data.tables, ...customTables];
    el.innerHTML = all.map(t =>
      `<div class="table-item" onclick="Tables.roll('${t.id}')">
        <span class="ti-icon">${t.icon}</span>
        <div class="ti-info"><div class="ti-name">${t.name}</div><div class="ti-desc">${t.desc}</div></div>
        <span class="ti-count">${t.entries.length} items</span>
      </div>`
    ).join('');
  }

  function roll(id) {
    const all = [...(data ? data.tables : []), ...customTables];
    const table = all.find(t => t.id === id);
    if (!table) return;
    const idx = Math.floor(Math.random() * table.entries.length);
    const entry = table.entries[idx];
    document.getElementById('tableResultVal').textContent = entry;
    document.getElementById('tableResultSrc').textContent = `${table.icon} ${table.name} — Resultado ${idx + 1} de ${table.entries.length}`;
    const el = document.getElementById('tableResult');
    el.style.display = 'block';
    el.style.animation = 'none'; el.offsetHeight; el.style.animation = 'fadeIn 0.3s';
  }

  function showCustomForm() {
    document.getElementById('customTableForm').style.display = 'block';
    document.getElementById('ctName').value = '';
    document.getElementById('ctIcon').value = '🎲';
    document.getElementById('ctDesc').value = '';
    document.getElementById('ctEntries').value = '';
  }

  function hideCustomForm() {
    document.getElementById('customTableForm').style.display = 'none';
  }

  function saveCustom() {
    const name = document.getElementById('ctName').value.trim();
    const icon = document.getElementById('ctIcon').value.trim() || '🎲';
    const desc = document.getElementById('ctDesc').value.trim();
    const raw = document.getElementById('ctEntries').value.trim();
    if (!name || !raw) { alert('Nombre y entradas son obligatorios'); return; }
    const entries = raw.split('\n').map(e => e.trim()).filter(e => e);
    if (entries.length < 2) { alert('Necesitas al menos 2 entradas'); return; }
    const id = 'custom-' + Date.now();
    customTables.push({ id, name, icon, desc: desc || 'Tabla personalizada', entries });
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(customTables));
    hideCustomForm();
    renderList();
  }

  function deleteCustom(id) {
    customTables = customTables.filter(t => t.id !== id);
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(customTables));
    renderList();
  }

  return { init, roll, showCustomForm, hideCustomForm, saveCustom, deleteCustom };
})();
