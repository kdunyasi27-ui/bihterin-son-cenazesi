
import * as THREE from 'three';
import './style.css';

const $ = id => document.getElementById(id);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x171019);
scene.fog = new THREE.Fog(0x171019, 18, 55);

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 6, 15);
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({
  canvas: $('scene'),
  antialias: true
});

renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;

scene.add(new THREE.HemisphereLight(0xcbbbd0, 0x29202a, 2));

const moon = new THREE.DirectionalLight(0xffd9ad, 3);
moon.position.set(-5, 10, 7);
moon.castShadow = true;
scene.add(moon);

const red = new THREE.PointLight(0xa52c43, 25, 18);
red.position.set(4, 4, 1);
scene.add(red);

function material(color, roughness = 0.8) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  material(0x28202a)
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Saray
const palace = new THREE.Group();
scene.add(palace);

const wall = new THREE.Mesh(
  new THREE.BoxGeometry(20, 5, 0.7),
  material(0x392b34)
);
wall.position.set(0, 2.5, -7);
palace.add(wall);

for (let x = -8; x <= 8; x += 2.5) {
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.23, 0.3, 4.8, 16),
    material(0x80614e)
  );
  column.position.set(x, 2.4, -6.5);
  palace.add(column);
}

// Tabut
const coffin = new THREE.Group();
scene.add(coffin);

const wood = material(0x321a20, 0.35);
const gold = material(0xb58a50, 0.3);
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

for (let i = -2; i <= 2; i++) {
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.04, 8, 16),
    gold
  );
  handle.position.set(i * 0.6, 1.35, 0.72);
  handle.rotation.x = Math.PI / 2;
  coffin.add(handle);
}

// İnsan modeli
function person(x, z, color, scale = 1) {
  const root = new THREE.Group();
  root.position.set(x, 0, z);
  root.scale.setScalar(scale);

  const coat = material(color);
  const skin = material(0xc58d70);
  const pants = material(0x17151a);

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.27, 0.65, 5, 10),
    coat
  );
  body.position.y = 1.35;
  root.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 12),
    skin
  );
  head.position.y = 2.05;
  root.add(head);

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

  root.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  scene.add(root);
  return root;
}

// Dört tabut taşıyıcısı
const carriers = [
  person(-2, 0.3, 0x25202a, 0.9),
  person(2, 0.3, 0x25202a, 0.9),
  person(-2, -1, 0x30242c, 0.9),
  person(2, -1, 0x30242c, 0.9)
];

carriers.forEach(p => {
  p.rotation.y = Math.PI;
});

// Kalabalık
const mourners = [];

for (let i = 0; i < 18; i++) {
  const p = person(
    (Math.random() - 0.5) * 12,
    -3 - Math.random() * 5,
    i % 2 ? 0x25202a : 0x3b2930,
    0.65
  );
  mourners.push(p);
}

// Behlül ve Ezel
const behlul = person(4, 0, 0x11131a, 1.05);
const ezel = person(-7, 0, 0x253548, 1.05);

let votes = { UYAN: new Set(), GEL: new Set() };
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
  toast.timer = setTimeout(() => box.classList.remove('show'), 3500);
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

// Sohbet
$('chatForm').addEventListener('submit', e => {
  e.preventDefault();

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

  if (!soundOn) speechSynthesis.cancel();
});

let movementPaused = false;

// Taşıyıcı değişimi
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
let processionX = 0;

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  if (!movementPaused) {
    processionX += 0.0018;
  }

  coffin.position.x = Math.sin(t * 2) * 0.035;
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
  });

  behlul.position.x = 4 + Math.sin(t * 0.5) * 0.15;

  ezel.position.x = Math.min(-7 + t * 0.025, -4.5);
  ezel.userData.legs.forEach((leg, j) => {
    leg.rotation.x = Math.sin(t * 3 + j * Math.PI) * 0.35;
  });

  camera.position.x = Math.sin(t * 0.15) * 0.3;
  camera.lookAt(0, 1.1, 0);

  renderer.render(scene, camera);
}

animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});

update();
