
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';
import { wireAudioUI, startAmbience, voice, giftSound } from './audio.js';

const $ = id => document.getElementById(id);
const API = 'https://bihter-live-bridge.onrender.com';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101018);
scene.fog = new THREE.Fog(0x101018, 45, 170);

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, .1, 250);
camera.position.set(0, 9, 19);

const renderer = new THREE.WebGLRenderer({
  canvas: $('scene'),
  antialias: true
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 9;
controls.maxDistance = 28;
controls.maxPolarAngle = Math.PI * .47;

scene.add(new THREE.HemisphereLight(0xcbd0e0, 0x211820, 2));

const light = new THREE.DirectionalLight(0xffdfc0, 2.5);
light.position.set(-8, 18, 10);
light.castShadow = true;
scene.add(light);

const material = (color, roughness = .8) =>
  new THREE.MeshStandardMaterial({ color, roughness });

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 700),
  material(0x202127)
);
ground.rotation.x = -Math.PI / 2;
ground.position.z = -280;
ground.receiveShadow = true;
scene.add(ground);

// UZUN YOL
const road = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 650),
  material(0x39363b)
);
road.rotation.x = -Math.PI / 2;
road.position.set(0, .03, -280);
scene.add(road);

for (const x of [-6.1, 6.1]) {
  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(.18, .12, 650),
    material(0x9a8061)
  );
  edge.position.set(x, .08, -280);
  scene.add(edge);
}

// SARAY
const palace = new THREE.Group();
scene.add(palace);

const palaceWall = new THREE.Mesh(
  new THREE.BoxGeometry(25, 7, 1),
  material(0x45343b)
);
palaceWall.position.set(0, 3.5, 5);
palace.add(palaceWall);

for (let x = -11; x <= 11; x += 3.7) {
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(.35, .42, 6.8, 18),
    material(0x967658)
  );
  column.position.set(x, 3.4, 4.4);
  palace.add(column);
}

// MEZARLIK KAPISI UZAKTA
const gate = new THREE.Group();
scene.add(gate);

for (const x of [-5, 5]) {
  const pillar = new THREE.Mesh(
    new THREE.BoxGeometry(.5, 5, .5),
    material(0x77644d)
  );
  pillar.position.set(x, 2.5, -590);
  gate.add(pillar);
}

const lintel = new THREE.Mesh(
  new THREE.BoxGeometry(10, .45, .5),
  material(0x927552)
);
lintel.position.set(0, 5, -590);
gate.add(lintel);

// YAĞMUR
const rainCount = 1400;
const rainGeometry = new THREE.BufferGeometry();
const rainPositions = new Float32Array(rainCount * 3);

for (let i = 0; i < rainCount; i++) {
  rainPositions[i * 3] = (Math.random() - .5) * 45;
  rainPositions[i * 3 + 1] = Math.random() * 25;
  rainPositions[i * 3 + 2] = (Math.random() - .5) * 90;
}

rainGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(rainPositions, 3)
);

const rain = new THREE.Points(
  rainGeometry,
  new THREE.PointsMaterial({
    color: 0xaabbd0,
    size: .055,
    transparent: true,
    opacity: .6
  })
);
scene.add(rain);

// KORTEJ GRUBU
const parade = new THREE.Group();
scene.add(parade);

// TABUT
const coffin = new THREE.Group();
parade.add(coffin);

const coffinBody = new THREE.Mesh(
  new THREE.BoxGeometry(3.1, .65, 1.35),
  material(0x3b2027, .4)
);
coffinBody.position.y = 1.55;
coffinBody.castShadow = true;
coffin.add(coffinBody);

const coffinLid = new THREE.Mesh(
  new THREE.BoxGeometry(3.2, .18, 1.42),
  material(0xb99a65, .35)
);
coffinLid.position.y = 1.97;
coffin.add(coffinLid);

// TAŞIMA ÇUBUKLARI: TABUTUN ALTINDAN GEÇER
const rodMaterial = material(0x9e8056, .35);

for (const z of [-.52, .52]) {
  const rod = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, .13, .13),
    rodMaterial
  );
  rod.position.set(0, 1.34, z);
  rod.castShadow = true;
  parade.add(rod);
}

// İSİM ETİKETİ
function makeLabel(name) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(10,7,12,.85)';
  ctx.fillRect(5, 5, 502, 118);
  ctx.strokeStyle = '#d9bb83';
  ctx.lineWidth = 5;
  ctx.strokeRect(5, 5, 502, 118);

  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff0dc';
  ctx.fillText(String(name).slice(0, 22), 256, 78);

  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, depthTest: false })
  );
  sprite.scale.set(1.8, .45, 1);
  sprite.position.y = 2.8;
  return sprite;
}

