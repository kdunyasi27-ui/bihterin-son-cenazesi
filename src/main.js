
import * as THREE from 'three';
import './style.css';

const canvas = document.querySelector('#scene');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false
});

renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x171019);
scene.fog = new THREE.FogExp2(0x171019, 0.027);

const camera = new THREE.PerspectiveCamera(
  42,
  innerWidth / innerHeight,
  0.1,
  100
);

camera.position.set(0, 5.2, 13.5);
camera.lookAt(0, 1.4, 0);

scene.add(
  new THREE.HemisphereLight(0xc8b5ce, 0x24151a, 2)
);

const moon = new THREE.DirectionalLight(0xffdfb0, 3.2);
moon.position.set(-5, 10, 6);
moon.castShadow = true;
moon.shadow.mapSize.set(1024, 1024);
scene.add(moon);

const redLight = new THREE.PointLight(0x9d293d, 34, 18);
redLight.position.set(4, 3, 1);
scene.add(redLight);

const warmLight = new THREE.PointLight(0xffc77a, 28, 16);
warmLight.position.set(-5, 3, -1);
scene.add(warmLight);

const mat = (color, roughness = 0.8, metalness = 0) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness
  });

// Zemin
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  mat(0x292029)
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.04;
ground.receiveShadow = true;
scene.add(ground);

const floorGrid = new THREE.GridHelper(
  40,
  40,
  0x4a343d,
  0x34252e
);

floorGrid.position.y = -0.025;
floorGrid.material.transparent = true;
floorGrid.material.opacity = 0.22;
scene.add(floorGrid);

// Saray
const palace = new THREE.Group();
scene.add(palace);

const wall = new THREE.Mesh(
  new THREE.BoxGeometry(19, 5, 0.7),
  mat(0x30242d)
);

wall.position.set(0, 2.5, -7);
palace.add(wall);

for (let x = -8; x <= 8; x += 2.3) {
  const col = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 4.7, 12),
    mat(0x6b4d43)
  );

  col.position.set(x, 2.35, -6.5);
  palace.add(col);

  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.22, 0.9),
    mat(0x9a7956)
  );

  cap.position.set(x, 4.7, -6.5);
  palace.add(cap);

  const glow = new THREE.PointLight(0xffa94d, 5, 5);
  glow.position.set(x, 2.7, -5.9);
  scene.add(glow);
}

// Tabut
const coffin = new THREE.Group();
scene.add(coffin);

const wood = mat(0x321a20, 0.34, 0.25);
const trim = mat(0xb58a50, 0.3, 0.65);
const velvet = mat(0x6b1727, 0.65);

const base = new THREE.Mesh(
  new THREE.BoxGeometry(3.3, 0.55, 1.45),
  wood
);

base.position.y = 1.35;
base.castShadow = true;
coffin.add(base);

const lid = new THREE.Mesh(
  new THREE.BoxGeometry(3.38, 0.22, 1.52),
  trim
);

lid.position.y = 1.76;
lid.castShadow = true;
coffin.add(lid);

const lidTop = new THREE.Mesh(
  new THREE.BoxGeometry(3.05, 0.12, 1.28),
  velvet
);

lidTop.position.y = 1.91;
coffin.add(lidTop);

// Tabut kulpları
for (const x of [-1.3, -0.65, 0, 0.65, 1.3]) {
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.045, 8, 16, Math.PI),
    trim
  );

  handle.rotation.x = Math.PI / 2;
  handle.position.set(x, 1.35, 0.77);
  coffin.add(handle);
}

// Tabut üzerindeki güller
const roseMat = mat(0x9e2038, 0.5);
const leafMat = mat(0x30452e);

for (let i = 0; i < 9; i++) {
  const x = (Math.random() - 0.5) * 2.4;
  const z = (Math.random() - 0.5) * 0.85;

  const rose = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 10, 8),
    roseMat
  );

  rose.scale.set(1, 0.65, 1);
  rose.position.set(x, 2.02, z);
  coffin.add(rose);

  const leaf = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 8, 6),
    leafMat
  );

  leaf.scale.set(1, 0.3, 2);
  leaf.position.set(x + 0.12, 1.99, z + 0.1);
  coffin.add(leaf);
}

