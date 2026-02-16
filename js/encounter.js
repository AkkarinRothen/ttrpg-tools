// === ENCOUNTER BUILDER (D&D 5.5 2024) ===
const Encounter = (() => {
  let monsters = [];
  let selected = [];

  // XP thresholds per character level (2024 DMG)
  const XP_THRESHOLDS = {
    1:  { low: 50,   moderate: 75,   high: 100  },
    2:  { low: 100,  moderate: 150,  high: 200  },
    3:  { low: 150,  moderate: 225,  high: 400  },
    4:  { low: 250,  moderate: 375,  high: 500  },
    5:  { low: 500,  moderate: 750,  high: 1100 },
    6:  { low: 600,  moderate: 1000, high: 1400 },
    7:  { low: 750,  moderate: 1300, high: 1700 },
    8:  { low: 1000, moderate: 1700, high: 2100 },
    9:  { low: 1300, moderate: 2000, high: 2600 },
    10: { low: 1600, moderate: 2300, high: 3100 },
    11: { low: 1900, moderate: 2900, high: 3600 },
    12: { low: 2200, moderate: 3700, high: 4500 },
    13: { low: 2600, moderate: 4200, high: 5400 },
    14: { low: 2900, moderate: 4900, high: 6200 },
    15: { low: 3300, moderate: 5400, high: 7800 },
    16: { low: 3800, moderate: 6100, high: 9800 },
    17: { low: 4500, moderate: 7200, high: 11500 },
    18: { low: 5000, moderate: 8700, high: 13500 },
    19: { low: 5500, moderate: 10700, high: 16000 },
    20: { low: 6400, moderate: 13500, high: 22000 }
  };

  // CR to numeric for sorting
  function crNum(cr) {
    if (cr === '0') return 0;
    if (cr === '1/8') return 0.125;
    if (cr === '1/4') return 0.25;
    if (cr === '1/2') return 0.5;
    return parseFloat(cr);
  }

  async function init() {
    try {
      const res = await fetch('data/monsters-srd.json');
      monsters = await res.json();
      monsters.sort((a, b) => crNum(a.cr) - crNum(b.cr));
    } catch { console.error('Failed to load monsters'); }
    selected = [];
    renderMonsters();
    updateBudget();
  }

  function updateBudget() {
    const level = parseInt(document.getElementById('partyLevel')?.value) || 1;
    const size = parseInt(document.getElementById('partySize')?.value) || 4;
    const t = XP_THRESHOLDS[Math.min(20, Math.max(1, level))];
    const low = t.low * size, mod = t.moderate * size, high = t.high * size;

    const lowEl = document.getElementById('budgetLow');
    const modEl = document.getElementById('budgetMod');
    const highEl = document.getElementById('budgetHigh');
    if (lowEl) lowEl.textContent = low.toLocaleString();
    if (modEl) modEl.textContent = mod.toLocaleString();
    if (highEl) highEl.textContent = high.toLocaleString();

    updateTotal();
  }

  function renderMonsters(filter) {
    const el = document.getElementById('monsterList');
    if (!el) return;
    let list = monsters;
    if (filter) {
      const q = filter.toLowerCase();
      list = monsters.filter(m => m.name.toLowerCase().includes(q) || m.type.toLowerCase().includes(q) || m.cr === q);
    }
    el.innerHTML = list.slice(0, 50).map(m =>
      `<div class="enc-monster" onclick="Encounter.addMonster('${m.name}')">
        <span class="cr">CR ${m.cr}</span>
        <span class="name">${m.name}</span>
        <span class="type">${m.type}</span>
        <span class="xp">${m.xp.toLocaleString()} XP</span>
      </div>`
    ).join('');
    if (list.length > 50) el.innerHTML += `<div style="text-align:center;color:var(--text3);padding:8px;font-size:0.8em">Mostrando 50 de ${list.length}. Usa el filtro para reducir.</div>`;
  }

  function addMonster(name) {
    const m = monsters.find(x => x.name === name);
    if (!m) return;
    const existing = selected.find(s => s.name === name);
    if (existing) { existing.count++; }
    else { selected.push({ ...m, count: 1 }); }
    renderSelected();
    updateTotal();
  }

  function removeMonster(name) {
    const existing = selected.find(s => s.name === name);
    if (!existing) return;
    existing.count--;
    if (existing.count <= 0) selected = selected.filter(s => s.name !== name);
    renderSelected();
    updateTotal();
  }

  function clearSelected() {
    selected = [];
    renderSelected();
    updateTotal();
  }

  function renderSelected() {
    const el = document.getElementById('selectedMonsters');
    if (!el) return;
    if (!selected.length) {
      el.innerHTML = '<div style="color:var(--text3);font-size:0.85em;text-align:center;padding:10px">Click en un monstruo para añadirlo</div>';
      return;
    }
    el.innerHTML = selected.map(s =>
      `<div class="enc-monster">
        <span class="cr">CR ${s.cr}</span>
        <span class="name">${s.name} × ${s.count}</span>
        <span class="xp">${(s.xp * s.count).toLocaleString()} XP</span>
        <button class="btn btn-small btn-secondary" onclick="Encounter.removeMonster('${s.name}')">−</button>
        <button class="btn btn-small btn-secondary" onclick="Encounter.addMonster('${s.name}')">+</button>
      </div>`
    ).join('');
  }

  function updateTotal() {
    const totalXP = selected.reduce((sum, s) => sum + s.xp * s.count, 0);
    const totalEl = document.getElementById('encTotalXP');
    const diffEl = document.getElementById('encDifficulty');
    if (totalEl) totalEl.textContent = totalXP.toLocaleString() + ' XP';

    const level = parseInt(document.getElementById('partyLevel')?.value) || 1;
    const size = parseInt(document.getElementById('partySize')?.value) || 4;
    const t = XP_THRESHOLDS[Math.min(20, Math.max(1, level))];

    let diff = 'Trivial', cls = '';
    if (totalXP >= t.high * size) { diff = 'Alta'; cls = 'high'; }
    else if (totalXP >= t.moderate * size) { diff = 'Moderada'; cls = 'moderate'; }
    else if (totalXP >= t.low * size) { diff = 'Baja'; cls = 'low'; }

    if (diffEl) {
      diffEl.textContent = diff;
      diffEl.className = 'enc-diff' + (cls ? ' ' + cls : '');
    }
  }

  function filterMonsters() {
    const q = document.getElementById('monsterSearch')?.value || '';
    renderMonsters(q);
  }

  return { init, addMonster, removeMonster, clearSelected, updateBudget, filterMonsters };
})();