// İNSAN
function makePerson(name, gender = 'male', avatar = null) {
  const person = new THREE.Group();
  const coat = material(gender === 'female' ? 0x392532 : 0x242630);
  const skin = material(0xb98268);
  const pants = material(0x17171d);

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(.29, .72, 5, 10),
    coat
  );
  body.position.y = 1.35;
  person.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(.22, 18, 14),
    skin
  );
  head.position.y = 2.05;
  person.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(.23, 16, 12),
    material(0x171318)
  );
  hair.scale.y = .65;
  hair.position.y = 2.17;
  person.add(hair);

  const arms = [];
  const legs = [];

  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * .31, 1.65, 0);

    const armMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(.095, .44, 4, 8),
      coat
    );
    armMesh.position.y = -.25;
    arm.add(armMesh);
    person.add(arm);
    arms.push(arm);

    const leg = new THREE.Group();
    leg.position.set(side * .14, .92, 0);

    const legMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(.115, .48, 4, 8),
      pants
    );
    legMesh.position.y = -.27;
    leg.add(legMesh);
    person.add(leg);
    legs.push(leg);
  }

  person.add(makeLabel(name));

  person.userData = {
    name,
    arms,
    legs,
    phase: Math.random() * 6.28,
    walk: true
  };

  if (avatar) {
    new THREE.TextureLoader().load(
      avatar,
      texture => {
        const face = new THREE.Mesh(
          new THREE.CircleGeometry(.18, 24),
          new THREE.MeshBasicMaterial({ map: texture })
        );
        face.position.set(0, 2.05, .205);
        person.add(face);
      },
      undefined,
      () => {}
    );
  }

  person.traverse(object => {
    if (object.isMesh) object.castShadow = true;
  });

  return person;
}

// DÖRT TAŞIYICI, ÇUBUKLARIN UÇLARINDA
const carriers = [];

for (const [x, z] of [
  [-2.35, .52],
  [2.35, .52],
  [-2.35, -.52],
  [2.35, -.52]
]) {
  const carrier = makePerson('TAŞIYICI');
  carrier.position.set(x, 0, z);
  parade.add(carrier);
  carriers.push(carrier);
}

// KOLLARI TAŞIMA POZİSYONUNA AL
carriers.forEach(carrier => {
  carrier.userData.arms[0].rotation.z = -.9;
  carrier.userData.arms[1].rotation.z = .9;
});

// KATILIMCILAR TABUTUN ARKASINDA DİZİLİR
const players = new Map();
const genderChoice = new Map();

let started = false;
let paused = false;
let journey = 0;
let stage = 0;
let sound = true;

function addPlayer(name, gender, avatar) {
  if (players.has(name)) return;

  const person = makePerson(name, gender, avatar);
  const index = players.size;

  // İkişerli sıra, tabutun arkasında
  const row = Math.floor(index / 2);
  const side = index % 2 === 0 ? -1 : 1;

  person.position.set(
    side * 2.3,
    0,
    4 + row * 2.2
  );

  parade.add(person);
  players.set(name, person);

  log(`${name} korteje katıldı.`);
  updateHud();
}

function say(text, kind = 'female') {
  if (sound) voice(text, kind);
}

function log(message) {
  const activity = $('activity');
  if (!activity) return;

  const p = document.createElement('p');
  p.textContent = message;
  activity.prepend(p);

  while (activity.children.length > 6) {
    activity.lastChild.remove();
  }
}

function updateHud() {
  if ($('playerCount')) $('playerCount').textContent = players.size;
  if ($('stageName')) {
    $('stageName').textContent =
      ['SARAY', 'ALAY', 'MEZARLIK', 'DEFİN', 'FİNAL'][stage];
  }
}

// TIKTOK KOMUTLARI
function command(text, name = 'Misafir', avatar = null) {
  const c = String(text || '').trim().toLocaleUpperCase('tr-TR');

  if (c === 'KADIN' || c === 'ERKEK') {
    genderChoice.set(name, c === 'KADIN' ? 'female' : 'male');
    log(`${name} karakter seçti.`);
    return;
  }

  if (c === 'KATIL' || c === 'TASIMA') {
    addPlayer(name, genderChoice.get(name) || 'male', avatar);
    return;
  }

  if (c === 'DUA') {
    log(`${name} dua ediyor.`);
    say('Herkes Bihter için dua etsin.', 'female');
    return;
  }

  if (c === 'AGLA') {
    log(`${name} ağlıyor.`);
    say('Bihter için herkes ağlıyor.', 'bihter');
    return;
  }

  if (c === 'UYAN') {
    say('Bihter uyan!', 'bihter');
    return;
  }

  if (c === 'BEHLUL' || c === 'BEHLÜL') {
    say('Bihter, beni affet.', 'behlul');
    return;
  }

  if (c === 'EZEL') {
    say('Bu hikâye burada bitmedi.', 'ezel');
    return;
  }

  if (c === 'DUR') {
    paused = true;
    log('Kortej durdu.');
    return;
  }

  if (c === 'YURU' || c === 'YÜRÜ') {
    paused = false;
    log('Kortej yürümeye başladı.');
  }
}

