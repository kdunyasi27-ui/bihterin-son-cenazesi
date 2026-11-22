import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';
import { wireAudioUI, startAmbience, voice, giftSound } from './audio.js';

const $ = id => document.getElementById(id);
const API = 'https://bihter-live-bridge.onrender.com';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111018);
scene.fog = new THREE.Fog(0x111018, 35, 110);

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, .1, 180);
camera.position.set(0, 8, 20);

const renderer = new THREE.WebGLRenderer({
  canvas: $('scene'),
  antialias: true
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 6;
controls.maxDistance = 40;
controls.maxPolarAngle = Math.PI * .48;
controls.target.set(0, 1, 0);

scene.add(new THREE.HemisphereLight(0xcbd0e0, 0x211820, 2));

const sun = new THREE.DirectionalLight(0xffdfc0, 2.8);
sun.position.set(-8, 16, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

const mat = (c, r = .8) => new THREE.MeshStandardMaterial({
  color: c,
  roughness: r
});

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(130, 150),
  mat(0x22232a)
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const road = new THREE.Mesh(
  new THREE.PlaneGeometry(11, 120),
  mat(0x39363b)
);
road.rotation.x = -Math.PI / 2;
road.position.set(0, .025, -20);
scene.add(road);

for (const x of [-5.7, 5.7]) {
  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(.2, .15, 120),
    mat(0x796858)
  );
  edge.position.set(x, .08, -20);
  scene.add(edge);
}

// SARAY
const palace = new THREE.Group();
scene.add(palace);

const wall = new THREE.Mesh(
  new THREE.BoxGeometry(25, 7, 1),
  mat(0x45343b)
);
wall.position.set(0, 3.5, -53);
palace.add(wall);

for (let x = -11; x <= 11; x += 3.7) {
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(.35, .42, 6.8, 18),
    mat(0x967658)
  );
  column.position.set(x, 3.4, -52.4);
  palace.add(column);
}

// MEZARLIK KAPISI
const gate = new THREE.Group();
scene.add(gate);

for (const x of [-5, 5]) {
  const pillar = new THREE.Mesh(
    new THREE.BoxGeometry(.5, 5, .5),
    mat(0x77644d)
  );
  pillar.position.set(x, 2.5, -83);
  gate.add(pillar);
}

const lintel = new THREE.Mesh(
  new THREE.BoxGeometry(10, .45, .5),
  mat(0x927552)
);
lintel.position.set(0, 5, -83);
gate.add(lintel);

// YAĞMUR
const N = 1200;
const rainGeometry = new THREE.BufferGeometry();
const rainPositions = new Float32Array(N * 3);

for (let i = 0; i < N; i++) {
  rainPositions[i * 3] = (Math.random() - .5) * 45;
  rainPositions[i * 3 + 1] = Math.random() * 24;
  rainPositions[i * 3 + 2] = (Math.random() - .5) * 80;
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
    opacity: .55
  })
);
scene.add(rain);

// CENAZE ALAYI
const parade = new THREE.Group();
scene.add(parade);

const coffin = new THREE.Group();
parade.add(coffin);

const wood = mat(0x3b2027, .4);
const gold = mat(0xb99a65, .3);
const red = mat(0x6d1e32, .5);

const coffinBox = new THREE.Mesh(
  new THREE.BoxGeometry(3.2, .62, 1.35),
  wood
);
coffinBox.position.y = 1.55;
coffinBox.castShadow = true;
coffin.add(coffinBox);

const lid = new THREE.Mesh(
  new THREE.BoxGeometry(3.3, .18, 1.43),
  gold
);
lid.position.y = 1.96;
coffin.add(lid);

const velvet = new THREE.Mesh(
  new THREE.BoxGeometry(3.05, .07, 1.2),
  red
);
velvet.position.y = 2.09;
coffin.add(velvet);

for (const z of [-.5, .5]) {
  const bar = new THREE.Mesh(
    new THREE.CylinderGeometry(.07, .07, 4.4, 12),
    gold
  );
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, 1.55, z);
  parade.add(bar);
}

// KARAKTER İSİM ETİKETİ
function label(name) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(10,7,12,.82)';
  ctx.roundRect(6, 6, 500, 116, 24);
  ctx.fill();

  ctx.strokeStyle = '#d9bb83';
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.font = 'bold 42px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff0dc';
  ctx.fillText(String(name).slice(0, 22), 256, 65);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      depthTest: false
    })
  );

  sprite.scale.set(2.1, .52, 1);
  sprite.position.y = 2.85;

  return sprite;
}

