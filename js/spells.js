/* Spell Tracker — D&D 5.5 Spell Slot Management */
const Spells = (() => {
  const SKEY = 'ttrpg_spells';
  let state = null;

  const SLOT_TABLE = {
    // [level]: [1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th]
    1:  [2,0,0,0,0,0,0,0,0],
    2:  [3,0,0,0,0,0,0,0,0],
    3:  [4,2,0,0,0,0,0,0,0],
    4:  [4,3,0,0,0,0,0,0,0],
    5:  [4,3,2,0,0,0,0,0,0],
    6:  [4,3,3,0,0,0,0,0,0],
    7:  [4,3,3,1,0,0,0,0,0],
    8:  [4,3,3,2,0,0,0,0,0],
    9:  [4,3,3,3,1,0,0,0,0],
    10: [4,3,3,3,2,0,0,0,0],
    11: [4,3,3,3,2,1,0,0,0],
    12: [4,3,3,3,2,1,0,0,0],
    13: [4,3,3,3,2,1,1,0,0],
    14: [4,3,3,3,2,1,1,0,0],
    15: [4,3,3,3,2,1,1,1,0],
    16: [4,3,3,3,2,1,1,1,0],
    17: [4,3,3,3,2,1,1,1,1],
    18: [4,3,3,3,3,1,1,1,1],
    19: [4,3,3,3,3,2,1,1,1],
    20: [4,3,3,3,3,2,2,1,1]
  };

  const HALF_CASTERS = ['paladin', 'ranger'];
  const THIRD_CASTERS = ['eldritch-knight', 'arcane-trickster'];

  function defaultState() {
    return {
      className: 'wizard',
      level: 1,
      slots: [2,0,0,0,0,0,0,0,0],
      used: [0,0,0,0,0,0,0,0,0],
      concentration: null,
      prepared: []
    };
  }

  function init() {
    try { state = JSON.parse(localStorage.getItem(SKEY)); } catch {}
    if (!state) state = defaultState();
    renderAll();
  }

  function save() { localStorage.setItem(SKEY, JSON.stringify(state)); }

  function getSlots(className, charLevel) {
    let casterLevel = charLevel;
    if (HALF_CASTERS.includes(className)) casterLevel = Math.max(1, Math.floor(charLevel / 2));
    else if (THIRD_CASTERS.includes(className)) casterLevel = Math.max(1, Math.floor(charLevel / 3));
    casterLevel = Math.min(20, Math.max(1, casterLevel));
    return [...SLOT_TABLE[casterLevel]];
  }

  function setClass() {
    const cls = document.getElementById('spellClass').value;
    const lvl = parseInt(document.getElementById('spellLevel').value) || 1;
    state.className = cls;
    state.level = Math.min(20, Math.max(1, lvl));
    state.slots = getSlots(cls, state.level);
    state.used = state.used.map((u, i) => Math.min(u, state.slots[i]));
    save();
    renderSlots();
  }

  function toggleSlot(level, idx) {
    // level is 0-indexed (0 = 1st level)
    if (idx < state.used[level]) {
      // Unuse it
      state.used[level] = idx;
    } else {
      // Use it
      state.used[level] = idx + 1;
    }
    save();
    renderSlots();
    SFX.click();
  }

  function longRest() {
    state.used = [0,0,0,0,0,0,0,0,0];
    state.concentration = null;
    save();
    renderSlots();
    renderConcentration();
    SFX.click();
  }

  function setConcentration() {
    const name = prompt('Hechizo de concentración activo:', state.concentration || '');
    state.concentration = name || null;
    save();
    renderConcentration();
  }

  function dropConcentration() {
    state.concentration = null;
    save();
    renderConcentration();
  }

  function addPrepared() {
    const name = prompt('Nombre del hechizo:');
    if (!name) return;
    const level = parseInt(prompt('Nivel del hechizo (0 para cantrip):', '1'));
    if (isNaN(level) || level < 0 || level > 9) return;
    state.prepared.push({ name, level, notes: '' });
    save();
    renderPrepared();
  }

  function removePrepared(idx) {
    state.prepared.splice(idx, 1);
    save();
    renderPrepared();
  }

  function renderAll() {
    document.getElementById('spellClass').value = state.className;
    document.getElementById('spellLevel').value = state.level;
    renderSlots();
    renderConcentration();
    renderPrepared();
  }

  function renderSlots() {
    const el = document.getElementById('spellSlotsGrid');
    if (!el) return;
    const labels = ['1ro', '2do', '3ro', '4to', '5to', '6to', '7mo', '8vo', '9no'];
    let html = '';
    for (let i = 0; i < 9; i++) {
      if (state.slots[i] === 0) continue;
      html += `<div class="spell-slot-row">
        <span class="spell-slot-label">${labels[i]}</span>
        <div class="spell-pips">`;
      for (let j = 0; j < state.slots[i]; j++) {
        const used = j < state.used[i];
        html += `<span class="spell-pip ${used ? 'used' : 'available'}" onclick="Spells.toggleSlot(${i},${j})"></span>`;
      }
      html += `</div>
        <span class="spell-slot-count">${state.slots[i] - state.used[i]}/${state.slots[i]}</span>
      </div>`;
    }
    if (!html) html = '<div style="color:var(--text3);text-align:center;padding:10px">Sin slots disponibles a este nivel</div>';
    el.innerHTML = html;
  }

  function renderConcentration() {
    const el = document.getElementById('spellConcentration');
    if (!el) return;
    if (state.concentration) {
      el.innerHTML = `<div class="concentration-badge active">🔮 ${state.concentration} <button class="btn btn-small btn-danger" onclick="Spells.dropConcentration()" style="margin-left:8px;padding:2px 6px">✕</button></div>`;
    } else {
      el.innerHTML = `<div class="concentration-badge inactive">Sin concentración activa</div>`;
    }
  }

  function renderPrepared() {
    const el = document.getElementById('spellPreparedList');
    if (!el) return;
    if (!state.prepared.length) {
      el.innerHTML = '<div style="color:var(--text3);text-align:center;padding:10px;font-size:0.85em">Sin hechizos preparados</div>';
      return;
    }
    // Sort by level
    const sorted = [...state.prepared].sort((a, b) => a.level - b.level);
    el.innerHTML = sorted.map((sp, idx) => {
      const origIdx = state.prepared.indexOf(sp);
      const lvlLabel = sp.level === 0 ? 'Cantrip' : `Nv ${sp.level}`;
      return `<div class="prepared-item">
        <span class="prepared-level">${lvlLabel}</span>
        <span class="prepared-name">${sp.name}</span>
        <button class="btn btn-small btn-danger" onclick="Spells.removePrepared(${origIdx})" style="padding:2px 6px">✕</button>
      </div>`;
    }).join('');
  }

  return { init, setClass, toggleSlot, longRest, setConcentration, dropConcentration, addPrepared, removePrepared };
})();
