
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const $ = id => document.getElementById(id);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x171019);
scene.fog = new THREE.Fog(0x171019, 18, 65);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  120
);
camera.position.set(0, 7, 17);

const renderer = new THREE.WebGLRenderer({
  canvas: $('scene'),
  antialias: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enablePan = true;
controls.minDistance = 5;
controls.maxDistance = 30;
controls.maxPolarAngle = Math.PI * 0.49;
controls.target.set(0, 1, 0);
controls.update();

scene.add(new THREE.HemisphereLight(0xcbbbd0, 0x29202a, 2));

const moon = new THREE.DirectionalLight(0xffd9ad, 3);
moon.position.set(-5, 12, 7);
moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
scene.add(moon);

const redLight = new THREE.PointLight(0xa52c43, 25, 20);
redLight.position.set(4, 4, 1);
scene.add(redLight);

function material(color, roughness = 0.8, metalness = 0) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness
  });
}

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  material(0x28202a)
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Sahne grupları
const procession = new THREE.Group();
scene.add(procession);

// Saray
const palace = new THREE.Group();
scene.add(palace);

const wall = new THREE.Mesh(
  new THREE.BoxGeometry(22, 5, 0.7),
  material(0x392b34)
);
wall.position.set(0, 2.5, -8);
palace.add(wall);

for (let x = -9; x <= 9; x += 2.5) {
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.23, 0.3, 4.8, 16),
    material(0x80614e)
  );
  column.position.set(x, 2.4, -7.5);
  palace.add(column);
}

// Yol
const road = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 45),
  material(0x393039)
);
road.rotation.x = -Math.PI / 2;
road.position.set(0, 0.015, 8);
scene.add(road);

// Tabut
const coffin = new THREE.Group();
procession.add(coffin);

const wood = material(0x321a20, 0.35);
const gold = material(0xb58a50, 0.3, 0.35);
const velvet = material(0x741c31, 0.5);

const base = new THREE.Mesh(
  new THREE.BoxGeometry(3.2, 0.55, 1.35),
  wood
);
base.position.y = 1.35;
base.castShadow = true;
coffin.add(base);

const lid = new THREE.Mesh(
  new THREE.BoxGeometry(3.3, 0.2, 1.42),
  gold
);
lid.position.y = 1.72;
coffin.add(lid);

const top = new THREE.Mesh(
  new THREE.BoxGeometry(3.05, 0.1, 1.2),
  velvet
);
top.position.y = 1.87;
coffin.add(top);

// Tabut süsleri
for (let i = -2; i <= 2; i++) {
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.04, 8, 16),
    gold
  );
  handle.position.set(i * 0.6, 1.35, 0.72);
  handle.rotation.x = Math.PI / 2;
  coffin.add(handle);
}

// Tabut üzerindeki dekoratif çerçeve
const portraitFrame = new THREE.Mesh(
  new THREE.BoxGeometry(0.72, 0.06, 0.88),
  gold
);
portraitFrame.position.set(0, 1.98, 0);
coffin.add(portraitFrame);

// İnsan modeli
function person(x, z, color, scale = 1, gender = 'male') {
  const root = new THREE.Group();
  root.position.set(x, 0, z);
  root.scale.setScalar(scale);

  const coat = material(color);
  const skin = material(0xc58d70);
  const pants = material(0x17151a);
  const hair = material(gender === 'female' ? 0x24151b : 0x171316);

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.27, 0.65, 5, 10),
    coat
  );
  body.position.y = 1.35;
  root.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 20, 16),
    skin
  );
  head.position.y = 2.05;
  root.add(head);

  const hairMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.225, 16, 12),
    hair
  );
  hairMesh.scale.set(1, 0.55, 1);
  hairMesh.position.set(0, 2.17, -0.025);
  root.add(hairMesh);

  const arms = [];
  const legs = [];

  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.3, 1.65, 0);

    const upperArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.09, 0.42, 4, 8),
      coat
    );
    upperArm.position.y = -0.25;
    arm.add(upperArm);
    root.add(arm);
    arms.push(arm);

    const leg = new THREE.Group();
    leg.position.set(side * 0.14, 0.95, 0);

    const thigh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11, 0.45, 4, 8),
      pants
    );
    thigh.position.y = -0.27;
    leg.add(thigh);

    const foot = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.12, 0.34),
      pants
    );
    foot.position.set(0, -0.53, 0.1);
    leg.add(foot);

    root.add(leg);
    legs.push(leg);
  }

  root.userData.arms = arms;
  root.userData.legs = legs;
  root.userData.phase = Math.random() * 6;
  root.userData.gender = gender;

  root.traverse(object => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  procession.add(root);
  return root;
}