// Basit 3D karakter oluşturucu
function makePerson(x, z, coatColor, scale = 1) {
  const g = new THREE.Group();

  g.position.set(x, 0, z);
  g.scale.setScalar(scale);

  const coat = mat(coatColor);
  const skin = mat(0xc58d70);
  const pants = mat(0x17151a);
  const shoe = mat(0x09090b);
  const hair = mat(0x171116);

  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.27, 0.65, 5, 9),
    coat
  );

  torso.position.y = 1.35;
  torso.castShadow = true;
  g.add(torso);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 10),
    skin
  );

  head.position.y = 2.05;
  head.castShadow = true;
  g.add(head);

  const haircap = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.225,
      12,
      8,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    ),
    hair
  );

  haircap.position.y = 2.1;
  g.add(haircap);

  const limbs = [];

  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.29, 1.65, 0);
    g.add(arm);

    const upper = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.09, 0.43, 4, 7),
      coat
    );

    upper.position.y = -0.27;
    arm.add(upper);

    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 8),
      skin
    );

    hand.position.y = -0.55;
    arm.add(hand);

    limbs.push(arm);

    const leg = new THREE.Group();
    leg.position.set(side * 0.14, 0.95, 0);
    g.add(leg);

    const thigh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11, 0.48, 4, 7),
      pants
    );

    thigh.position.y = -0.27;
    leg.add(thigh);

    const foot = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.12, 0.34),
      shoe
    );

    foot.position.set(0, -0.56, 0.1);
    leg.add(foot);

    limbs.push(leg);
  }

  g.userData.limbs = limbs;
  g.userData.phase = Math.random() * Math.PI * 2;

  g.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  scene.add(g);
  return g;
}

// Tabut taşıyıcıları
const carriers = [
  makePerson(-2.2, 0.15, 0x211d26, 0.92),
  makePerson(2.2, 0.15, 0x211d26, 0.92),
  makePerson(-2.2, -0.95, 0x29212a, 0.92),
  makePerson(2.2, -0.95, 0x29212a, 0.92)
];

carriers[0].position.set(-2.05, 0, 0.25);
carriers[1].position.set(2.05, 0, 0.25);
carriers[2].position.set(-2.05, 0, -1.05);
carriers[3].position.set(2.05, 0, -1.05);

carriers.forEach(p => p.rotation.y = Math.PI);

// Cenaze kalabalığı
const mourners = [];

for (let i = 0; i < 13; i++) {
  const angle = (i / 13) * Math.PI * 2;
  const radius = 4 + (i % 3) * 0.48;

  const p = makePerson(
    Math.cos(angle) * radius,
    Math.sin(angle) * radius - 0.4,
    i % 3 === 0 ? 0x34252b : 0x17171d,
    0.7 + Math.random() * 0.12
  );

  p.rotation.y = Math.atan2(
    -p.position.x,
    -p.position.z
  );

  mourners.push(p);
}

// Behlül ve Ezel
const behlul = makePerson(3.6, -0.1, 0x17151a, 1.05);
behlul.rotation.y = -Math.PI / 2;

const ezel = makePerson(-5.8, 1.1, 0x202a36, 1.08);
ezel.rotation.y = Math.PI / 2;

// Fenerler
for (let x = -6; x <= 6; x += 3) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.05, 2.2, 8),
    trim
  );

  pole.position.set(x, 0.95, 2.7);
  scene.add(pole);

  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 10, 8),
    mat(0xffc16c, 0.2)
  );

  lamp.position.set(x, 2.1, 2.7);
  scene.add(lamp);

  const light = new THREE.PointLight(0xffa94d, 7, 5);
  light.position.copy(lamp.position);
  scene.add(light);
}

// Oyun verileri
let uyan = 0;
let gel = 0;
let attendees = 0;
let carriersCount = 0;
let seconds = 300;
let soundOn = true;
let lastLine = 0;

const $ = id => document.getElementById(id);

// Güvenli sohbet yazdırma
function log(name, msg) {
  const p = document.createElement('p');
  const b = document.createElement('b');

  b.textContent = name + ': ';
  p.appendChild(b);
  p.appendChild(document.createTextNode(msg));

  $('chatLog').appendChild(p);
  $('chatLog').scrollTop = $('chatLog').scrollHeight;

  while ($('chatLog').children.length > 18) {
    $('chatLog').firstChild.remove();
  }
}

