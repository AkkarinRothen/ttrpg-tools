// === INITIATIVE TRACKER ===
const Initiative = (() => {
  let combatants = [];
  let currentIdx = -1;
  let round = 0;
  const SAVE_KEY = 'ttrpg_initiative';
  const CONDITIONS = ['Blinded','Charmed','Deafened','Frightened','Grappled','Incapacitated',
    'Invisible','Paralyzed','Petrified','Poisoned','Prone','Restrained','Stunned','Unconscious',
    'Exhaustion','Concentrating'];

  function init() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (s) { combatants = s.combatants || []; currentIdx = s.currentIdx ?? -1; round = s.round ?? 0; }
    } catch {}
    render();
  }

  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ combatants, currentIdx, round }));
  }

  function add() {
    const name = document.getElementById('initName').value.trim();
    const bonus = parseInt(document.getElementById('initBonus').value) || 0;
    const hp = document.getElementById('initHP').value.trim();
    if (!name) return;
    const roll = Math.floor(Math.random() * 20) + 1 + bonus;
    combatants.push({ id: Date.now(), name, roll, bonus, hp: hp || '—', conditions: [] });
    combatants.sort((a, b) => b.roll - a.roll);
    document.getElementById('initName').value = '';
    document.getElementById('initBonus').value = '';
    document.getElementById('initHP').value = '';
    save(); render();
  }

  function remove(id) {
    const idx = combatants.findIndex(c => c.id === id);
    combatants = combatants.filter(c => c.id !== id);
    if (currentIdx >= combatants.length) currentIdx = 0;
    save(); render();
  }

  function nextTurn() {
    if (!combatants.length) return;
    if (currentIdx === -1) { currentIdx = 0; round = 1; }
    else {
      currentIdx++;
      if (currentIdx >= combatants.length) { currentIdx = 0; round++; }
    }
    save(); render();
  }

  function prevTurn() {
    if (!combatants.length || currentIdx <= 0) return;
    currentIdx--;
    save(); render();
  }

  function reset() {
    combatants = []; currentIdx = -1; round = 0;
    save(); render();
  }

  function reroll() {
    combatants.forEach(c => { c.roll = Math.floor(Math.random() * 20) + 1 + c.bonus; });
    combatants.sort((a, b) => b.roll - a.roll);
    currentIdx = -1; round = 0;
    save(); render();
  }

  function toggleCondition(id) {
    const c = combatants.find(x => x.id === id);
    if (!c) return;
    const sel = prompt('Condiciones (separadas por coma):\n' + CONDITIONS.join(', ') + '\n\nActuales: ' + (c.conditions.join(', ') || 'ninguna'));
    if (sel === null) return;
    c.conditions = sel.split(',').map(s => s.trim()).filter(s => s);
    save(); render();
  }

  function updateHP(id) {
    const c = combatants.find(x => x.id === id);
    if (!c) return;
    const val = prompt(`HP actual de ${c.name}:`, c.hp);
    if (val === null) return;
    c.hp = val || '—';
    save(); render();
  }

  function render() {
    const list = document.getElementById('initList');
    const roundEl = document.getElementById('roundDisplay');

    if (roundEl) {
      roundEl.innerHTML = round > 0
        ? `Ronda <strong>${round}</strong>`
        : 'Sin iniciar';
    }

    if (!combatants.length) {
      list.innerHTML = '<div style="text-align:center;color:var(--text3);padding:20px;font-size:0.88em">Agrega combatientes para comenzar</div>';
      return;
    }

    list.innerHTML = combatants.map((c, i) =>
      `<div class="init-item${i === currentIdx ? ' current' : ''}">
        <div class="init-order">${c.roll}</div>
        <div class="init-name">${c.name}</div>
        <div class="init-hp" onclick="Initiative.updateHP(${c.id})" style="cursor:pointer" title="Click para editar HP">❤ ${c.hp}</div>
        <div class="init-conds">
          ${c.conditions.map(cd => `<span class="init-cond">${cd}</span>`).join('')}
        </div>
        <div class="init-acts">
          <button onclick="Initiative.toggleCondition(${c.id})" title="Condiciones">⚡</button>
          <button onclick="Initiative.remove(${c.id})" title="Eliminar">✕</button>
        </div>
      </div>`
    ).join('');
  }

  return { init, add, remove, nextTurn, prevTurn, reset, reroll, toggleCondition, updateHP };
})();
