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
    combatants.push({ id: Date.now(), name, roll, bonus, hp: hp || '—', maxHp: hp || '—', conditions: [] });
    combatants.sort((a, b) => b.roll - a.roll);
    document.getElementById('initName').value = '';
    document.getElementById('initBonus').value = '';
    document.getElementById('initHP').value = '';
    save(); render();
    SFX.click();
  }

  function remove(id) {
    combatants = combatants.filter(c => c.id !== id);
    if (currentIdx >= combatants.length) currentIdx = Math.max(0, combatants.length - 1);
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
    SFX.click();
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
    SFX.diceRoll();
  }

  function toggleCondition(id, condition) {
    const c = combatants.find(x => x.id === id);
    if (!c) return;
    const idx = c.conditions.indexOf(condition);
    if (idx >= 0) c.conditions.splice(idx, 1);
    else c.conditions.push(condition);
    save(); render();
  }

  function damageHP(id, delta) {
    const c = combatants.find(x => x.id === id);
    if (!c || c.hp === '—') return;
    const current = parseInt(c.hp) || 0;
    c.hp = String(Math.max(0, current + delta));
    if (parseInt(c.hp) === 0 && !c.conditions.includes('Unconscious')) {
      c.conditions.push('Unconscious');
    }
    save(); render();
  }

  function editHP(id) {
    const c = combatants.find(x => x.id === id);
    if (!c) return;
    const val = prompt(`HP de ${c.name}:`, c.hp);
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

    list.innerHTML = combatants.map((c, i) => {
      const isCurrent = i === currentIdx;
      const hpNum = parseInt(c.hp);
      const maxNum = parseInt(c.maxHp);
      const hpLow = !isNaN(hpNum) && !isNaN(maxNum) && hpNum <= maxNum * 0.25 && hpNum > 0;
      const hpDead = !isNaN(hpNum) && hpNum === 0;

      return `<div class="init-item${isCurrent ? ' current' : ''}">
        <div class="init-order">${c.roll}</div>
        <div class="init-name">${c.name}</div>
        <div class="init-hp-group">
          ${c.hp !== '—' ? `<button class="init-hp-btn" onclick="Initiative.damageHP(${c.id},-1)" title="Daño">-</button>` : ''}
          <span class="init-hp${hpLow ? ' low' : ''}${hpDead ? ' dead' : ''}" onclick="Initiative.editHP(${c.id})" title="Click para editar">${c.hp !== '—' ? c.hp + (maxNum ? '/' + c.maxHp : '') : '—'}</span>
          ${c.hp !== '—' ? `<button class="init-hp-btn" onclick="Initiative.damageHP(${c.id},1)" title="Curar">+</button>` : ''}
        </div>
        <div class="init-conds">
          ${c.conditions.map(cd => `<span class="init-cond" onclick="Initiative.toggleCondition(${c.id},'${cd}')" title="Click para quitar">${cd}</span>`).join('')}
        </div>
        <div class="init-acts">
          <button onclick="Initiative.showCondMenu(${c.id})" title="Condiciones">&#x26A1;</button>
          <button onclick="Initiative.remove(${c.id})" title="Eliminar">&#x2715;</button>
        </div>
        <div class="init-cond-menu" id="cond-menu-${c.id}" style="display:none">
          ${CONDITIONS.map(cd => `<label class="init-cond-opt${c.conditions.includes(cd) ? ' active' : ''}"><input type="checkbox" ${c.conditions.includes(cd) ? 'checked' : ''} onchange="Initiative.toggleCondition(${c.id},'${cd}')">${cd}</label>`).join('')}
        </div>
      </div>`;
    }).join('');
  }

  function showCondMenu(id) {
    const el = document.getElementById('cond-menu-' + id);
    if (!el) return;
    const isOpen = el.style.display !== 'none';
    // Close all menus first
    document.querySelectorAll('.init-cond-menu').forEach(m => m.style.display = 'none');
    if (!isOpen) el.style.display = 'flex';
  }

  return { init, add, remove, nextTurn, prevTurn, reset, reroll, toggleCondition, damageHP, editHP, showCondMenu };
})();