function subtitle(text) {
  $('subtitle').textContent = text;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

// Türkçe tarayıcı seslendirmesi
function speak(text) {
  if (!soundOn || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'tr-TR';
  u.rate = 0.94;
  u.pitch = 1;
  u.volume = 0.95;

  const voices = speechSynthesis.getVoices();
  const tr = voices.find(v =>
    v.lang.toLowerCase().startsWith('tr')
  );

  if (tr) u.voice = tr;

  speechSynthesis.speak(u);
}

// Basit ses efektleri
function sound(freq = 180, duration = 0.16, type = 'sine', volume = 0.12) {
  if (!soundOn) return;

  try {
    const ctx = sound.ctx ||
      (sound.ctx = new (
        window.AudioContext || window.webkitAudioContext
      )());

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = freq;

    gain.gain.setValueAtTime(volume, ctx.currentTime);

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn('Ses başlatılamadı:', error);
  }
}

// Hediye bildirimi
function toast(icon, title, detail) {
  $('giftToast').querySelector('.gift-icon').textContent = icon;
  $('giftTitle').textContent = title;
  $('giftDetail').textContent = detail;

  $('giftToast').classList.add('show');

  setTimeout(() => {
    $('giftToast').classList.remove('show');
  }, 3500);
}

function update() {
  $('uyanCount').textContent = uyan;
  $('gelCount').textContent = gel;
  $('attendeeCount').textContent = attendees;
  $('carrierCount').textContent = `${carriersCount}/4`;
}

// Sohbet komutları
function command(raw, name = 'Misafir') {
  const c = raw.trim().toLocaleUpperCase('tr-TR');

  if (!c) return;

  if (c === 'KATIL') {
    attendees++;

    log(name, 'Cenazeye katıldı.');

    toast(
      '🕯️',
      `${name} CENAZEYE KATILDI`,
      'Kalabalığa yeni bir kişi eklendi.'
    );

    subtitle(`${name} cenazeye katıldı.`);
    sound(480, 0.12, 'triangle');
  }

  else if (c === 'TASIMA') {
    if (carriersCount < 4) {
      carriersCount++;

      log(name, 'Tabut taşıma sırasına girdi.');

      toast(
        '⚰️',
        `${name} TAŞIMA SIRASINDA`,
        'Tabut taşıma ekibine katıldı.'
      );
    } else {
      log(name, 'Taşıma sırasına alındı.');

      toast(
        '⚰️',
        'TAŞIMA SIRASI DOLU',
        'Sıradaki taşıyıcı bekliyor.'
      );
    }
  }

  else if (c === 'DUA') {
    log(name, 'Bihter için dua ediyor.');
    subtitle(`${name}: Bihter için dua ediyor...`);
    sound(330, 0.3, 'sine', 0.08);
  }

  else if (c === 'UYAN') {
    uyan++;
    log(name, 'UYAN oyu verdi!');
    subtitle('Seyirciler UYAN diye bağırıyor!');
    sound(240, 0.14, 'square');
  }

  else if (c === 'GEL') {
    gel++;
    log(name, 'GEL oyu verdi!');
    subtitle('Seyirciler EZEL GEL diye bağırıyor!');
    sound(420, 0.14, 'triangle');
  }

  else if (c === 'YÜRÜ') {
    log(name, 'Cenaze alayı hızlandı.');
  }

  else if (c === 'DUR') {
    log(name, 'Cenazeyi durdurdu.');
  }

  else {
    log(name, `Komut tanınmadı: ${raw}`);
  }

  update();
}

// Hediye provası
function gift(type, name = 'Misafir') {
  const map = {
    Rose: [
      '🌹',
      'ROSE GÖNDERİLDİ',
      'Cenazeye bir kişi katıldı.',
      'Biri beni duydu! Ne olur kurtarın beni!'
    ],

    Heart: [
      '❤️',
      'KALP GÖNDERİLDİ',
      'Bihter için dua ediliyor.',
      'Teşekkür ederim! Sesimi duyan var!'
    ],

    Gift: [
      '🎁',
      'HEDİYE GÖNDERİLDİ',
      'Tabut taşıma sırası açıldı.',
      'Tabutu açın! Lütfen!'
    ],

    Mini: [
      '🐱',
      'MİNİ HEDİYE',
      'Behlül protesto ediliyor.',
      'Behlül! Beni burada bırakma!'
    ]
  };

  const m = map[type] || map.Rose;

  toast(
    m[0],
    `${name}: ${m[1]}`,
    m[2]
  );

  log(name, `${type} hediyesi gönderdi.`);

  speak(`${name} ${type} hediyesi gönderdi. ${m[2]}`);

  subtitle(`BİHTER: ${m[3]}`);

  if (type === 'Rose') {
    command('KATIL', name);
  }

  if (type === 'Heart') {
    command('DUA', name);
  }

  if (type === 'Gift') {
    command('TASIMA', name);
  }

  if (type === 'Mini') {
    log('Kalabalık', 'Behlül protesto ediliyor!');
    sound(100, 0.4, 'sawtooth', 0.18);
  }
}

// Form işlemleri
$('chatForm').addEventListener('submit', e => {
  e.preventDefault();

  const value = $('chatInput').value;
  $('chatInput').value = '';

  command(value, 'Sen');
});

// Hızlı komutlar
document.querySelectorAll('[data-command]').forEach(button => {
  button.addEventListener('click', () => {
    command(button.dataset.command, 'Prova oyuncusu');
  });
});

// Hediye düğmeleri
document.querySelectorAll('[data-gift]').forEach(button => {
  button.addEventListener('click', () => {
    gift(button.dataset.gift, 'Prova oyuncusu');
  });
});

// Ses kontrolü
$('soundToggle').addEventListener('click', () => {
  soundOn = !soundOn;

  $('soundToggle').textContent = soundOn
    ? '🔊 SES AÇIK'
    : '🔇 SES KAPALI';

  if (!soundOn && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
});

// Maç sayacı
setInterval(() => {
  if (seconds > 0) seconds--;

  const minutes = String(
    Math.floor(seconds / 60)
  ).padStart(2, '0');

  const secs = String(
    seconds % 60
  ).padStart(2, '0');

  $('clock').textContent = `${minutes}:${secs}`;
}, 1000);

// Bihter'in sesli replikleri
const lines = [
  'BİHTER: Ölmedim ben! Kurtarın beni!',
  'BİHTER: Behlül! Beni burada bırakma!',
  'BİHTER: Sesimi duyan yok mu?',
  'BİHTER: Tabutu açın! Ne olur!'
];

setInterval(() => {
  if (!soundOn) return;

  const line = lines[lastLine++ % lines.length];

  subtitle(line);
  speak(line.replace('BİHTER: ', ''));
}, 22000);

// Animasyon
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  // Tabut hareketi
  coffin.position.x = Math.sin(t * 0.22) * 0.08;
  coffin.position.y = Math.sin(t * 2.2) * 0.025;
  coffin.rotation.z = Math.sin(t * 1.1) * 0.012;

  // Taşıyıcıların adım hareketleri
  carriers.forEach(p => {
    const phase = t * 3.2 + p.userData.phase;

    p.userData.limbs.forEach((limb, j) => {
      limb.rotation.x =
        Math.sin(phase + (j % 2) * Math.PI) *
        (j < 2 ? 0.13 : 0.28);
    });
  });

  // Cenaze kalabalığı
  mourners.forEach(p => {
    const phase = t * 2.3 + p.userData.phase;

    p.position.x += Math.sin(phase) * 0.0008;

    p.userData.limbs.forEach((limb, j) => {
      limb.rotation.x =
        Math.sin(phase + (j % 2) * Math.PI) * 0.12;
    });
  });

  // Behlül
  behlul.position.x = 3.6 + Math.sin(t * 0.7) * 0.12;

  behlul.userData.limbs.forEach((limb, j) => {
    limb.rotation.x = Math.sin(t * 2 + j) * 0.08;
  });

  // Ezel'in yaklaşması
  ezel.position.x = -5.8 + Math.min(t * 0.012, 1.4);

  ezel.userData.limbs.forEach((limb, j) => {
    limb.rotation.x = Math.sin(t * 2 + j) * 0.12;
  });

  // Kamera
  camera.position.x = Math.sin(t * 0.12) * 0.24;
  camera.lookAt(0, 1.25, 0);

  renderer.render(scene, camera);
}

animate();

// Ekran boyutu değişimi
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});
