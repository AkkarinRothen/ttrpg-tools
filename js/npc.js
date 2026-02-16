// === NPC GENERATOR ===
const NPC = (() => {
  let data = null;

  async function init() {
    try {
      const res = await fetch('data/npc-tables.json');
      data = await res.json();
    } catch { console.error('Failed to load NPC tables'); }
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function rollStat() {
    // 4d6 drop lowest
    const rolls = [0, 0, 0, 0].map(() => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => b - a);
    return rolls[0] + rolls[1] + rolls[2];
  }

  function mod(stat) {
    const m = Math.floor((stat - 10) / 2);
    return m >= 0 ? '+' + m : '' + m;
  }

  function generate() {
    if (!data) return;
    const raceOpt = document.getElementById('npcRace')?.value || 'random';
    const genderOpt = document.getElementById('npcGender')?.value || 'random';

    // Determine name pool
    let race = raceOpt;
    if (race === 'random') race = pick(['human', 'human', 'human', 'elf', 'dwarf', 'halfling']);

    let gender = genderOpt;
    if (gender === 'random') gender = pick(['male', 'female']);

    let firstName;
    if (race === 'human') {
      const key = gender === 'male' ? 'human_male' : 'human_female';
      firstName = pick(data.names[key]);
    } else {
      firstName = pick(data.names[race]);
    }
    const lastName = pick(data.surnames);

    // Stats
    const stats = {
      STR: rollStat(), DEX: rollStat(), CON: rollStat(),
      INT: rollStat(), WIS: rollStat(), CHA: rollStat()
    };

    const npc = {
      name: firstName + ' ' + lastName,
      race: race.charAt(0).toUpperCase() + race.slice(1),
      gender: gender === 'male' ? 'Masculino' : 'Femenino',
      occupation: pick(data.occupations),
      appearance: pick(data.appearances),
      trait: pick(data.traits),
      ideal: pick(data.ideals),
      bond: pick(data.bonds),
      flaw: pick(data.flaws),
      motivation: pick(data.motivations),
      stats
    };

    renderNPC(npc);
  }

  function renderNPC(npc) {
    const el = document.getElementById('npcCard');
    el.innerHTML = `
      <div class="npc-name">${npc.name}</div>
      <div class="npc-title">${npc.race} ${npc.gender} — ${npc.occupation}</div>
      <div class="npc-stats">
        ${Object.entries(npc.stats).map(([k, v]) =>
          `<div class="npc-stat"><div class="stat-name">${k}</div><div class="stat-val">${v}</div><div class="stat-mod">(${mod(v)})</div></div>`
        ).join('')}
      </div>
      <div class="npc-details">
        <div class="npc-detail"><div class="label">Apariencia</div><div class="value">${npc.appearance}</div></div>
        <div class="npc-detail"><div class="label">Personalidad</div><div class="value">${npc.trait}</div></div>
        <div class="npc-detail"><div class="label">Ideal</div><div class="value">${npc.ideal}</div></div>
        <div class="npc-detail"><div class="label">Vinculo</div><div class="value">${npc.bond}</div></div>
        <div class="npc-detail"><div class="label">Defecto</div><div class="value">${npc.flaw}</div></div>
        <div class="npc-detail"><div class="label">Motivacion</div><div class="value">${npc.motivation}</div></div>
      </div>
    `;
    el.style.display = 'block';
    el.style.animation = 'none'; el.offsetHeight; el.style.animation = 'fadeIn 0.3s';
  }

  return { init, generate };
})();
