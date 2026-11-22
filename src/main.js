
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

import {
  wireAudioUI,
  startAmbience,
  voice,
  giftSound,
  cryingSound
} from './audio.js';

const $ = id => document.getElementById(id);
const API = 'https://bihter-live-bridge.onrender.com';

// SAHNE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101018);
scene.fog = new THREE.Fog(0x101018, 45, 170);

const camera = new THREE.PerspectiveCamera(
  48,
  innerWidth / innerHeight,
  0.1,
  250
);
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
controls.maxPolarAngle = Math.PI * 0.47;

scene.add(new THREE.HemisphereLight(0xcbd0e0, 0x211820, 2));

const light = new THREE.DirectionalLight(0xffdfc0, 2.5);
light.position.set(-8, 18, 10);
light.castShadow = true;
scene.add(light);

const material = (color, roughness = 0.8) =>
  new THREE.MeshStandardMaterial({ color, roughness });

// ZEMİN
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
road.position.set(0, 0.03, -280);
scene.add(road);

for (const x of [-6.1, 6.1]) {
  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.12, 650),
    material(0x9a8061)
  );

  edge.position.set(x, 0.08, -280);
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
    new THREE.CylinderGeometry(0.35, 0.42, 6.8, 18),
    material(0x967658)
  );

  column.position.set(x, 3.4, 4.4);
  palace.add(column);
}

// MEZARLIK KAPISI
const gate = new THREE.Group();
scene.add(gate);

for (const x of [-5, 5]) {
  const pillar = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 5, 0.5),
    material(0x77644d)
  );

  pillar.position.set(x, 2.5, -590);
  gate.add(pillar);
}

const lintel = new THREE.Mesh(
  new THREE.BoxGeometry(10, 0.45, 0.5),
  material(0x927552)
);

lintel.position.set(0, 5, -590);
gate.add(lintel);

// YAĞMUR
const rainCount = 1400;
const rainGeometry = new THREE.BufferGeometry();
const rainPositions = new Float32Array(rainCount * 3);

for (let i = 0; i < rainCount; i++) {
  rainPositions[i * 3] = (Math.random() - 0.5) * 45;
  rainPositions[i * 3 + 1] = Math.random() * 25;
  rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 90;
}

rainGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(rainPositions, 3)
);

const rain = new THREE.Points(
  rainGeometry,
  new THREE.PointsMaterial({
    color: 0xaabbd0,
    size: 0.055,
    transparent: true,
    opacity: 0.6
  })
);

scene.add(rain);

// CENAZE KORTEJİ
const parade = new THREE.Group();
scene.add(parade);

// TABUT
const coffin = new THREE.Group();
parade.add(coffin);

const coffinBody = new THREE.Mesh(
  new THREE.BoxGeometry(3.1, 0.65, 1.35),
  material(0x3b2027, 0.4)
);

coffinBody.position.y = 1.55;
coffinBody.castShadow = true;
coffin.add(coffinBody);

const coffinLid = new THREE.Mesh(
  new THREE.BoxGeometry(3.2, 0.18, 1.42),
  material(0xb99a65, 0.35)
);

coffinLid.position.y = 1.97;
coffin.add(coffinLid);

// TABUT TAŞIMA ÇUBUKLARI
const rodMaterial = material(0x9e8056, 0.35);

for (const z of [-0.52, 0.52]) {
  const rod = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 0.13, 0.13),
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
    new THREE.SpriteMaterial({
      map: texture,
      depthTest: false
    })
  );

  sprite.scale.set(1.8, 0.45, 1);
  sprite.position.y = 2.8;

  return sprite;
}

