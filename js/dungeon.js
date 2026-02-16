/* Dungeon Generator — Procedural room-based dungeons */
const Dungeon = (() => {
  let data = null;
  let currentDungeon = null;

  async function init() {
    try {
      const res = await fetch('data/dungeon-tables.json');
      data = await res.json();
    } catch { console.error('Failed to load dungeon tables'); }
  }

  function roll(sides) { return Math.floor(Math.random() * sides) + 1; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function generate() {
    if (!data) return;
    const size = document.getElementById('dungeonSize').value;
    const difficulty = document.getElementById('dungeonDifficulty').value;
    const roomCount = size === 'small' ? 5 : size === 'medium' ? 8 : 12;
    const theme = pick(data.dungeonThemes);

    const rooms = [];
    for (let i = 0; i < roomCount; i++) {
      rooms.push(generateRoom(i, roomCount, difficulty));
    }

    // Connect rooms
    for (let i = 0; i < rooms.length - 1; i++) {
      const conn = pick(data.connections);
      rooms[i].connectionTo = i + 1;
      rooms[i].connectionType = conn;
    }
    // Add some extra connections for larger dungeons
    if (roomCount >= 8) {
      const extras = Math.floor(roomCount / 4);
      for (let e = 0; e < extras; e++) {
        const from = roll(roomCount - 3);
        const to = Math.min(roomCount - 1, from + 2 + roll(2));
        if (from !== to && !rooms[from].extraConnections) {
          rooms[from].extraConnections = [{ to, type: pick(data.connections) }];
        }
      }
    }

    currentDungeon = { theme, rooms, size, difficulty };
    renderDungeon();
    SFX.click();
  }

  function generateRoom(idx, total, difficulty) {
    let type;
    if (idx === 0) type = data.roomTypes[0]; // entrance
    else if (idx === total - 1) type = data.roomTypes[5]; // boss
    else {
      // Weighted random
      const r = roll(100);
      if (r <= 10) type = data.roomTypes[3]; // trap
      else if (r <= 20) type = data.roomTypes[4]; // treasure
      else if (r <= 50) type = data.roomTypes[1]; // corridor
      else type = data.roomTypes[2]; // chamber
    }

    const room = {
      id: idx + 1,
      type,
      size: pick(data.roomSizes),
      feature: pick(data.roomFeatures),
      monsters: null,
      trap: null,
      treasure: null
    };

    // Add content based on type
    if (type.type === 'trap' || (type.type === 'chamber' && roll(100) <= 25)) {
      room.trap = pick(data.traps);
    }

    if (type.type === 'chamber' || type.type === 'boss' || type.type === 'corridor') {
      const monsterChance = type.type === 'boss' ? 100 : type.type === 'chamber' ? 50 : 20;
      if (roll(100) <= monsterChance) {
        const pool = difficulty === 'low' ? data.monsters.low :
                     difficulty === 'mid' ? data.monsters.mid : data.monsters.high;
        room.monsters = pick(pool);
      }
    }

    if (type.type === 'treasure' || type.type === 'boss') {
      const template = pick(data.treasureContents);
      room.treasure = template
        .replace('{coins}', String(roll(6) * 10 * (difficulty === 'high' ? 10 : difficulty === 'mid' ? 5 : 1)))
        .replace('{gems}', String(roll(4)))
        .replace('{magic}', pick(data.magicTables || ['Item mágico']))
        .replace('{scroll}', pick(data.scrolls))
        .replace('{potion}', pick(data.potions))
        .replace('{value}', String(roll(6) * 100));
    }

    return room;
  }

  function generateSingleRoom() {
    if (!data) return;
    const difficulty = document.getElementById('dungeonDifficulty').value;
    const room = generateRoom(1, 3, difficulty);
    room.connectionTo = null;
    room.connectionType = null;

    const el = document.getElementById('dungeonResult');
    el.innerHTML = `
      <div class="dungeon-header">🏰 Habitación Individual</div>
      ${renderRoomCard(room, true)}
    `;
    el.style.display = 'block';
    el.style.animation = 'none'; el.offsetHeight; el.style.animation = 'fadeIn 0.3s';
    SFX.click();
  }

  function renderDungeon() {
    const el = document.getElementById('dungeonResult');
    if (!currentDungeon) return;
    const d = currentDungeon;

    let html = `
      <div class="dungeon-header">
        <h3>🏰 ${d.theme.name}</h3>
        <p>${d.theme.desc}</p>
        <span class="dungeon-meta">${d.rooms.length} habitaciones | ${d.difficulty === 'low' ? 'Baja' : d.difficulty === 'mid' ? 'Media' : 'Alta'} dificultad</span>
      </div>
      <div class="dungeon-map">
    `;

    d.rooms.forEach((room, i) => {
      html += renderRoomCard(room, false);
      if (room.connectionTo !== undefined && room.connectionTo !== null) {
        html += `<div class="dungeon-connection">↓ ${room.connectionType}</div>`;
      }
      if (room.extraConnections) {
        room.extraConnections.forEach(ec => {
          html += `<div class="dungeon-connection extra">↗ ${ec.type} → Sala ${ec.to + 1}</div>`;
        });
      }
    });

    html += '</div>';
    el.innerHTML = html;
    el.style.display = 'block';
    el.style.animation = 'none'; el.offsetHeight; el.style.animation = 'fadeIn 0.3s';
  }

  function renderRoomCard(room, expanded) {
    let content = '';
    if (room.monsters) content += `<div class="dungeon-room-monsters">⚔️ ${room.monsters}</div>`;
    if (room.trap) content += `<div class="dungeon-room-trap">⚠️ <strong>${room.trap.name}</strong> (DC ${room.trap.dc}): ${room.trap.desc}</div>`;
    if (room.treasure) content += `<div class="dungeon-room-treasure">💰 ${room.treasure}</div>`;

    return `
      <div class="dungeon-room type-${room.type.type}${expanded ? ' expanded' : ''}" onclick="this.classList.toggle('expanded')">
        <div class="dungeon-room-header">
          <span class="dungeon-room-icon">${room.type.icon}</span>
          <span class="dungeon-room-title">Sala ${room.id}: ${room.type.label}</span>
          <span class="dungeon-room-size">${room.size}</span>
        </div>
        <div class="dungeon-room-body">
          <div class="dungeon-room-feature">📋 ${room.feature}</div>
          ${content || '<div style="color:var(--text3);font-size:0.85em">Sala vacía</div>'}
        </div>
      </div>
    `;
  }

  return { init, generate, generateSingleRoom };
})();