// Dört tabut taşıyıcısı
const carriers = [
  person(-2, 0.45, 0x25202a, 0.9),
  person(2, 0.45, 0x25202a, 0.9),
  person(-2, -0.9, 0x30242c, 0.9),
  person(2, -0.9, 0x30242c, 0.9)
];

carriers.forEach(p => {
  p.rotation.y = Math.PI;
});

// Kalabalık
const mourners = [];

for (let i = 0; i < 22; i++) {
  const p = person(
    (Math.random() - 0.5) * 12,
    -3 - Math.random() * 7,
    i % 2 ? 0x25202a : 0x3b2930,
    0.65,
    i % 3 === 0 ? 'female' : 'male'
  );
  mourners.push(p);
}

// Behlül ve Ezel
const behlul = person(4, 0, 0x11131a, 1.05, 'male');
const ezel = person(-7, 0, 0x253548, 1.05, 'male');

let votes = {
  UYAN: new Set(),
  GEL: new Set()
};

let joined = new Set();
let carrierQueue = [];
let activeCarriers = new Set();
let crying = 0;
let prayers = 0;
let protests = 0;
let seconds = 300;
let soundOn = true;
let speechBusy = false;
let lastLine = 0;
let movementPaused = false;

const lines = [
  'Ölmedim ben! Kurtarın beni!',
  'Behlül! Beni burada bırakma!',
  'Sesimi duyan yok mu?',
  'Tabutu açın! Ne olur!'
];

function update() {
  $('uyanCount').textContent = votes.UYAN.size;
  $('gelCount').textContent = votes.GEL.size;
  $('attendeeCount').textContent = joined.size;
  $('carrierCount').textContent = `${activeCarriers.size}/4`;
}

function log(name, message) {
  const p = document.createElement('p');
  const b = document.createElement('b');

  b.textContent = name + ': ';
  p.append(b, document.createTextNode(message));

  $('chatLog').appendChild(p);
  $('chatLog').scrollTop = $('chatLog').scrollHeight;

  while ($('chatLog').children.length > 20) {
    $('chatLog').firstChild.remove();
  }
}

function subtitle(message) {
  $('subtitle').textContent = message;
}

function speak(message) {
  if (!soundOn || !('speechSynthesis' in window) || speechBusy) return;

  speechBusy = true;

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'tr-TR';
  utterance.rate = 0.88;
  utterance.pitch = 0.95;

  utterance.onend = () => speechBusy = false;
  utterance.onerror = () => speechBusy = false;

  speechSynthesis.speak(utterance);
}

function toast(icon, title, detail) {
  const box = $('giftToast');
  box.querySelector('.gift-icon').textContent = icon;
  $('giftTitle').textContent = title;
  $('giftDetail').textContent = detail;

  box.classList.add('show');

  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    box.classList.remove('show');
  }, 3500);
}

function addCarrier(name) {
  if (activeCarriers.size < 4) {
    activeCarriers.add(name);
    log(name, 'Tabut taşıyıcılarına katıldı.');
  } else if (!carrierQueue.includes(name)) {
    carrierQueue.push(name);
    log(name, 'Taşıyıcı sırasına alındı.');
  }

  update();
}

function nextCarrier() {
  if (activeCarriers.size >= 4 || carrierQueue.length === 0) return;

  const name = carrierQueue.shift();
  activeCarriers.add(name);
  log(name, 'Tabut taşıma görevine geçti.');
  update();
}

function command(raw, name = 'Misafir') {
  const c = raw.trim().toLocaleUpperCase('tr-TR');
  if (!c) return;

  if (c === 'KATIL') {
    if (joined.has(name)) {
      log(name, 'Zaten cenazeye katıldın.');
      return;
    }

    joined.add(name);
    log(name, 'Cenazeye katıldı.');
    toast('🕯️', name + ' KATILDI', 'Cenaze kalabalığı büyüyor.');
  }

  else if (c === 'TASIMA') {
    addCarrier(name);
  }

  else if (c === 'DUA') {
    prayers++;
    log(name, 'Bihter için dua ediyor.');
    subtitle(name + ' Bihter için dua ediyor...');
  }

  else if (c === 'AGLA') {
    crying++;
    log(name, 'Ağlayarak cenazeye katıldı.');
    subtitle('Cenaze kalabalığında hıçkırık sesleri yükseliyor...');
  }

  else if (c === 'BEHLUL') {
    protests++;
    log(name, 'Behlül protesto ediliyor!');
    subtitle('Kalabalık: BEHLÜL! BEHLÜL!');
  }

  else if (c === 'EZEL') {
    log(name, 'Ezel diye bağırıyor!');
    subtitle('Kalabalık Ezel’i çağırıyor!');
  }

  else if (c === 'UYAN' || c === 'GEL') {
    const other = c === 'UYAN' ? 'GEL' : 'UYAN';

    if (votes.UYAN.has(name) || votes.GEL.has(name)) {
      log(name, 'Daha önce oy kullandın.');
      return;
    }

    votes[c].add(name);
    log(name, c + ' oyu verdi!');
    subtitle(name + ': ' + c + '!');

    if (votes[c].size > votes[other].size) {
      $('sceneLine').textContent = c + ' oyları önde!';
    }
  }

  else if (c === 'DUR') {
    log(name, 'Cenaze alayı durduruldu.');
    movementPaused = true;
  }

  else if (c === 'YÜRÜ') {
    movementPaused = false;
    log(name, 'Cenaze alayı yeniden yürümeye başladı.');
  }

  else if (c === 'KADIN' || c === 'ERKEK') {
    log(name, c === 'KADIN' ? 'Kadın karakter istedi.' : 'Erkek karakter istedi.');
    toast('👤', name, 'Karakter tercihi alındı.');
  }

  else {
    log(name, 'Komut tanınmadı: ' + raw);
  }

  update();
}

