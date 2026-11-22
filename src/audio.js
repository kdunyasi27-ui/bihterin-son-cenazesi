
let ctx, master, bus = {}, running = false, timers = [];

const levels = {
  rain: 0.24,
  wind: 0.13,
  steps: 0.18,
  coffin: 0.12,
  music: 0.10
};

function init() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(ctx.destination);

    Object.keys(levels).forEach(k => {
      bus[k] = ctx.createGain();
      bus[k].gain.value = levels[k];
      bus[k].connect(master);
    });
  }

  if (ctx.state === 'suspended') ctx.resume();
}

function noise(channel, filter, hz, volume) {
  const buffer = ctx.createBuffer(
    1, ctx.sampleRate * 2, ctx.sampleRate
  );

  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  const lowpass = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = buffer;
  source.loop = true;
  lowpass.type = filter;
  lowpass.frequency.value = hz;
  gain.gain.value = volume;

  source.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(bus[channel]);
  source.start();
}

function beep(channel, frequency, duration, wave = 'sine', volume = 0.1, end = null) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = wave;
  osc.frequency.setValueAtTime(frequency, now);

  if (end) {
    osc.frequency.exponentialRampToValueAtTime(end, now + duration);
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(bus[channel]);

  osc.start();
  osc.stop(now + duration + 0.03);
}

export function startAmbience() {
  init();
  if (running) return;

  running = true;

  noise('rain', 'lowpass', 1500, 0.3);
  noise('wind', 'lowpass', 380, 0.14);

  [110, 164.8, 220].forEach(freq => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.014;

    osc.connect(gain);
    gain.connect(bus.music);
    osc.start();
  });

  const step = () => {
    if (!running) return;

    beep('steps', 85, 0.1, 'triangle', 0.12, 52);

    timers.push(setTimeout(() => {
      beep('steps', 65, 0.1, 'triangle', 0.1, 45);
    }, 350));

    timers.push(setTimeout(step, 1700));
  };

  const creak = () => {
    if (!running) return;

    beep('coffin', 230, 0.35, 'sawtooth', 0.035, 90);
    timers.push(setTimeout(creak, 8000));
  };

  timers.push(setTimeout(step, 500));
  timers.push(setTimeout(creak, 2500));
}

export function stopAmbience() {
  running = false;
  timers.forEach(clearTimeout);
  timers = [];
}

export function setVolume(channel, value) {
  init();

  if (bus[channel]) {
    bus[channel].gain.value = Math.max(0, Math.min(1, value));
  }
}

export function giftSound() {
  init();
  beep('music', 880, 0.16, 'sine', 0.18);

  setTimeout(() => {
    beep('music', 1175, 0.22, 'sine', 0.14);
  }, 100);
}

export function voice(text, kind = 'female') {
  init();

  if (!('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'tr-TR';

  utterance.rate = kind === 'bihter' ? 0.82 : 0.94;

  utterance.pitch =
    kind === 'female' ? 1.35 :
    kind === 'behlul' ? 0.82 :
    kind === 'ezel' ? 0.72 :
    kind === 'bihter' ? 0.92 : 1;

  const turkishVoice = speechSynthesis
    .getVoices()
    .find(v => v.lang?.toLowerCase().startsWith('tr'));

  if (turkishVoice) utterance.voice = turkishVoice;

  speechSynthesis.speak(utterance);
}

export function wireAudioUI() {
  document.addEventListener(
    'pointerdown',
    () => startAmbience(),
    { once: true }
  );

  const button = document.getElementById('soundToggle');

  if (button) {
    button.addEventListener('click', () => {
      if (running) {
        stopAmbience();
        button.textContent = 'SESİ AÇ';
      } else {
        startAmbience();
        button.textContent = 'SES AÇIK';
      }
    });
  }

  document.querySelectorAll('[data-volume]').forEach(input => {
    input.addEventListener('input', () => {
      setVolume(input.dataset.volume, input.value / 100);
    });
  });

  const masterSlider = document.getElementById('masterVolume');

  if (masterSlider) {
    masterSlider.addEventListener('input', () => {
      init();
      master.gain.value = masterSlider.value / 100;
    });
  }
}
