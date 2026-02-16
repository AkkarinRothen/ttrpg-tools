/* Choir of Flesh — Module */
const CoF = (() => {
  let data = null;
  let char = null;
  let usageDice = [];
  let grid = Array.from({length: 25}, () => ({token: null, terrain: null}));
  let travel = {day: 1, turn: 0, rations: 0, rumors: 0};
  let settlement = {name: '', population: 5, discontent: 0, renown: 0, buildings: []};
  let incursionGrid = Array(9).fill(null);
  let characters = [];
  let activeCharIdx = 0;
  let currentTab = 'character';

  const DICE_CHAIN = ['d4','d6','d8','d10','d12'];
  const STORAGE_CHAR = 'cof_character';
  const STORAGE_USAGE = 'cof_usage_dice';
  const STORAGE_GRID = 'cof_grid';
  const STORAGE_TRAVEL = 'cof_travel';
  const STORAGE_SETTLE = 'cof_settlement';
  const STORAGE_INCURSION = 'cof_incursion';
  const STORAGE_CHARS = 'cof_characters';
  const STORAGE_ACTIVE = 'cof_active_char';

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
    // Sync current char back to characters array
    if (characters[activeCharIdx]) {
      characters[activeCharIdx] = { char, usageDice };
    }
    localStorage.setItem(STORAGE_CHAR, JSON.stringify(char));
    localStorage.setItem(STORAGE_USAGE, JSON.stringify(usageDice));
    localStorage.setItem(STORAGE_GRID, JSON.stringify(grid));
    localStorage.setItem(STORAGE_TRAVEL, JSON.stringify(travel));
    localStorage.setItem(STORAGE_SETTLE, JSON.stringify(settlement));
    localStorage.setItem(STORAGE_INCURSION, JSON.stringify(incursionGrid));
    saveChars();
  }

  function saveChars() {
    localStorage.setItem(STORAGE_CHARS, JSON.stringify(characters));
    localStorage.setItem(STORAGE_ACTIVE, String(activeCharIdx));
  }

  function load() {
    // Load multi-character
    try { characters = JSON.parse(localStorage.getItem(STORAGE_CHARS)) || []; } catch { characters = []; }
    try { activeCharIdx = parseInt(localStorage.getItem(STORAGE_ACTIVE)) || 0; } catch { activeCharIdx = 0; }

    // Migrate: if old single-char exists and no characters array
    if (characters.length === 0) {
      try {
        const oldChar = JSON.parse(localStorage.getItem(STORAGE_CHAR));
        const oldUsage = JSON.parse(localStorage.getItem(STORAGE_USAGE));
        if (oldChar) {
          characters.push({ char: oldChar, usageDice: oldUsage || [] });
          activeCharIdx = 0;
          saveChars();
        }
      } catch {}
    }

    if (characters.length === 0) {
      characters.push({ char: defaultChar(), usageDice: [] });
      activeCharIdx = 0;
    }

    // Set active character
    if (activeCharIdx >= characters.length) activeCharIdx = 0;
    char = characters[activeCharIdx].char;
    usageDice = characters[activeCharIdx].usageDice;

    try { grid = JSON.parse(localStorage.getItem(STORAGE_GRID)) || Array.from({length: 25}, () => ({token: null, terrain: null})); } catch { grid = Array.from({length: 25}, () => ({token: null, terrain: null})); }
    try { travel = JSON.parse(localStorage.getItem(STORAGE_TRAVEL)) || {day: 1, turn: 0, rations: 0, rumors: 0}; } catch { travel = {day: 1, turn: 0, rations: 0, rumors: 0}; }
    try { settlement = JSON.parse(localStorage.getItem(STORAGE_SETTLE)) || {name: '', population: 5, discontent: 0, renown: 0, buildings: []}; } catch { settlement = {name: '', population: 5, discontent: 0, renown: 0, buildings: []}; }
    try { incursionGrid = JSON.parse(localStorage.getItem(STORAGE_INCURSION)) || Array(9).fill(null); } catch { incursionGrid = Array(9).fill(null); }
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
    SFX.diceRoll();
    Bus.emit('cof:rolled', { text: `CoF Anguish Check: d20=${r} vs ${char.anguish} — ${failed ? 'BREAKDOWN' : 'Resiste'}` });
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
    SFX.diceRoll();
    Bus.emit('cof:rolled', { text: `CoF ${stat.toUpperCase()} check: d20(${r})+${m}=${total}${crit}` });
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
    SFX.diceRoll();
    if (ascension) SFX.critFail();
    Bus.emit('cof:rolled', { text: `CoF Prayer ${info.name}: d100(${r})+${info.bonus}=${total}${ascension ? ' — ASCENSION!' : ''}` });
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

  // === MULTI-CHARACTER ===
  function renderCharSelect() {
    const sel = document.getElementById('cof-char-select');
    if (!sel) return;
    sel.innerHTML = characters.map((c, i) =>
      `<option value="${i}"${i === activeCharIdx ? ' selected' : ''}>${c.char.name || 'Personaje ' + (i + 1)}</option>`
    ).join('');
  }

  function switchChar(idx) {
    // Save current char back
    characters[activeCharIdx] = { char, usageDice };
    activeCharIdx = parseInt(idx);
    if (activeCharIdx >= characters.length) activeCharIdx = 0;
    char = characters[activeCharIdx].char;
    usageDice = characters[activeCharIdx].usageDice;
    saveChars();
    save();
    renderCharacter();
  }

  function newChar() {
    if (characters.length >= 5) { alert('Maximo 5 personajes'); return; }
    const name = prompt('Nombre del nuevo personaje:');
    if (!name) return;
    const newC = defaultChar();
    newC.name = name;
    characters.push({ char: newC, usageDice: [] });
    activeCharIdx = characters.length - 1;
    char = characters[activeCharIdx].char;
    usageDice = characters[activeCharIdx].usageDice;
    saveChars();
    save();
    renderCharacter();
    renderCharSelect();
  }

  function deleteChar() {
    if (characters.length <= 1) { alert('Debes tener al menos 1 personaje'); return; }
    if (!confirm(`Eliminar ${char.name || 'este personaje'}?`)) return;
    characters.splice(activeCharIdx, 1);
    activeCharIdx = Math.min(activeCharIdx, characters.length - 1);
    char = characters[activeCharIdx].char;
    usageDice = characters[activeCharIdx].usageDice;
    saveChars();
    save();
    renderCharacter();
    renderCharSelect();
  }

  // === SETTLEMENT ===
  function renderSettlement() {
    const el = document.getElementById('cof-settlement');
    if (!el) return;
    const nameInp = document.getElementById('cof-settle-name');
    if (nameInp) nameInp.value = settlement.name;
    document.getElementById('cof-settle-pop').textContent = settlement.population;
    document.getElementById('cof-settle-disc').textContent = settlement.discontent;
    document.getElementById('cof-settle-renown').textContent = settlement.renown;

    // Tier
    let tier = 'Farmstead';
    if (settlement.population >= 26) tier = 'Town';
    else if (settlement.population >= 11) tier = 'Village';
    document.getElementById('cof-settle-tier').textContent = tier;

    // Upkeep
    const upkeep = Math.max(1, Math.ceil(settlement.population / 2));
    document.getElementById('cof-settle-upkeep').textContent = upkeep;

    renderBuildings();
  }

  function updateSettlement(field, val) {
    settlement[field] = val;
    save();
  }

  function adjustSettlement(field, delta) {
    if (field === 'population') settlement.population = Math.max(0, settlement.population + delta);
    else if (field === 'discontent') settlement.discontent = Math.max(0, settlement.discontent + delta);
    else if (field === 'renown') settlement.renown = Math.max(0, settlement.renown + delta);
    save();
    renderSettlement();
  }

  function renderBuildings() {
    const el = document.getElementById('cof-building-list');
    if (!el) return;
    if (!settlement.buildings.length) {
      el.innerHTML = '<div style="color:var(--text3);text-align:center;padding:10px;font-size:0.85em">Sin edificios. Construye para mejorar el asentamiento.</div>';
      return;
    }
    el.innerHTML = settlement.buildings.map((b, i) =>
      `<div class="cof-building-item">
        <span class="cof-building-icon">${b.icon}</span>
        <span class="cof-building-name">${b.name}</span>
        <span class="cof-building-effect">${b.effect}</span>
        <button class="btn btn-small btn-danger" onclick="CoF.removeBuilding(${i})" style="padding:2px 6px">&#x2715;</button>
      </div>`
    ).join('');
  }

  function addBuilding() {
    if (!data || !data.settlement_buildings) return;
    const buildings = data.settlement_buildings;
    const names = buildings.map(b => b.name).join('\n');
    const choice = prompt('Edificio a construir:\n' + names);
    if (!choice) return;
    const found = buildings.find(b => b.name.toLowerCase() === choice.toLowerCase());
    if (!found) { alert('Edificio no encontrado'); return; }
    settlement.buildings.push({...found});
    save();
    renderBuildings();
    showResult('cof-settlement-result', `🏗️ <strong>${found.name}</strong> construido. ${found.effect}. Costo: ${found.cost} raciones.`, 'success');
  }

  function removeBuilding(idx) {
    const b = settlement.buildings[idx];
    settlement.buildings.splice(idx, 1);
    save();
    renderBuildings();
    showResult('cof-settlement-result', `🗑️ ${b.name} demolido.`, 'info');
  }

  // === INCURSION 3x3 ===
  function renderIncursion() {
    const el = document.getElementById('cof-incursion-grid');
    if (!el) return;
    const labels = ['NW','N','NE','W','Centro','E','SW','S','SE'];
    el.innerHTML = incursionGrid.map((poi, i) => {
      if (!poi) {
        return `<div class="cof-inc-cell empty" onclick="CoF.revealIncursionCell(${i})"><span class="cof-inc-label">${labels[i]}</span><span class="cof-inc-unknown">?</span></div>`;
      }
      return `<div class="cof-inc-cell revealed" onclick="CoF.showIncursionDetail(${i})"><span class="cof-inc-label">${labels[i]}</span><span class="cof-inc-poi">${poi.substring(0, 30)}${poi.length > 30 ? '...' : ''}</span></div>`;
    }).join('');
  }

  function generateIncursion() {
    if (!data || !data.incursion_pois) return;
    if (travel.rumors < 10) {
      showResult('cof-incursion-result', `⚠️ Necesitas 10 Rumors para generar una Incursion. Tienes ${travel.rumors}.`, 'critical');
      return;
    }
    // Consume 10 rumors
    travel.rumors -= 10;
    renderTravel();
    // Pick 9 unique POIs
    const pool = [...data.incursion_pois];
    incursionGrid = [];
    for (let i = 0; i < 9; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      incursionGrid.push(pool.splice(idx, 1)[0]);
    }
    save();
    renderIncursion();
    showResult('cof-incursion-result', '🗺️ Incursion generada! 9 Points of Interest descubiertos. Click en cada celda para ver detalles.', 'success');
    SFX.click();
  }

  function revealIncursionCell(idx) {
    if (incursionGrid[idx]) {
      showIncursionDetail(idx);
      return;
    }
    showResult('cof-incursion-result', '⚠️ Genera una Incursion primero con el boton.', 'info');
  }

  function showIncursionDetail(idx) {
    const poi = incursionGrid[idx];
    if (!poi) return;
    const labels = ['Noroeste','Norte','Noreste','Oeste','Centro','Este','Suroeste','Sur','Sureste'];
    showResult('cof-incursion-result', `📍 <strong>${labels[idx]}</strong><br><br>${poi}`, 'info');
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
    renderCharSelect();
    renderGrid();
    renderTravel();
    renderSettlement();
    renderIncursion();
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
    toggleRef, searchRef,
    switchChar, newChar, deleteChar,
    updateSettlement, adjustSettlement, addBuilding, removeBuilding,
    generateIncursion, revealIncursionCell, showIncursionDetail
  };
})();