// KARAKTER OLUŞTURMA
function makePerson(name, gender = 'male', avatar = null) {
  const person = new THREE.Group();

  const coat = material(
    gender === 'female' ? 0x392532 : 0x242630
  );

  const skin = material(0xb98268);
  const pants = material(0x17171d);

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.29, 0.72, 5, 10),
    coat
  );

  body.position.y = 1.35;
  person.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 18, 14),
    skin
  );

  head.position.y = 2.05;
  person.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.23, 16, 12),
    material(0x171318)
  );

  hair.scale.y = 0.65;
  hair.position.y = 2.17;
  person.add(hair);

  const arms = [];
  const legs = [];

  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.31, 1.65, 0);

    const armMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.095, 0.44, 4, 8),
      coat
    );

    armMesh.position.y = -0.25;
    arm.add(armMesh);
    person.add(arm);
    arms.push(arm);

    const leg = new THREE.Group();
    leg.position.set(side * 0.14, 0.92, 0);

    const legMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.115, 0.48, 4, 8),
      pants
    );

    legMesh.position.y = -0.27;
    leg.add(legMesh);
    person.add(leg);
    legs.push(leg);
  }

  person.add(makeLabel(name));

  person.userData = {
    name,
    arms,
    legs,
    phase: Math.random() * 6.28
  };

  // TIKTOK PROFİL FOTOĞRAFI
  if (avatar) {
    new THREE.TextureLoader().load(
      avatar,
      texture => {
        const face = new THREE.Mesh(
          new THREE.CircleGeometry(0.18, 24),
          new THREE.MeshBasicMaterial({ map: texture })
        );

        face.position.set(0, 2.05, 0.205);
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

// TABUT TAŞIYICILARI
const carriers = [];

for (const [x, z] of [
  [-2.35, 0.52],
  [2.35, 0.52],
  [-2.35, -0.52],
  [2.35, -0.52]
]) {
  const carrier = makePerson('TAŞIYICI');
  carrier.position.set(x, 0, z);
  parade.add(carrier);
  carriers.push(carrier);
}

// TAŞIYICILARIN KOL POZİSYONU
carriers.forEach(carrier => {
  carrier.userData.arms[0].rotation.z = -0.9;
  carrier.userData.arms[1].rotation.z = 0.9;
});

// KATILIMCILAR
const players = new Map();
const genderChoice = new Map();

let started = false;
let paused = false;
let journey = 0;
let stage = 0;
let sound = true;

// KULLANICIYI KORTEJE EKLE
function addPlayer(name, gender, avatar) {
  if (players.has(name)) return;

  const person = makePerson(name, gender, avatar);
  const index = players.size;

  // TABUTUN ARKASINDA İKİLİ SIRA
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

// SESLİ KONUŞMA
function say(message, character = 'female') {
  if (sound) voice(message, character);
}

// AKTİVİTE MESAJI
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

// EKRAN BİLGİLERİ
function updateHud() {
  if ($('playerCount')) {
    $('playerCount').textContent = players.size;
  }

  if ($('stageName')) {
    $('stageName').textContent = [
      'SARAY',
      'ALAY',
      'MEZARLIK',
      'DEFİN',
      'FİNAL'
    ][stage];
  }
}

// TIKTOK KOMUTLARI
function command(text, name = 'Misafir', avatar = null) {
  const c = String(text || '')
    .trim()
    .toLocaleUpperCase('tr-TR');

  if (c === 'KADIN' || c === 'ERKEK') {
    genderChoice.set(
      name,
      c === 'KADIN' ? 'female' : 'male'
    );

    log(`${name} karakter seçti.`);
    return;
  }

  if (c === 'KATIL' || c === 'TASIMA') {
    addPlayer(
      name,
      genderChoice.get(name) || 'male',
      avatar
    );
    return;
  }

  if (c === 'DUA') {
    log(`${name} dua ediyor.`);
    say('Herkes Bihter için dua etsin.', 'female');
    return;
  }

  // BIHTER AĞLAMA EFEKTİ
  if (c === 'AGLA') {
    log(`${name} ağlama komutu gönderdi.`);
    cryingSound();
    say(
      'Hayır! Bihter, uyan! Ne olur bizi bırakma!',
      'bihter'
    );
    return;
  }

  if (c === 'UYAN') {
    say('Bihter uyan! Ne olur gözlerini aç!', 'bihter');
    return;
  }

  if (c === 'BEHLUL' || c === 'BEHLÜL') {
    say('Bihter, beni affet. Seni kaybetmek istemedim.', 'behlul');
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

// TIKTOK CANLI YAYIN BAĞLANTISI
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
      if ($('liveStatus')) {
        $('liveStatus').textContent = 'SUNUCU BEKLENİYOR';
      }
    });

  const stream = new EventSource(`${API}/api/stream`);

  stream.onmessage = event => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'comment') {
        command(data.comment, data.user, data.avatar);
      }

      if (data.type === 'gift') {
        log(`${data.user} ${data.gift} gönderdi.`);
        giftSound();
        say(`${data.user} hediye gönderdi.`, 'male');
      }
    } catch (error) {
      console.warn('TikTok mesaj hatası:', error);
    }
  };

  stream.onerror = () => {
    if ($('liveStatus')) {
      $('liveStatus').textContent = 'BAĞLANTI YENİDEN DENENİYOR';
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

  say(
    'Bihter’in son yolculuğu başlıyor. Herkes korteje katılsın.',
    'male'
  );

  log('Cenaze korteji yola çıktı.');
});

// PROVA KOMUT DÜĞMELERİ
document.querySelectorAll('[data-command]').forEach(button => {
  button.addEventListener('click', () => {
    command(button.dataset.command, 'PROVA');
  });
});

// ANİMASYON
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;

  // YAĞMUR HAREKETİ
  const positions = rain.geometry.attributes.position;

  for (let i = 0; i < rainCount; i++) {
    positions.array[i * 3 + 1] -= dt * 17;

    if (positions.array[i * 3 + 1] < 0) {
      positions.array[i * 3 + 1] = 24;
    }
  }

  positions.needsUpdate = true;

  // KORTEJİN UZUN YOLDA İLERLEMESİ
  if (started && !paused) {
    journey += dt * 0.75;
    parade.position.z = -journey;

    if (journey < 100) {
      stage = 1;
    } else if (journey < 400) {
      stage = 2;
    } else if (journey < 480) {
      stage = 3;
    } else {
      stage = 4;
    }
  }

  // TAŞIYICILAR VE KATILIMCILAR YÜRÜR
  [...carriers, ...players.values()].forEach(character => {
    const data = character.userData;
    const phase = time * 5 + data.phase;

    data.legs.forEach((leg, i) => {
      leg.rotation.x = started && !paused
        ? Math.sin(phase + i * Math.PI) * 0.45
        : 0;
    });

    data.arms.forEach((arm, i) => {
      if (carriers.includes(character)) return;

      arm.rotation.x = started && !paused
        ? Math.sin(phase + i * Math.PI) * 0.2
        : 0;
    });
  });

  // TABUT HAREKETİ
  coffin.position.y = Math.sin(time * 5) * 0.035;
  coffin.rotation.z = Math.sin(time * 2) * 0.008;

  // KAMERA TABUT VE KATILIMCILARI TAKİP EDER
  const targetZ = parade.position.z + 2.2;

  const desiredTarget = new THREE.Vector3(
    0,
    1.5,
    targetZ
  );

  const desiredCamera = new THREE.Vector3(
    0,
    9,
    parade.position.z + 19
  );

  camera.position.lerp(
    desiredCamera,
    1 - Math.exp(-dt * 2.2)
  );

  controls.target.lerp(
    desiredTarget,
    1 - Math.exp(-dt * 3)
  );

  controls.update();

  // AŞAMA GÖSTERGESİ
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

// EKRAN BOYUTU
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});