function gift(type, name = 'Misafir') {
  const effects = {
    Rose: ['🌹', 'GÜL', 'KATIL', 'Cenazeye katıldı.'],
    Heart: ['❤️', 'KALP', 'DUA', 'Bihter için dua ediyor.'],
    Gift: ['🎁', 'HEDİYE', 'TASIMA', 'Taşıma sırasına girdi.'],
    Mini: ['🐱', 'MİNİ HEDİYE', 'BEHLUL', 'Behlül protesto ediliyor.']
  };

  const item = effects[type] || effects.Rose;

  toast(item[0], name + ' · ' + item[1], item[3]);
  log(name, type + ' prova hediyesi gönderdi.');
  command(item[2], name);
}

// Sohbet provası
$('chatForm').addEventListener('submit', event => {
  event.preventDefault();

  const value = $('chatInput').value;
  $('chatInput').value = '';

  command(value, 'Sen');
});

document.querySelectorAll('[data-command]').forEach(button => {
  button.addEventListener('click', () => {
    command(button.dataset.command, 'Prova oyuncusu');
  });
});

document.querySelectorAll('[data-gift]').forEach(button => {
  button.addEventListener('click', () => {
    gift(button.dataset.gift, 'Prova oyuncusu');
  });
});

$('soundToggle').addEventListener('click', () => {
  soundOn = !soundOn;
  $('soundToggle').textContent = soundOn ? '🔊 SES AÇIK' : '🔇 SES KAPALI';

  if (!soundOn && 'speechSynthesis' in window) {
    speechSynthesis.cancel();
    speechBusy = false;
  }
});

// Taşıyıcı sırası
setInterval(() => {
  if (activeCarriers.size > 0) {
    const first = activeCarriers.values().next().value;
    activeCarriers.delete(first);
    nextCarrier();
    update();
  }
}, 30000);

// Bihter konuşmaları
setInterval(() => {
  if (!soundOn) return;

  const line = lines[lastLine++ % lines.length];
  subtitle('BİHTER: ' + line);
  speak(line);
}, 18000);

// Sayaç
setInterval(() => {
  if (seconds > 0) seconds--;

  $('clock').textContent =
    String(Math.floor(seconds / 60)).padStart(2, '0') + ':' +
    String(seconds % 60).padStart(2, '0');
}, 1000);

// Animasyon
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  if (!movementPaused) {
    procession.position.x = Math.sin(t * 0.16) * 0.45;
    procession.position.z = Math.sin(t * 0.10) * 0.25;
  }

  coffin.position.y = Math.sin(t * 2.5) * 0.025;
  coffin.rotation.z = Math.sin(t * 1.2) * 0.009;

  carriers.forEach((p, i) => {
    const phase = t * 3.2 + p.userData.phase;

    p.userData.legs.forEach((leg, j) => {
      leg.rotation.x = Math.sin(phase + j * Math.PI) * 0.35;
    });

    p.userData.arms.forEach((arm, j) => {
      arm.rotation.x = -0.25 + Math.sin(phase + j * Math.PI) * 0.12;
    });

    p.position.y = Math.abs(Math.sin(phase * 2)) * 0.025;
  });

  mourners.forEach(p => {
    const phase = t * 2.5 + p.userData.phase;

    p.userData.legs.forEach((leg, j) => {
      leg.rotation.x = Math.sin(phase + j * Math.PI) * 0.28;
    });

    p.userData.arms.forEach((arm, j) => {
      arm.rotation.x = Math.sin(phase * 0.5 + j) * 0.08;
    });
  });

  behlul.position.x = 4 + Math.sin(t * 0.5) * 0.15;

  ezel.position.x = Math.min(-7 + t * 0.025, -4.5);
  ezel.userData.legs.forEach((leg, j) => {
    leg.rotation.x = Math.sin(t * 3 + j * Math.PI) * 0.35;
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Ekran boyutu
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

update();
