// === COF BESTIARY — Choir of Flesh Creature Reference ===
const Bestiary = (() => {
  const creatures = [
    {
      name: 'Amalgama',
      faction: 'Carne',
      description: 'Esto es lo que sucede cuando un grupo de personas es atrapado por la Carne en proximidad cercana. La Amalgama es un montón tambaleante de cuerpos fusionados, una escultura grotesca de extremidades, caras y torsos todos derretidos juntos.',
      stats: { precision: 1, attack: 'Promedio', constitution: 'Muy Difícil', dr: 'Promedio', dexterity: 'Fácil', initiative: 5, movement: 2, number: '1♟', perception: 'Fácil', strength: 'Muy Difícil', will: 'Promedio', role: 'Melé' },
      xp: 3, loot: 'Ninguno',
      standardAttack: 'Golpe (Rango 1, daño Contundente)',
      specialAttack: 'Agarrar (Rango 1): El objetivo debe pasar un chequeo de FUE Promedio o quedar Inmovilizado.',
      supportAction: 'Regenerar: Elimina 1 Herida Mayor.',
      trait: 'Constitución Inhumana: Una Amalgama no puede ser Enfermada o Envenenada.'
    },
    {
      name: 'Apóstata',
      faction: 'Carne',
      description: 'Estos son humanos que voluntariamente eligieron la Carne sobre el Coro, a menudo tallando sus propias lenguas para escapar del himno. Retienen su inteligencia y astucia, pero sus cuerpos están monstruosamente transformados.',
      stats: { precision: 2, attack: 'Promedio', constitution: 'Promedio', dr: 'Promedio', dexterity: 'Promedio', initiative: 12, movement: 2, number: '1♟', perception: 'Promedio', strength: 'Promedio', will: 'Promedio', role: 'Melé' },
      xp: 2, loot: 'Tabla de Saqueo',
      standardAttack: 'Desgarro de Carne (Rango 1, daño Cortante)',
      specialAttack: 'Comandar a los Deshechados: Un aliado dentro de Rango 3 hace un ataque gratuito.',
      supportAction: 'Regeneración Adaptativa: Elimina 1d4 Heridas Menores.',
      trait: 'Astucia Odiosa: Siempre actúa primero, a menos que sea sorprendido.'
    },
    {
      name: 'Tejedor de Huesos',
      faction: 'Carne',
      description: 'Este Deshecho muestra una inteligencia cruda e instintiva. Es una criatura humanoide esbelta cuyos propios huesos han perforado su piel para formar una armadura espinosa externa. Recolecta los huesos de sus víctimas y teje proyectiles afilados o barricadas defensivas.',
      stats: { precision: 0, attack: 'Promedio', constitution: 'Fácil', dr: 'Fácil', dexterity: 'Difícil', initiative: 18, movement: 3, number: '2♟', perception: 'Difícil', strength: 'Fácil', will: 'Fácil', role: 'Rango' },
      xp: 2, loot: 'Ninguno',
      standardAttack: 'Fragmento de Hueso (Rango 3, daño Perforante)',
      specialAttack: 'Barricada: Crea un bloque de hueso (1 casilla) que proporciona cobertura. Dura 3 rondas.',
      supportAction: 'Reforzar: Aumenta la CD de un aliado en una etapa hasta el próximo turno.',
      trait: 'Caparazón Espinoso: Los atacantes cuerpo a cuerpo sufren 1 Herida Menor al golpear a menos que pasen un chequeo de CON Promedio.'
    },
    {
      name: 'Cantor',
      faction: 'Coro',
      description: 'Este fue una vez un maestro de coro humano, pero su devoción le ha ganado un honor terrible. Su mandíbula ha sido desencajada y su caja torácica forzada a abrirse, equipada con tubos de latón y cámaras de resonancia. Es un órgano de tubos viviente.',
      stats: { precision: 0, attack: 'Fácil', constitution: 'Fácil', dr: 'Fácil', dexterity: 'Promedio', initiative: 12, movement: 2, number: '1♟', perception: 'Difícil', strength: 'Fácil', will: 'Muy Difícil', role: 'Rango' },
      xp: 2, loot: 'Ninguno',
      standardAttack: 'Nota Alta (Rango 5, daño Divino)',
      specialAttack: 'Ninguno.',
      supportAction: 'Endecha del Coro: Todos los aliados del Coro dentro de Rango 4 ganan +2 Maestría. Enemigos Inquebrantables dentro de Rango 4 sufren -2 Carga. Dura hasta el próximo turno.',
      trait: 'Instrumento Viviente: Inmune a todo daño físico. Para dañarlo, chequeo de VOL vs VOL del Cantor causa 1 Herida Mayor.'
    },
    {
      name: 'Bandada de Carroña',
      faction: 'Carne',
      description: 'Una bandada de pájaros rehechos. Sus plumas se han ido, reemplazadas por alas membranosas. Sus picos se han disuelto en probóscides carnosas que usan para sorber materia orgánica licuada.',
      stats: { precision: 1, attack: 'Promedio', constitution: 'Fácil', dr: 'Fácil', dexterity: 'Muy Difícil', initiative: 18, movement: 3, number: '1♟', perception: 'Difícil', strength: 'Fácil', will: 'Fácil', role: 'Melé' },
      xp: 2, loot: 'Ninguno',
      standardAttack: 'Vómito Ácido (Explosión 2, daño Corrosivo)',
      specialAttack: 'Picada en Enjambre: Todos los enemigos en Rango 1 deben pasar chequeo de DES Promedio o sufrir 1 Herida Menor + chequeo CON Promedio o quedar Cegados.',
      supportAction: 'Festín: Si hay un personaje herido dentro de Rango 1, recupera 1 Herida Mayor.',
      trait: 'Tácticas de Enjambre: No sufre Heridas Menores de ataques de objetivo único. Inmune a Inmovilizado.'
    },
    {
      name: 'Portador del Incensario',
      faction: 'Coro',
      description: 'Un Penitente grande e hinchado, tan inflado de fe que su piel está estirada tensa y translúcida. Arrastra un incensario masivo y ornamentado que balancea en un arco rítmico, liberando nubes espesas de humo dulce.',
      stats: { precision: 0, attack: 'Promedio', constitution: 'Difícil', dr: 'Difícil', dexterity: 'Fácil', initiative: 5, movement: 1, number: '1♟', perception: 'Difícil', strength: 'Difícil', will: 'Difícil', role: 'Melé' },
      xp: 3, loot: 'Tabla de Saqueo',
      standardAttack: 'Balanceo del Incensario (Rango 2, daño Contundente)',
      specialAttack: 'Arco del Incensario (Estallido 1, daño Contundente)',
      supportAction: 'Vapores Alucinógenos: Todos los enemigos en Estallido 2 deben pasar chequeo de VOL Difícil o quedar Enfermados (2) durante 1d4 rondas.',
      trait: 'Hinchado de Divinidad: Inmune a Encantado. Cuando es asesinado, libera Vapores Alucinógenos.'
    },
    {
      name: 'Querubín',
      faction: 'Coro',
      description: 'Una construcción aterradora de matemáticas divinas: una amalgama flotante de cuatro rostros (hombre, león, buey, águila) mirando en cuatro direcciones. Su cuerpo es un nudo de alas blancas con plumas de hueso afilado y docenas de ojos humanos.',
      stats: { precision: 2, attack: 'Difícil', constitution: 'Fácil', dr: 'Fácil', dexterity: 'Promedio', initiative: 10, movement: 2, number: '1♟', perception: 'Difícil', strength: 'Fácil', will: 'Muy Difícil', role: 'Rango' },
      xp: 5, loot: 'Ninguno',
      standardAttack: 'Explosión Geométrica (Rango 3, daño Divino)',
      specialAttack: 'Asombrar (Rango 3): El objetivo debe pasar un chequeo de CON Promedio o quedar Aturdido (1).',
      supportAction: 'Reformar: Elimina 1 Herida Mayor.',
      trait: 'Múltiples Caras: Los Querubines son imposibles de sorprender.'
    },
    {
      name: 'Confesor',
      faction: 'Coro',
      description: 'Una figura alta y demacrada cuya cabeza está encerrada en una jaula de alambres plateados y lentes. Sus dedos han sido reemplazados con instrumentos aterradores: ganchos, agujas, estiletes y pinzas con dientes afilados.',
      stats: { precision: 3, attack: 'Difícil', constitution: 'Fácil', dr: 'Fácil', dexterity: 'Fácil', initiative: 5, movement: 1, number: '1♟', perception: 'Difícil', strength: 'Fácil', will: 'Muy Difícil', role: 'Melé' },
      xp: 4, loot: 'Tabla de Saqueo',
      standardAttack: 'Golpe Quirúrgico (Rango 1, daño Cortante)',
      specialAttack: 'Extraer Pecado (Rango 1): Al golpear, chequeo VOL Difícil o VOL reducida en uno por 24h. El Confesor cura 1 Herida Mayor.',
      supportAction: 'Purgar Debilidad: Elimina todas las Condiciones de un aliado del Coro.',
      trait: 'Utensilios Afilados: Un personaje dañado por un Confesor está Sangrando.'
    },
    {
      name: 'Graznador',
      faction: 'Carne',
      description: 'La garganta de esta criatura es un saco hinchado y pulsante, y su boca es un orificio carnoso de múltiples lóbulos. Intenta imitar el himno del Coro pero solo produce sonidos húmedos y gorgoteantes.',
      stats: { precision: 1, attack: 'Fácil', constitution: 'Promedio', dr: 'Fácil', dexterity: 'Fácil', initiative: 8, movement: 2, number: '2♟', perception: 'Difícil', strength: 'Fácil', will: 'Difícil', role: 'Rango' },
      xp: 2, loot: 'Ninguno',
      standardAttack: 'Escupitajo Gorgoteante (Rango 3, daño Corrosivo)',
      specialAttack: 'Endecha Blasfema: Todos los enemigos en Estallido 3 deben pasar chequeo de VOL Difícil o quedar Enfermados (2) durante 2 rondas.',
      supportAction: 'Ninguna.',
      trait: 'Anti-Armonía: Inmune a Atontado y Aturdido. Falla automáticamente chequeos de VOL relacionados con oraciones.'
    },
    {
      name: 'Flagelante',
      faction: 'Coro',
      description: 'Su espalda es un lienzo desollado de músculo crudo y nervios expuestos. Su propia médula espinal ha sido extraída, tratada y reutilizada como un largo látigo con púas que porta con reverencia extática.',
      stats: { precision: 2, attack: 'Difícil', constitution: 'Fácil', dr: 'Fácil', dexterity: 'Promedio', initiative: 12, movement: 2, number: '1♟', perception: 'Fácil', strength: 'Fácil', will: 'Difícil', role: 'Melé' },
      xp: 3, loot: 'Tabla de Saqueo',
      standardAttack: 'Látigo con Púas (Rango 2, daño Cortante)',
      specialAttack: 'Auto Mutilación: Crea un charco de sangre tóxica (Charco Corrosivo) frente a él.',
      supportAction: 'Oleada Extática: Gana +1 Velocidad y todos sus ataques causan 1 Herida Menor hasta su próximo turno.',
      trait: 'Celo Alimentado por el Dolor: Gana +1 Precisión después de 1 Herida Mayor.'
    },
    {
      name: 'Gusano de Carne',
      faction: 'Carne',
      description: 'Un gusano colosal y segmentado hecho de músculo crudo rosado y tendones. Solo tiene una boca circular forrada con ganchos de hueso. Traga tierra, piedra y personas, y excreta biomateria que remodela el paisaje.',
      stats: { precision: 1, attack: 'Difícil', constitution: 'Muy Difícil', dr: 'Difícil', dexterity: 'Fácil', initiative: 5, movement: 2, number: '1♟', perception: 'Fácil', strength: 'Muy Difícil', will: 'Fácil', role: 'Melé' },
      xp: 8, loot: 'Ninguno',
      standardAttack: 'Fauces Devoradoras (Rango 1, daño Contundente)',
      specialAttack: 'Oleada de Túnel: El Gusano hace túneles bajo un objetivo aleatorio, todos sufren 1 Herida Menor + chequeo DES Promedio o Derribados.',
      supportAction: 'Ninguna.',
      trait: 'Colosal: Ocupa 4 casillas. Siempre usa la Tabla de Heridas Difícil.'
    },
    {
      name: 'Rechinador',
      faction: 'Carne',
      description: 'Un antiguo humano cuyo cuerpo ha sido reutilizado para una sola función: comer. Su cabeza y torso se han convertido en una sola boca enorme llena de filas de dientes desiguales. No es más que una boca caminante de hambre insaciable.',
      stats: { precision: 1, attack: 'Promedio', constitution: 'Promedio', dr: 'Fácil', dexterity: 'Fácil', initiative: 10, movement: 2, number: '1♟', perception: 'Fácil', strength: 'Promedio', will: 'Promedio', role: 'Melé' },
      xp: 2, loot: 'Ninguno',
      standardAttack: 'Mordida Voraz (Rango 1, daño Contundente)',
      specialAttack: 'Desgarrar (Rango 1, daño Cortante): Chequeo CON Promedio o Herida Menor adicional.',
      supportAction: 'Alimentación Frenética (Rango 1, daño Primordial): Si acierta, cura 1 Herida Mayor.',
      trait: 'Hambre Sin Mente: Inmune a Asustado y Encantado. Siempre se mueve hacia el enemigo más cercano.'
    },
    {
      name: 'Fauces del Suelo',
      faction: 'Carne',
      description: 'Aparece como un parche normal de suelo, pero es la boca camuflada de un organismo colosal enterrado. Cuando una víctima pisa el área "gatillo", el suelo se abre en unas grandes fauces carnosas que se cierran de golpe.',
      stats: { precision: 0, attack: 'Promedio', constitution: 'Promedio', dr: 'Promedio', dexterity: 'Fácil', initiative: 18, movement: '—', number: '1♟', perception: 'Difícil', strength: 'Promedio', will: 'Fácil', role: 'Melé' },
      xp: 3, loot: 'Tabla de Recolección',
      standardAttack: 'Mordida de Emboscada (Rango 4, daño Perforante)',
      specialAttack: 'Agujero Tragador (Rango 4, daño Contundente): Si fue golpeado, chequeo DES Promedio o Inmovilizado + 1 Herida Mayor/ronda.',
      supportAction: 'Ninguna.',
      trait: 'Camuflaje: Nunca pueden ser sorprendidas.'
    },
    {
      name: 'Heraldo',
      faction: 'Coro',
      description: 'Este humano aparentemente normal es una herramienta del Coro para infiltrarse en asentamientos. Son astutos y traicioneros, usados como exploradores para señalar objetivos potenciales al ejército de los fieles.',
      stats: { precision: 2, attack: 'Promedio', constitution: 'Promedio', dr: 'Promedio', dexterity: 'Promedio', initiative: 12, movement: 2, number: '1♟', perception: 'Difícil', strength: 'Promedio', will: 'Difícil', role: 'Melé' },
      xp: 3, loot: 'Tabla de Saqueo',
      standardAttack: 'Puñalada (Rango 1, daño Perforante)',
      specialAttack: 'Justicia Furiosa (Rango 1, daño Cortante): Si golpea, Aturdido (1).',
      supportAction: 'Señalar a los Fieles: Invoca a un Servidor del Coro aleatorio.',
      trait: 'Engañoso: Siempre comienza el combate sorprendiendo a sus oponentes.'
    },
    {
      name: 'Caballo',
      faction: 'Neutral',
      description: 'La piedra angular del comercio y la guerra en la Europa Medieval. Estas nobles bestias son ahora raras e increíblemente valoradas.',
      stats: { precision: 0, attack: 'Promedio', constitution: 'Promedio', dr: 'Promedio', dexterity: 'Promedio', initiative: 16, movement: 3, number: '1♟', perception: 'Fácil', strength: 'Promedio', will: 'Fácil', role: 'Melé' },
      xp: 2, loot: 'Ninguno',
      standardAttack: 'Patada (Rango 1, daño Contundente)',
      specialAttack: 'Ninguno.',
      supportAction: 'Ninguna.',
      trait: 'Instinto de Supervivencia: Huye automáticamente después de 1 Herida Mayor, a menos que tenga jinete experimentado.'
    },
    {
      name: 'Sabueso',
      faction: 'Neutral',
      description: 'Un perro común, sin cambios, tratando de sobrevivir por cualquier medio, igual que cualquiera de las otras pocas cosas vivientes que quedan.',
      stats: { precision: 0, attack: 'Promedio', constitution: 'Promedio', dr: 'Promedio', dexterity: 'Promedio', initiative: 16, movement: 3, number: '1♟', perception: 'Difícil', strength: 'Promedio', will: 'Fácil', role: 'Melé' },
      xp: 2, loot: 'Ninguno',
      standardAttack: 'Mordida (Rango 1, daño Perforante)',
      specialAttack: 'Ninguno.',
      supportAction: 'Ninguna.',
      trait: 'Instinto de Supervivencia: Huye automáticamente después de 1 Herida Mayor, a menos que sea compañero.'
    },
    {
      name: 'Cruzado Cáscara',
      faction: 'Coro',
      description: 'Fueron una vez soldados o caballeros. Su armadura se ha fusionado a su piel, el metal sangrando hacia la carne. Donde debería estar la visera, solo hay una boca gritando un himno de batalla disonante.',
      stats: { precision: 2, attack: 'Promedio', constitution: 'Promedio', dr: 'Promedio', dexterity: 'Fácil', initiative: 12, movement: 2, number: '1♟', perception: 'Promedio', strength: 'Promedio', will: 'Promedio', role: 'Melé' },
      xp: 3, loot: 'Tabla de Saqueo',
      standardAttack: 'Golpe de Hoja de Hueso (Rango 1, daño Cortante)',
      specialAttack: 'Golpe Implacable (Rango 1, daño Divino)',
      supportAction: 'Cántico de los Fieles: Todas las criaturas del Coro dentro de Rango 4 ganan +1 Precisión hasta el próximo turno.',
      trait: 'Fanático Insensible: Inmune a Aturdido o Atontado.'
    },
    {
      name: 'Licuador',
      faction: 'Carne',
      description: 'Criaturas lentas, parecidas a babosas, de carne gelatinosa translúcida. Las formas medio disueltas de sus víctimas pueden verse suspendidas dentro de su cuerpo semi-sólido. Impulsado solo por el imperativo de tocar y deshacer.',
      stats: { precision: 3, attack: 'Promedio', constitution: 'Promedio', dr: 'Muy Fácil', dexterity: 'Fácil', initiative: 5, movement: 1, number: '1♟', perception: 'Fácil', strength: 'Fácil', will: 'Fácil', role: 'Melé' },
      xp: 3, loot: 'Tabla de Saqueo',
      standardAttack: 'Toque Corrosivo (Rango 1, daño Corrosivo)',
      specialAttack: 'Envolver (Rango 1): Chequeo DES Fácil o Inmovilizado + 1 Herida Mayor/ronda.',
      supportAction: 'Ninguna.',
      trait: 'Rastro de Baba: Cada casilla que recorre se convierte en Charco Corrosivo. Inmune a sus efectos.'
    },
    {
      name: 'Mater Dolorosa',
      faction: 'Coro',
      description: 'Figuras de mujeres afligidas, antiguas monjas, vestidas con túnicas de cera blanca. Sus ojos sellados lloran un líquido plateado. Son increíblemente veloces y se encuentran en lugares de gran tragedia.',
      stats: { precision: 1, attack: 'Promedio', constitution: 'Promedio', dr: 'Promedio', dexterity: 'Muy Difícil', initiative: 18, movement: 3, number: '1♟', perception: 'Fácil', strength: 'Fácil', will: 'Promedio', role: 'Melé' },
      xp: 3, loot: 'Tabla de Saqueo',
      standardAttack: 'Golpe de Garras de Cera (Rango 1, daño Divino)',
      specialAttack: 'Embestida Llorosa: Se teletransporta a Rango 6. Enemigos en el camino: chequeo VOL Difícil o -1 Carga hasta fin del combate.',
      supportAction: 'Lágrimas Plateadas: Estallido 1. Aliados curan 1 Herida Mayor, enemigos quedan Enfermados (2).',
      trait: 'Cegada por la Gracia: Inmune a Cegado y Aturdido.'
    },
    {
      name: 'Madre de Tumores',
      faction: 'Carne',
      description: 'Criatura estacionaria, un útero viviente para la Carne. Su superficie está cubierta de crecimientos cancerosos que se hinchan y pulsan. Periódicamente, un tumor estalla dando a luz a una criatura Deshecha.',
      stats: { precision: 0, attack: '—', constitution: 'Promedio', dr: 'Promedio', dexterity: 'Muy Fácil', initiative: 5, movement: '—', number: '1♟', perception: 'Fácil', strength: 'Fácil', will: 'Promedio', role: 'Melé' },
      xp: 3, loot: 'Ninguno',
      standardAttack: 'Engendrar Deshecho: Tira 1d4; en 1-2 engendra un Sabueso Desollado.',
      specialAttack: 'Ninguno.',
      supportAction: 'Presencia Purulenta: Todos los enemigos dentro de Rango 3 deben pasar chequeo CON Difícil o Enfermados (4).',
      trait: 'Nido Viviente: Inmune a todas las Condiciones excepto Ardiendo y Sangrando.'
    },
    {
      name: 'Penitente',
      faction: 'Coro',
      description: 'La columna vertebral de las fuerzas del Coro. Humanos que han abrazado el poder del Coro. Muestran signos iniciales de estigmas pero son completamente conscientes y tienen libre albedrío.',
      stats: { precision: 1, attack: 'Promedio', constitution: 'Promedio', dr: 'Promedio', dexterity: 'Promedio', initiative: 10, movement: 2, number: '1♟', perception: 'Promedio', strength: 'Promedio', will: 'Difícil', role: 'Melé' },
      xp: 3, loot: 'Tabla de Saqueo',
      standardAttack: 'Golpe Fanático (Rango 1, daño Cortante)',
      specialAttack: 'Reprensión Divina (Rango 2): Chequeo VOL Difícil o Aturdido (1).',
      supportAction: 'La Bendición del Coro: Un aliado aleatorio cura 1 Herida Mayor.',
      trait: 'Armadura de Fe: No puede sufrir Heridas Menores.'
    },
    {
      name: 'Pilar de Fe',
      faction: 'Coro',
      description: 'Una torre viviente de Penitentes fusionados en una columna vertical de carne y hueso. Cada rostro canta una parte diferente de una armonía compleja. Enraizado en el lugar pero lanza poderosos ataques de fuego sagrado.',
      stats: { precision: 0, attack: 'Fácil', constitution: 'Promedio', dr: 'Promedio', dexterity: 'Muy Fácil', initiative: 5, movement: '—', number: '1♟', perception: 'Promedio', strength: 'Fácil', will: 'Difícil', role: 'Rango' },
      xp: 3, loot: 'Ninguno',
      standardAttack: 'Fuego Sagrado (Rango 4, daño Divino)',
      specialAttack: 'Himno de Tormento (Rango 3): Chequeo VOL Difícil o 2 Heridas Menores + Atontados (1).',
      supportAction: 'Ninguna.',
      trait: 'Devoción Inamovible: Inmune a Encantado, Atontado, Aturdido, Obstaculizado, Inmovilizado y Derribado.'
    },
    {
      name: 'Purificador',
      faction: 'Humano',
      description: 'Un soldado de la verdadera humanidad, peleando una cruzada implacable contra cualquier forma de corrupción, ya sea del Coro o de la Carne. Sus enemigos son insidiosos y deben ser combatidos sin remordimiento.',
      stats: { precision: 2, attack: 'Difícil', constitution: 'Promedio', dr: 'Promedio', dexterity: 'Fácil', initiative: 12, movement: 2, number: '2♟', perception: 'Promedio', strength: 'Promedio', will: 'Difícil', role: 'Melé' },
      xp: 5, loot: 'Tabla de Saqueo',
      standardAttack: 'Estocada de Espada (Rango 1, daño Perforante)',
      specialAttack: 'Asalto Despiadado (Estallido 1): Chequeo DES Promedio o 2 Heridas Menores.',
      supportAction: 'Respiro Rápido: El Purificador cura 1d4 Heridas Menores.',
      trait: 'Convicción Inquebrantable: Inmune a todos los efectos sobrenaturales.'
    },
    {
      name: 'Escriba de Penitencia',
      faction: 'Coro',
      description: 'Antiguos eruditos o monjes. Su piel ha sido desollada y convertida en pergamino viviente, cubierta de tatuajes en espiral de la ley sagrada del Coro, grabados en tinta dorada. Constantemente trazando las palabras en su cuerpo.',
      stats: { precision: 0, attack: 'Fácil', constitution: 'Promedio', dr: 'Fácil', dexterity: 'Fácil', initiative: 12, movement: 2, number: '1♟', perception: 'Promedio', strength: 'Fácil', will: 'Muy Difícil', role: 'Melé' },
      xp: 3, loot: 'Tabla de Saqueo',
      standardAttack: 'Cuchilla Ritual (Rango 1, daño Cortante)',
      specialAttack: 'Invocar Escritura (Rango 3): 1d6: 1-2 Obediencia (Aturdido), 3-4 Revelación (Cegado), 5-6 Castigo (3 Heridas Menores).',
      supportAction: 'Letanía de Protección: Ignora todo el daño hasta su próximo turno.',
      trait: 'Escritura Viviente: Inmune a Encantado y Sangrando.'
    },
    {
      name: 'Serafín',
      faction: 'Coro',
      description: 'Seres de inmolación pura. Un pilar de seis alas de fuego y luz retorciéndose. Se comunica quemando versos del himno directamente en la carne y mente de quienes lo presencian.',
      stats: { precision: 3, attack: 'Difícil', constitution: 'Difícil', dr: 'Difícil', dexterity: 'Promedio', initiative: 12, movement: 3, number: '1♟', perception: 'Promedio', strength: 'Promedio', will: 'Muy Difícil', role: 'Rango' },
      xp: 8, loot: 'Ninguno',
      standardAttack: 'Bendición Ardiente (Rango 5, daño Divino)',
      specialAttack: 'Embestida Alada (Estallido 3): Chequeo VOL Difícil o Cegadas.',
      supportAction: 'Himno del Coro: Todas las criaturas del Coro reciben +1 Precisión durante 1d4 rondas.',
      trait: 'Poder Divino: Inmune a todas las Condiciones. Siempre usa la Tabla de Heridas Difícil.'
    },
    {
      name: 'Acechador Silencioso',
      faction: 'Carne',
      description: 'Maestro del camuflaje, capaz de alterar su piel para imitar el entorno. Su forma verdadera es una criatura insectoide de tendones y huesos, con largas garras similares a las de una mantis.',
      stats: { precision: 1, attack: 'Difícil', constitution: 'Fácil', dr: 'Fácil', dexterity: 'Difícil', initiative: 18, movement: 2, number: '1♟', perception: 'Difícil', strength: 'Fácil', will: 'Promedio', role: 'Melé' },
      xp: 3, loot: 'Tabla de Saqueo',
      standardAttack: 'Golpe de Garra (Rango 1, daño Primordial)',
      specialAttack: 'Embestida Brutal (Rango 1): Chequeo DES Promedio o 1d4 Heridas Menores.',
      supportAction: 'Atraer Presa: Chequeo VOL Promedio o moverse 2 casillas hacia el Acechador.',
      trait: 'Emboscador Perfecto: Siempre comienza el combate sorprendiendo a sus oponentes.'
    },
    {
      name: 'Sabueso Desollado',
      faction: 'Carne',
      description: 'Un perro de caza o lobo desollado por la Carne. Un modelo anatómico perfecto de músculo y tendón, reluciendo con fluido sangriento. Posee una mandíbula desproporcionadamente grande.',
      stats: { precision: 0, attack: 'Promedio', constitution: 'Fácil', dr: 'Fácil', dexterity: 'Promedio', initiative: 15, movement: 3, number: '2♟', perception: 'Difícil', strength: 'Fácil', will: 'Promedio', role: 'Melé' },
      xp: 2, loot: 'Ninguno',
      standardAttack: 'Mordida Viciosa (Rango 1, daño Primordial)',
      specialAttack: 'Ninguno.',
      supportAction: 'Rastro de Sangre (Rango 3): Marca un objetivo; todos los Sabuesos ganan +2 Movimiento hacia el marcado.',
      trait: 'Derribo en Manada: Si múltiples Sabuesos atacan al mismo objetivo, cada uno gana +1 Precisión.'
    },
    {
      name: 'Soldado',
      faction: 'Humano',
      description: 'Un soldado promedio de los ejércitos que marcharon antes del Fin de los Días. Todavía completamente humano, sobreviviendo gracias a su entrenamiento y experiencia en batalla.',
      stats: { precision: 2, attack: 'Difícil', constitution: 'Promedio', dr: 'Promedio', dexterity: 'Promedio', initiative: 10, movement: 2, number: '2♟', perception: 'Promedio', strength: 'Promedio', will: 'Promedio', role: 'Melé' },
      xp: 4, loot: 'Tabla de Saqueo',
      standardAttack: 'Estocada de Lanza (Rango 1, daño Perforante)',
      specialAttack: 'Tácticas de Batalla: Otorga a otro Soldado +1 Precisión durante 1d4 rondas.',
      supportAction: 'Primeros Auxilios: Cura 1 Herida Mayor.',
      trait: 'Veterano: Ignora los efectos negativos de todas las Heridas sufridas.'
    },
    {
      name: 'Superviviente',
      faction: 'Humano',
      description: 'Un Inquebrantable, alguien que ha resistido tanto al Coro como a la Carne. Están desesperados y determinados a sobrevivir a toda costa, incluso si eso significa matar a otros supervivientes.',
      stats: { precision: 1, attack: 'Promedio', constitution: 'Promedio', dr: 'Promedio', dexterity: 'Promedio', initiative: 10, movement: 2, number: '2♟', perception: 'Promedio', strength: 'Promedio', will: 'Promedio', role: 'Melé' },
      xp: 3, loot: 'Tabla de Saqueo',
      standardAttack: 'Golpe Desesperado (Rango 1, daño Contundente)',
      specialAttack: 'Truco Sucio (Rango 1): Chequeo DES Promedio o Cegado.',
      supportAction: 'Adaptativo: CD aumenta una etapa después de recibir el mismo tipo de daño dos veces.',
      trait: 'Nada Que Perder: +1 Precisión después de 1 Herida Mayor.'
    },
    {
      name: 'Trono',
      faction: 'Coro',
      description: 'Grandes ruedas de latón y oro ardiente intersectándose perpendicularmente, cubiertas de incontables ojos. Prefieren rodar a través del paisaje creando un zumbido hipnótico que calma a los fieles.',
      stats: { precision: 1, attack: 'Promedio', constitution: 'Promedio', dr: 'Promedio', dexterity: 'Promedio', initiative: 12, movement: 3, number: '1♟', perception: 'Difícil', strength: 'Promedio', will: 'Difícil', role: 'Melé' },
      xp: 3, loot: 'Ninguno',
      standardAttack: 'Golpear (Rango 1, daño Contundente)',
      specialAttack: 'Mirada Omnividente (Rango 5): Chequeo VOL Difícil o Aturdido (1).',
      supportAction: 'Ninguna.',
      trait: 'Impulso Inexorable: Inmune a Inmovilizado, Obstaculizado y Aturdido.'
    }
  ];

  const FACTIONS = { Carne: '🩸', Coro: '✝️', Humano: '⚔️', Neutral: '🐾' };
  const STAT_LABELS = {
    precision: 'Precisión', attack: 'Ataque', constitution: 'Constitución', dr: 'CD',
    dexterity: 'Destreza', initiative: 'Iniciativa', movement: 'Movimiento', number: 'Número',
    perception: 'Percepción', strength: 'Fuerza', will: 'Voluntad', role: 'Rol'
  };

  let filterFaction = 'all';
  let searchTerm = '';

  function init() {
    render();
  }

  function setFilter(faction) {
    filterFaction = faction;
    render();
  }

  function setSearch(term) {
    searchTerm = term.toLowerCase();
    render();
  }

  function getFiltered() {
    return creatures.filter(c => {
      if (filterFaction !== 'all' && c.faction !== filterFaction) return false;
      if (searchTerm && !c.name.toLowerCase().includes(searchTerm) && !c.description.toLowerCase().includes(searchTerm)) return false;
      return true;
    });
  }

  function render() {
    const list = document.getElementById('bestiaryList');
    const detail = document.getElementById('bestiaryDetail');
    if (!list) return;

    const filtered = getFiltered();

    // Filter buttons
    const filterEl = document.getElementById('bestiaryFilters');
    if (filterEl) {
      filterEl.innerHTML = ['all', 'Carne', 'Coro', 'Humano', 'Neutral'].map(f => {
        const label = f === 'all' ? 'Todos' : `${FACTIONS[f]} ${f}`;
        const active = filterFaction === f ? ' active' : '';
        return `<button class="bestiary-filter-btn${active}" onclick="Bestiary.setFilter('${f}')">${label}</button>`;
      }).join('');
    }

    list.innerHTML = filtered.map(c =>
      `<div class="bestiary-card" onclick="Bestiary.showDetail('${c.name}')">
        <div class="bc-faction">${FACTIONS[c.faction] || ''}</div>
        <div class="bc-info">
          <div class="bc-name">${c.name}</div>
          <div class="bc-meta">${c.stats.role} · ${c.xp} XP · Init ${c.stats.initiative}</div>
        </div>
        <div class="bc-role">${c.stats.role === 'Melé' ? '⚔️' : '🏹'}</div>
      </div>`
    ).join('') || '<div style="text-align:center;color:var(--text3);padding:20px">Sin resultados</div>';

    if (detail) detail.innerHTML = '';
  }

  function showDetail(name) {
    const c = creatures.find(x => x.name === name);
    if (!c) return;
    const detail = document.getElementById('bestiaryDetail');
    if (!detail) return;

    const statRows = [
      ['precision', 'attack', 'constitution', 'dr'],
      ['dexterity', 'initiative', 'movement', 'number'],
      ['perception', 'strength', 'will', 'role']
    ];

    detail.innerHTML = `
      <div class="bestiary-detail-card">
        <div class="bd-header">
          <span class="bd-faction">${FACTIONS[c.faction]} ${c.faction}</span>
          <h3 class="bd-name">${c.name}</h3>
          <span class="bd-xp">${c.xp} XP</span>
        </div>
        <p class="bd-desc">${c.description}</p>
        <table class="bd-stats">
          ${statRows.map(row => `
            <tr class="bd-stat-labels">${row.map(k => `<th>${STAT_LABELS[k]}</th>`).join('')}</tr>
            <tr class="bd-stat-values">${row.map(k => `<td>${c.stats[k]}</td>`).join('')}</tr>
          `).join('')}
        </table>
        <div class="bd-loot">Botín: ${c.loot}</div>
        <div class="bd-abilities">
          <div class="bd-ability">
            <span class="bd-ability-label">⚔️ Ataque Estándar</span>
            <span class="bd-ability-text">${c.standardAttack}</span>
          </div>
          <div class="bd-ability">
            <span class="bd-ability-label">✨ Ataque Especial</span>
            <span class="bd-ability-text">${c.specialAttack}</span>
          </div>
          <div class="bd-ability">
            <span class="bd-ability-label">🛡️ Acción de Apoyo</span>
            <span class="bd-ability-text">${c.supportAction}</span>
          </div>
          <div class="bd-ability bd-trait">
            <span class="bd-ability-label">⭐ Rasgo</span>
            <span class="bd-ability-text">${c.trait}</span>
          </div>
        </div>
      </div>
    `;
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return { init, setFilter, setSearch, showDetail, creatures };
})();
