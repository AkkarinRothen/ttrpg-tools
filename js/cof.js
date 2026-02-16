/* Choir of Flesh — Module */
const CoF = (() => {
  let data = null;
  let char = null;
  let usageDice = [];
  let grid = Array.from({length: 25}, () => ({token: null, terrain: null}));
  let travel = {day: 1, turn: 0, rations: 0, rumors: 0};
  let currentTab = 'character';

  const DICE_CHAIN = ['d4','d6','d8','d10','d12'];
  const STORAGE_CHAR = 'cof_character';
  const STORAGE_USAGE = 'cof_usage_dice';
  const STORAGE_GRID = 'cof_grid';
  const STORAGE_TRAVEL = 'cof_travel';

  const defaultChar = () => ({
    name: '', occupation: '', sin: '', shard: '', doom: '',
    str: 10, dex: 10, con: 10, int: 10, wil: 10, pre: 10,
    humanity: 20, anguish: 0, trauma: 0,
    minorInjuries: 0, majorInjuries: 0,
    notes: ''
  });

  function mod(stat) { return Math.floor((stat - 10) / 2); }
  function roll(sides) { return Math.floor(Math.random() * sides) + 1; }
  function rollD(expr) {
    const m = expr.match(/(\d+)?d(\d+)([+-]\d+)?/i);
    if (!m) return {total: 0, rolls: []};
    const n = parseInt(m[1]) || 1, s = parseInt(m[2]), bonus = parseInt(m[3]) || 0;
    const rolls = Array.from({length: n}, () => roll(s));
    return {total: rolls.reduce((a, b) => a + b, 0) + bonus, rolls};
  }

  function save() {
    localStorage.setItem(STORAGE_CHAR, JSON.stringify(char));
    localStorage.setItem(STORAGE_USAGE, JSON.stringify(usageDice));
    localStorage.setItem(STORAGE_GRID, JSON.stringify(grid));
    localStorage.setItem(STORAGE_TRAVEL, JSON.stringify(travel));
  }

  function load() {
    try { char = JSON.parse(localStorage.getItem(STORAGE_CHAR)) || defaultChar(); } catch { char = defaultChar(); }
    try { usageDice = JSON.parse(localStorage.getItem(STORAGE_USAGE)) || []; } catch { usageDice = []; }
    try { grid = JSON.parse(localStorage.getItem(STORAGE_GRID)) || Array.from({length: 25}, () => ({token: null, terrain: null})); } catch { grid = Array.from({length: 25}, () => ({token: null, terrain: null})); }
    try { travel = JSON.parse(localStorage.getItem(STORAGE_TRAVEL)) || {day: 1, turn: 0, rations: 0, rumors: 0}; } catch { travel = {day: 1, turn: 0, rations: 0, rumors: 0}; }
  }

  // === TAB NAVIGATION ===
  function showTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.cof-tab-content').forEach(el => el.style.display = 'none');
    document.getElementById('cof-' + tab).style.display = 'block';
    document.querySelectorAll('.cof-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
  }

  // === CHARACTER TRACKER ===
  function renderCharacter() {
    const el = document.getElementById('cof-character');
    if (!el) return;

    // Stats inputs
    ['str','dex','con','int','wil','pre'].forEach(s => {
      const inp = document.getElementById('cof-stat-' + s);
      if (inp) inp.value = char[s];
    });
    // Info fields
    ['name','occupation','sin','shard','doom'].forEach(f => {
      const inp = document.getElementById('cof-' + f);
      if (inp) inp.value = char[f];
    });

    // Humanity bar
    renderHumanity();
    // Anguish
    document.getElementById('cof-anguish-val').textContent = char.anguish;
    // Trauma
    document.getElementById('cof-trauma-val').textContent = char.trauma;
    // Injuries
    renderInjuries();
    // Derived
    renderDerived();
    // Usage dice
    renderUsageDice();
  }

  function renderHumanity() {
    const bar = document.getElementById('cof-humanity-bar');
    const val = document.getElementById('cof-humanity-val');
    if (!bar || !val) return;
    val.textContent = char.humanity;
    const pct = (char.humanity / 20) * 100;
    bar.style.width = pct + '%';
    bar.className = 'cof-hum-fill';
    if (char.humanity <= 5) bar.classList.add('critical');
    else if (char.humanity <= 10) bar.classList.add('low');
    if (char.humanity <= 0) {
      val.textContent = '0 — PERDIDO';
      bar.classList.add('dead');
    }
  }

  function renderInjuries() {
    const minEl = document.getElementById('cof-minor-pips');
    const majEl = document.getElementById('cof-major-pips');
    if (!minEl || !majEl) return;

    minEl.innerHTML = Array.from({length: 8}, (_, i) =>
      `<span class="cof-pip ${i < char.minorInjuries ? 'filled' : ''} ${char.minorInjuries >= 8 ? 'dead' : ''}" onclick="CoF.setMinor(${i + 1})"></span>`
    ).join('');
    majEl.innerHTML = Array.from({length: 4}, (_, i) =>
      `<span class="cof-pip major ${i < char.majorInjuries ? 'filled' : ''} ${char.majorInjuries >= 4 ? 'dead' : ''}" onclick="CoF.setMajor(${i + 1})"></span>`
    ).join('');

    const deathEl = document.getElementById('cof-death-alert');
    if (deathEl) {
      deathEl.style.display = (char.minorInjuries >= 8 || char.majorInjuries >= 4) ? 'block' : 'none';
    }
  }

  function renderDerived() {
    const el = document.getElementById('cof-derived');
    if (!el) return;
    el.innerHTML = `
      <span title="Defense Rating (DEX mod)">DEF: ${10 + mod(char.dex)}</span>
      <span title="Carry Capacity (STR)">Carga: ${char.str}</span>
      <span title="Initiative Bonus (DEX mod)">Init: ${mod(char.dex) >= 0 ? '+' : ''}${mod(char.dex)}</span>
      <span title="Move Speed">Mov: 2</span>
    `;
  }

  function updateStat(stat, val) {
    char[stat] = Math.max(1, Math.min(20, parseInt(val) || 10));
    save();
    renderDerived();
  }

  function updateField(field, val) {
    char[field] = val;
    save();
  }

  function adjustHumanity(delta) {
    char.humanity = Math.max(0, Math.min(20, char.humanity + delta));
    save();
    renderHumanity();
    if (char.humanity <= 0) showResult('cof-char-result', '💀 Humanity 0 — Tu personaje se ha perdido. Se convierte en Penitent (Coro) o Unmade (Carne).', 'critical');
  }

  function adjustAnguish(delta) {
    char.anguish = Math.max(0, char.anguish + delta);
    document.getElementById('cof-anguish-val').textContent = char.anguish;
    save();
  }

  function anguishCheck() {
    const r = roll(20);
    const failed = r <= char.anguish;
    let msg = `🎲 d20 = ${r} vs Anguish ${char.anguish} — `;
    if (failed) {
      const bd = data.breakdowns[roll(data.breakdowns.length) - 1];
      msg += `<strong style="color:var(--cof-accent)">¡BREAKDOWN!</strong><br>`;
      msg += `<em>${bd.name}</em>: ${bd.effect}`;
    } else {
      msg += `<strong style="color:#4ade80">Resistes.</strong> Mantienes la cordura... por ahora.`;
    }
    showResult('cof-char-result', msg, failed ? 'critical' : 'success');
  }

  function adjustTrauma(delta) {
    char.trauma = Math.max(0, char.trauma + delta);
    document.getElementById('cof-trauma-val').textContent = char.trauma;
    save();
  }

  function setMinor(n) {
    char.minorInjuries = char.minorInjuries === n ? n - 1 : n;
    save();
    renderInjuries();
  }

  function setMajor(n) {
    char.majorInjuries = char.majorInjuries === n ? n - 1 : n;
    save();
    renderInjuries();
  }

  function postCombatCheck(withSupplies) {
    if (char.minorInjuries <= 0) {
      showResult('cof-char-result', 'No tienes heridas menores que resolver.', 'info');
      return;
    }
    const stat = withSupplies ? char.int : char.con;
    const statName = withSupplies ? 'INT' : 'CON';
    const tn = 12;
    const r = roll(20);
    const total = r + mod(stat);
    const success = total >= tn;

    let msg = `🩹 Post-combate (${statName}): d20(${r}) + ${mod(stat)} = ${total} vs TN ${tn} — `;
    if (success) {
      char.minorInjuries = 0;
      msg += `<strong style="color:#4ade80">Éxito.</strong> Todas las heridas menores sanadas.`;
    } else {
      char.minorInjuries = 0;
      char.majorInjuries = Math.min(4, char.majorInjuries + 1);
      msg += `<strong style="color:var(--cof-accent)">Fallo.</strong> Las heridas menores se curan pero 1 se convierte en Major Injury.`;
    }
    save();
    renderInjuries();
    showResult('cof-char-result', msg, success ? 'success' : 'critical');
  }

  function rollStat(stat) {
    const val = char[stat];
    const m = mod(val);
    const r = roll(20);
    const total = r + m;
    const crit = r === 20 ? ' — ¡CRÍTICO!' : r === 1 ? ' — ¡PIFIA!' : '';
    showResult('cof-char-result', `🎲 ${stat.toUpperCase()} check: d20(${r}) + ${m} = <strong>${total}</strong>${crit}`, r === 1 ? 'critical' : 'success');
  }

  // === USAGE DICE ===
  function renderUsageDice() {
    const el = document.getElementById('cof-usage-list');
    if (!el) return;
    if (usageDice.length === 0) {
      el.innerHTML = '<div style="color:var(--text3);text-align:center;padding:10px;font-size:0.85em">Sin recursos. Agrega raciones, munición, etc.</div>';
      return;
    }
    el.innerHTML = usageDice.map((ud, i) => `
      <div class="cof-usage-item ${ud.exhausted ? 'exhausted' : ''}">
        <span class="cof-usage-name">${ud.name}</span>
        <span class="cof-usage-die">${ud.exhausted ? '✕' : ud.die.toUpperCase()}</span>
        <button class="btn btn-small btn-primary" onclick="CoF.useResource(${i})" ${ud.exhausted ? 'disabled' : ''}>Usar</button>
        <button class="btn btn-small btn-danger" onclick="CoF.removeResource(${i})" title="Quitar">✕</button>
      </div>
    `).join('');
  }

  function addResource() {
    const name = prompt('Nombre del recurso (ej: Raciones, Munición, Antorchas):');
    if (!name) return;
    const die = prompt('Dado inicial (d4, d6, d8, d10, d12):', 'd8');
    if (!die || !DICE_CHAIN.includes(die.toLowerCase())) { alert('Dado no válido'); return; }
    usageDice.push({name, die: die.toLowerCase(), exhausted: false});
    save();
    renderUsageDice();
  }

  function useResource(idx) {
    const ud = usageDice[idx];
    if (!ud || ud.exhausted) return;
    const sides = parseInt(ud.die.slice(1));
    const r = roll(sides);
    const chainIdx = DICE_CHAIN.indexOf(ud.die);
    let msg = `🎲 ${ud.name}: ${ud.die} = ${r}`;
    if (r <= 2) {
      if (chainIdx === 0) {
        ud.exhausted = true;
        msg += ` — <strong style="color:var(--cof-accent)">¡AGOTADO!</strong> ${ud.name} se ha acabado.`;
      } else {
        const newDie = DICE_CHAIN[chainIdx - 1];
        msg += ` — <strong style="color:#fbbf24">Degrada</strong> de ${ud.die} → ${newDie}`;
        ud.die = newDie;
      }
    } else {
      msg += ` — Recurso estable.`;
    }
    save();
    renderUsageDice();
    showResult('cof-char-result', msg, r <= 2 ? 'critical' : 'success');
  }

  function removeResource(idx) {
    usageDice.splice(idx, 1);
    save();
    renderUsageDice();
  }

  // === COMBAT GRID ===
  let selectedToken = null;

  function renderGrid() {
    const el = document.getElementById('cof-grid');
    if (!el) return;
    el.innerHTML = grid.map((cell, i) => {
      const row = Math.floor(i / 5);
      const col = i % 5;
      let cls = 'cof-cell';
      let content = '';
      if (cell.terrain) {
        cls += ' has-terrain';
        content = `<span class="cof-terrain" title="${cell.terrain.name}: ${cell.terrain.effect}">${cell.terrain.icon}</span>`;
      }
      if (cell.token) {
        const tClass = cell.token.type === 'player' ? 'player' : cell.token.type === 'ally' ? 'ally' : 'enemy';
        content += `<span class="cof-token ${tClass}" title="${cell.token.name}">${cell.token.icon}</span>`;
      }
      return `<div class="${cls}" data-idx="${i}" onclick="CoF.clickCell(${i})">${content}<span class="cof-coord">${String.fromCharCode(65+col)}${row+1}</span></div>`;
    }).join('');
  }

  function clickCell(idx) {
    if (selectedToken) {
      // Move token to this cell
      if (grid[idx].token) {
        showResult('cof-combat-result', 'Casilla ocupada por ' + grid[idx].token.name, 'info');
        return;
      }
      grid[idx].token = selectedToken.token;
      grid[selectedToken.fromIdx].token = null;
      selectedToken = null;
      document.querySelectorAll('.cof-cell').forEach(c => c.classList.remove('selected'));
      save();
      renderGrid();
      return;
    }
    if (grid[idx].token) {
      selectedToken = {token: grid[idx].token, fromIdx: idx};
      document.querySelectorAll('.cof-cell').forEach(c => c.classList.remove('selected'));
      document.querySelector(`.cof-cell[data-idx="${idx}"]`)?.classList.add('selected');
      showResult('cof-combat-result', `Seleccionado: ${grid[idx].token.name}. Click en otra casilla para mover.`, 'info');
    }
  }

  function addToken(type) {
    const icons = {player: '⚔️', ally: '🛡️', enemy: '💀'};
    const labels = {player: 'Jugador', ally: 'Aliado', enemy: 'Enemigo'};
    const name = prompt(`Nombre del ${labels[type]}:`, labels[type]);
    if (!name) return;
    const emptyIdx = grid.findIndex(c => !c.token);
    if (emptyIdx === -1) { alert('Grid lleno'); return; }
    grid[emptyIdx] = {...grid[emptyIdx], token: {name, type, icon: icons[type]}};
    save();
    renderGrid();
  }

  function generateTerrain() {
    // Clear existing terrain
    grid.forEach(c => c.terrain = null);
    // Place 3-5 random features
    const count = 3 + roll(3);
    const features = data.terrain_features;
    const available = Array.from({length: 25}, (_, i) => i).filter(i => !grid[i].token);
    for (let i = 0; i < Math.min(count, available.length); i++) {
      const rIdx = Math.floor(Math.random() * available.length);
      const cellIdx = available.splice(rIdx, 1)[0];
      const feat = features[Math.floor(Math.random() * features.length)];
      grid[cellIdx].terrain = feat;
    }
    save();
    renderGrid();
    showResult('cof-combat-result', `🗺️ Terreno generado: ${count} features colocados.`, 'success');
  }

  function clearGrid() {
    grid = Array.from({length: 25}, () => ({token: null, terrain: null}));
    selectedToken = null;
    save();
    renderGrid();
  }

  function rollWound(severity) {
    const types = Object.keys(data['wounds_' + severity]);
    const typeLabels = {blunt: 'Contundente', slash: 'Cortante', pierce: 'Perforante', fire: 'Fuego', divine: 'Divino'};
    const typeSelect = document.getElementById('cof-wound-type');
    const type = typeSelect ? typeSelect.value : types[Math.floor(Math.random() * types.length)];
    const wounds = data['wounds_' + severity][type];
    if (!wounds || wounds.length === 0) return;
    const wound = wounds[Math.floor(Math.random() * wounds.length)];
    const label = severity === 'minor' ? 'Minor' : 'MAJOR';
    showResult('cof-combat-result', `🩹 <strong>${label} Injury</strong> (${typeLabels[type] || type}):<br>${wound}`, severity === 'major' ? 'critical' : 'info');
  }

  // === PRAYER & APOSTASY ===
  function pray(tier) {
    const info = data.prayer_tiers[tier];
    const r = roll(100);
    const total = r + info.bonus;
    const ascension = total >= 100;

    let msg = `✝️ <strong>Oración ${info.name}</strong><br>d100(${r}) + ${info.bonus} = <strong>${total}</strong><br>`;
    if (ascension) {
      msg += `<div class="cof-ascension">☀️ ¡ASCENSIÓN! Tu alma es absorbida por el Coro Celestial. El personaje se pierde para siempre.</div>`;
    } else if (total >= 80) {
      msg += `<span style="color:#fbbf24">Éxito peligroso. El milagro se manifiesta, pero sientes el tirón del Coro.</span>`;
    } else if (total >= 50) {
      msg += `<span style="color:#4ade80">Éxito. ${info.desc}</span>`;
    } else {
      msg += `<span style="color:var(--text2)">El Coro no responde. La oración se disipa sin efecto.</span>`;
    }

    if (tier === 'minor') {
      char.anguish += 1;
      document.getElementById('cof-anguish-val').textContent = char.anguish;
      msg += `<br><small>+1 Anguish (oración menor)</small>`;
    }
    save();
    showResult('cof-faith-result', msg, ascension ? 'critical' : 'success');
  }

  function apostasy() {
    if (char.humanity <= 0) {
      showResult('cof-faith-result', 'No tienes Humanity que sacrificar.', 'critical');
      return;
    }
    const mutation = data.mutations[Math.floor(Math.random() * data.mutations.length)];
    char.humanity = Math.max(0, char.humanity - mutation.cost);
    save();
    renderHumanity();

    showResult('cof-faith-result',
      `🫀 <strong>Acto de Apostasía</strong> — Consumes una Semilla de Carne<br>` +
      `<div class="cof-mutation"><strong>${mutation.name}</strong> (−${mutation.cost} Humanity)<br>${mutation.effect}</div>` +
      `<small>Humanity restante: ${char.humanity}</small>`,
      'critical'
    );
  }

  // === TRAVEL ===
  function renderTravel() {
    const el = document.getElementById('cof-travel');
    if (!el) return;
    document.getElementById('cof-travel-day').textContent = travel.day;
    document.getElementById('cof-travel-turn').textContent = travel.turn + '/4';
    document.getElementById('cof-travel-rations').textContent = travel.rations;
    document.getElementById('cof-travel-rumors').textContent = travel.rumors;
  }

  function travelMove() {
    travel.turn++;
    if (travel.turn > 4) {
      travel.turn = 1;
      travel.day++;
      travel.rations++;
      showResult('cof-travel-result',
        `🌙 <strong>Nuevo día ${travel.day}</strong>. Consumes 1 ración (total consumidas: ${travel.rations}).`,
        'info');
      save();
      renderTravel();
      return;
    }
    const r = roll(10);
    const encounters = data.travel_encounters;
    let key = String(r);
    if (r >= 6 && r <= 7) key = '6-7';
    const event = encounters[key] || encounters[String(r)] || 'Viaje sin incidentes.';

    let msg = `🗺️ Día ${travel.day}, Turno ${travel.turn}/4 — d10 = ${r}<br>`;
    if (r <= 5) {
      msg += `<strong style="color:var(--cof-accent)">${event}</strong>`;
    } else {
      msg += `<span style="color:#4ade80">${event}</span>`;
    }
    save();
    renderTravel();
    showResult('cof-travel-result', msg, r <= 5 ? 'critical' : 'success');
  }

  function scavenge() {
    const statMod = mod(char.int);
    const r = roll(20);
    const total = r + statMod;
    const tn = 10;

    let msg = `🔍 Scavenging — INT check: d20(${r}) + ${statMod} = ${total} vs TN ${tn}<br>`;
    if (total >= tn) {
      const scavRoll = roll(20);
      const result = data.scavenging.find(s => {
        const [lo, hi] = s.roll.split('-').map(Number);
        return hi ? scavRoll >= lo && scavRoll <= hi : scavRoll === lo;
      });
      msg += `Éxito! Tira: ${scavRoll} → <strong>${result ? result.result : 'Nada interesante'}</strong>`;
    } else {
      msg += `<span style="color:var(--text3)">No encuentras nada útil entre los escombros.</span>`;
    }
    showResult('cof-travel-result', msg, total >= tn ? 'success' : 'info');
  }

  function adjustRumors(delta) {
    travel.rumors = Math.max(0, travel.rumors + delta);
    save();
    renderTravel();
  }

  function resetTravel() {
    travel = {day: 1, turn: 0, rations: 0, rumors: 0};
    save();
    renderTravel();
    showResult('cof-travel-result', 'Viaje reiniciado.', 'info');
  }

  // === REFERENCE ===
  function renderReference() {
    const el = document.getElementById('cof-ref-content');
    if (!el || !data.reference) return;
    el.innerHTML = data.reference.sections.map(sec => `
      <div class="cof-ref-section">
        <div class="cof-ref-header" onclick="CoF.toggleRef('${sec.id}')">
          <span>${sec.icon} ${sec.title}</span>
          <span class="cof-ref-arrow" id="cof-ref-arrow-${sec.id}">▸</span>
        </div>
        <div class="cof-ref-body" id="cof-ref-body-${sec.id}" style="display:none">
          ${sec.items.map(item => `
            <div class="cof-ref-item">
              <strong>${item.name}</strong>
              <span>${item.desc}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  function toggleRef(id) {
    const body = document.getElementById('cof-ref-body-' + id);
    const arrow = document.getElementById('cof-ref-arrow-' + id);
    if (!body) return;
    const open = body.style.display !== 'none';
    body.style.display = open ? 'none' : 'block';
    if (arrow) arrow.textContent = open ? '▸' : '▾';
  }

  function searchRef() {
    const q = document.getElementById('cof-ref-search')?.value.toLowerCase().trim();
    if (!q) {
      document.querySelectorAll('.cof-ref-section').forEach(s => s.style.display = '');
      document.querySelectorAll('.cof-ref-item').forEach(i => i.style.display = '');
      document.querySelectorAll('.cof-ref-body').forEach(b => b.style.display = 'none');
      return;
    }
    document.querySelectorAll('.cof-ref-section').forEach(sec => {
      const items = sec.querySelectorAll('.cof-ref-item');
      let hasMatch = false;
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const match = text.includes(q);
        item.style.display = match ? '' : 'none';
        if (match) hasMatch = true;
      });
      sec.style.display = hasMatch ? '' : 'none';
      if (hasMatch) sec.querySelector('.cof-ref-body').style.display = 'block';
    });
  }

  // === RESULT DISPLAY ===
  function showResult(elId, html, type) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = html;
    el.className = 'cof-result ' + (type || '');
    el.style.display = 'block';
    el.scrollIntoView({behavior: 'smooth', block: 'nearest'});
  }

  // === INIT ===
  async function init() {
    try {
      const res = await fetch('data/cof-tables.json');
      data = await res.json();
    } catch { data = {}; }
    load();
    renderCharacter();
    renderGrid();
    renderTravel();
    renderReference();
    showTab('character');
  }

  return {
    init, showTab, updateStat, updateField, rollStat,
    adjustHumanity, adjustAnguish, anguishCheck, adjustTrauma,
    setMinor, setMajor, postCombatCheck,
    addResource, useResource, removeResource,
    clickCell, addToken, generateTerrain, clearGrid, rollWound,
    pray, apostasy,
    travelMove, scavenge, adjustRumors, resetTravel,
    toggleRef, searchRef
  };
})();