// İNSAN KARAKTERİ
function person(name, gender = 'male', avatar = null) {
  const p = new THREE.Group();

  const coat = mat(gender === 'female' ? 0x392532 : 0x242630);
  const skin = mat(0xb98268);
  const pants = mat(0x17171d);

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(.29, .72, 5, 10),
    coat
  );
  body.position.y = 1.35;
  p.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(.22, 18, 14),
    skin
  );
  head.position.y = 2.05;
  p.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(.23, 16, 12),
    mat(gender === 'female' ? 0x24151b : 0x141318)
  );
  hair.scale.y = .65;
  hair.position.set(0, 2.17, -.02);
  p.add(hair);

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
    p.add(arm);
    arms.push(arm);

    const leg = new THREE.Group();
    leg.position.set(side * .14, .92, 0);

    const legMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(.115, .48, 4, 8),
      pants
    );
    legMesh.position.y = -.27;
    leg.add(legMesh);

    const shoe = new THREE.Mesh(
      new THREE.BoxGeometry(.2, .12, .34),
      mat(0x100f13)
    );
    shoe.position.set(0, -.54, .1);
    leg.add(shoe);

    p.add(leg);
    legs.push(leg);
  }

  p.add(label(name));

  p.userData = {
    name,
    arms,
    legs,
    phase: Math.random() * 6.28
  };

  // TikTok profil fotoğrafı mevcutsa karakterin yüzünde göster
  if (avatar) {
    new THREE.TextureLoader().load(
      avatar,
      texture => {
        texture.colorSpace = THREE.SRGBColorSpace;

        const face = new THREE.Mesh(
          new THREE.CircleGeometry(.18, 24),
          new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
          })
        );

        face.position.set(0, 2.05, .205);
        p.add(face);
      },
      undefined,
      () => {}
    );
  }

  p.traverse(obj => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return p;
}

// TABUT TAŞIYICILARI
const carriers = [];

for (const [x, z] of [
  [-2, .5],
  [2, .5],
  [-2, -.5],
  [2, -.5]
]) {
  const carrier = person('TAŞIYICI');
  carrier.position.set(x, 0, z);
  parade.add(carrier);
  carriers.push(carrier);
}

// YAS TUTANLAR
const crowd = [];

for (let i = 0; i < 20; i++) {
  const mourner = person(
    'YAS TUTAN',
    i % 3 === 0 ? 'female' : 'male'
  );

  mourner.position.set(
    (i % 2 ? 1 : -1) * (3.5 + Math.random()),
    0,
    -5 - Math.random() * 30
  );

  mourner.userData.walk = false;
  scene.add(mourner);
  crowd.push(mourner);
}

// OYUNCULAR
const players = new Map();
const genderChoice = new Map();

let gameStarted = false;
let paused = false;
let elapsed = 0;
let stage = 0;
let sound = true;

function say(text, kind = 'female') {
  if (sound) voice(text, kind);
}

function log(text) {
  const activity = $('activity');
  if (!activity) return;

  const p = document.createElement('p');
  p.textContent = text;
  activity.prepend(p);

  while (activity.children.length > 6) {
    activity.lastChild.remove();
  }
}