// TIKTOK BAĞLANTISI
function connectTikTok() {
  fetch(`${API}/api/status`)
    .then(response => response.json())
    .then(status => {
      if ($('liveStatus')) {
        $('liveStatus').textContent = status.connected
          ? 'TIKTOK BAĞLI'
          : 'YAYIN BEKLENİYOR';
      }
    })
    .catch(() => {
      if ($('liveStatus')) $('liveStatus').textContent = 'SUNUCU BEKLENİYOR';
    });

  const stream = new EventSource(`${API}/api/stream`);

  stream.onmessage = event => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'comment') {
        command(data.comment, data.user, data.avatar);
      }

      if (data.type === 'gift') {
        log(`${data.user} ${data.gift} gönderdi`);
        giftSound();
        say(`${data.user} hediye gönderdi.`, 'male');
      }
    } catch (error) {
      console.warn(error);
    }
  };
}

connectTikTok();
wireAudioUI();

// OYUNU BAŞLAT
$('startGame')?.addEventListener('click', () => {
  started = true;
  paused = false;
  startAmbience();
  say('Bihter’in son yolculuğu başlıyor.', 'male');
  log('Cenaze korteji yola çıktı.');
});

// PROVA DÜĞMELERİ
document.querySelectorAll('[data-command]').forEach(button => {
  button.addEventListener('click', () => {
    command(button.dataset.command, 'PROVA');
  });
});

// KAMERA VE YÜRÜYÜŞ
const clock = new THREE.Clock();
const desiredCamera = new THREE.Vector3();
const desiredTarget = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), .05);
  const time = clock.elapsedTime;

  // YAĞMUR
  const positions = rain.geometry.attributes.position;

  for (let i = 0; i < rainCount; i++) {
    positions.array[i * 3 + 1] -= dt * 17;
    if (positions.array[i * 3 + 1] < 0) {
      positions.array[i * 3 + 1] = 24;
    }
  }
  positions.needsUpdate = true;

  if (started && !paused) {
    journey += dt * .75;

    // KORTEJ UZUN YOLDA İLERLER
    parade.position.z = -journey;

    if (journey < 100) stage = 1;
    else if (journey < 400) stage = 2;
    else if (journey < 480) stage = 3;
    else stage = 4;
  }

  // TAŞIYICILAR, TABUT VE KATILIMCILAR AYNI GRUPTA İLERLER
  // Böylece katılımcılar tabutun arkasından ayrılmaz.
  [...carriers, ...players.values()].forEach(character => {
    const data = character.userData;
    const phase = time * 5 + data.phase;

    data.legs.forEach((leg, i) => {
      leg.rotation.x = started && !paused
        ? Math.sin(phase + i * Math.PI) * .45
        : 0;
    });

    data.arms.forEach((arm, i) => {
      if (carriers.includes(character)) return;
      arm.rotation.x = started && !paused
        ? Math.sin(phase + i * Math.PI) * .2
        : 0;
    });
  });

  // TABUTUN TAŞINMA HAREKETİ
  coffin.position.y = Math.sin(time * 5) * .035;
  coffin.rotation.z = Math.sin(time * 2) * .008;

  // KAMERA TABUTU VE KATILIMCILARI BİRLİKTE TAKİP EDER
  const targetZ = parade.position.z + 2.2;

  desiredTarget.set(0, 1.5, targetZ);
  desiredCamera.set(0, 9, parade.position.z + 19);

  camera.position.lerp(desiredCamera, 1 - Math.exp(-dt * 2.2));
  controls.target.lerp(desiredTarget, 1 - Math.exp(-dt * 3));
  controls.update();

  document.querySelectorAll('.route-stage').forEach((element, i) => {
    element.classList.toggle('active', i <= stage);
  });

  if ($('routeProgress')) {
    $('routeProgress').style.width = `${stage * 25}%`;
  }

  updateHud();
  renderer.render(scene, camera);
}

animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});