function update() {
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

function join(name, gender, avatar) {
  if (players.has(name)) return;

  const character = person(name, gender, avatar);
  const n = players.size;

  character.position.set(
    (n % 2 ? 1 : -1) * (3.3 + (n % 3) * .6),
    0,
    4 + Math.floor(n / 2) * 1.3
  );

  scene.add(character);
  players.set(name, character);

  log(`${name} korteje katıldı.`);
  update();
}

// TIKTOK YORUM KOMUTLARI
function command(text, name = 'Misafir', avatar = null) {
  const c = String(text || '').trim().toLocaleUpperCase('tr-TR');

  if (c === 'KADIN' || c === 'ERKEK') {
    genderChoice.set(name, c === 'KADIN' ? 'female' : 'male');
    log(`${name}: ${c} karakter seçti.`);
    return;
  }

  if (c === 'KATIL') {
    join(name, genderChoice.get(name) || 'male', avatar);
    return;
  }

  if (c === 'TASIMA') {
    if (!players.has(name)) {
      join(name, genderChoice.get(name) || 'male', avatar);
    }
    log(`${name} taşıma isteği gönderdi.`);
    return;
  }

  if (c === 'DUA' || c === 'AGLA') {
    log(`${name}: ${c}`);
    return;
  }

  if (c === 'UYAN') {
    say('Bihter uyan!', 'bihter');
    log(`${name}: UYAN`);
    return;
  }

  if (c === 'GEL') {
    say('Herkes cenazeye gelsin.', 'male');
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
    return;
  }

  if (c === 'BEHLUL' || c === 'BEHLÜL' || c === 'EZEL') {
    say(c, c.startsWith('EZEL') ? 'ezel' : 'behlul');
    log(`${name}: ${c}`);
  }
}

// TIKTOK SUNUCU BAĞLANTISI
function connect() {
  fetch(`${API}/api/status`)
    .then(r => r.json())
    .then(status => {
      if ($('liveStatus')) {
        $('liveStatus').textContent = status.connected
          ? 'TIKTOK BAĞLI'
          : 'SUNUCU AÇIK · YAYIN BEKLENİYOR';
      }
    })
    .catch(() => {
      if ($('liveStatus')) {
        $('liveStatus').textContent = 'SUNUCUYA ULAŞILAMIYOR';
      }
    });

  const events = new EventSource(`${API}/api/stream`);

  events.onmessage = event => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'comment') {
        command(data.comment, data.user, data.avatar);
      }

      if (data.type === 'gift') {
        log(`${data.user} ${data.gift} gönderdi`);
        giftSound();
        say(`${data.user} hediye gönderdi`, 'male');
      }
    } catch (error) {
      console.warn(error);
    }
  };

  events.onerror = () => {
    if ($('liveStatus')) {
      $('liveStatus').textContent = 'BAĞLANTI YENİDEN DENENİYOR';
    }
  };
}

connect();
wireAudioUI();

// PROVA KOMUTLARI
document.querySelectorAll('[data-command]').forEach(button => {
  button.addEventListener('click', () => {
    command(button.dataset.command, 'PROVA');
  });
});

// OYUNU BAŞLAT
$('startGame')?.addEventListener('click', () => {
  gameStarted = true;
  paused = false;
  elapsed = 0;

  log('PROVA BİTTİ · OYUN BAŞLADI');

  startAmbience();
  say('Bihter’in son yolculuğu başlıyor.', 'male');
});

// SES DÜĞMESİNİN kontrolü audio.js dosyasındadır.
// Buraya ikinci bir ses düğmesi olayı eklemeyin.

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), .05);
  const t = clock.elapsedTime;

  // YAĞMUR HAREKETİ
  const rainAttribute = rain.geometry.attributes.position;

  for (let i = 0; i < N; i++) {
    rainAttribute.array[i * 3 + 1] -= dt * 17;

    if (rainAttribute.array[i * 3 + 1] < 0) {
      rainAttribute.array[i * 3 + 1] = 23;
    }
  }

  rainAttribute.needsUpdate = true;

  // CENAZE ALAYININ İLERLEMESİ
  if (gameStarted && !paused) {
    elapsed += dt;

    parade.position.z = -Math.min(elapsed * .72, 72);

    if (elapsed < 16) {
      stage = 1;
    } else if (elapsed < 48) {
      stage = 2;
    } else if (elapsed < 65) {
      stage = 3;
    } else {
      stage = 4;
    }

    camera.position.z = 20 + parade.position.z * .32;
    controls.target.z = parade.position.z * .32;
  }

  // KARAKTER YÜRÜYÜŞ ANİMASYONU
  [
    ...carriers,
    ...crowd,
    ...players.values()
  ].forEach(character => {
    const data = character.userData;
    const phase = t * 5 + data.phase;

    data.legs.forEach((leg, i) => {
      leg.rotation.x =
        gameStarted && !paused && data.walk !== false
          ? Math.sin(phase + i * Math.PI) * .48
          : 0;
    });

    data.arms.forEach((arm, i) => {
      arm.rotation.x =
        gameStarted && !paused
          ? -.12 + Math.sin(phase + i * Math.PI) * .2
          : 0;
    });

    if (gameStarted && !paused && players.has(data.name)) {
      character.position.z -= dt * .72;
    }
  });

  // TABUT HAFİFÇE HAREKET EDER
  coffin.position.y = 1.55 + Math.sin(t * 5) * .025;
  coffin.rotation.z = Math.sin(t * 2) * .008;

  // SAHNE İLERLEME GÖSTERGESİ
  document.querySelectorAll('.route-stage').forEach((element, i) => {
    element.classList.toggle('active', i <= stage);
  });

  if ($('routeProgress')) {
    $('routeProgress').style.width = (stage * 25) + '%';
  }

  update();
  controls.update();
  renderer.render(scene, camera);
}

animate();

// EKRAN BOYUTU DEĞİŞİNCE
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});
