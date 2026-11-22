
let audioContext = null;
let master = null;
let channels = {};

let running = false;
let musicTimer = null;
let stepTimer = null;
let rainTimer = null;
let windTimer = null;
let coffinTimer = null;

let musicIndex = 0;
let activeSources = new Set();

const volumes = {
  rain: 0.24,
  wind: 0.13,
  steps: 0.18,
  coffin: 0.12,
  music: 0.10
};

const melody = [
  220, 196, 174.61, 196,
  164.81, 174.61, 196, 146.83
];

function initAudio() {
  if (audioContext) {
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return;
  }

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  audioContext = new AudioContextClass();

  master = audioContext.createGain();
  master.gain.value = 0.8;
  master.connect(audioContext.destination);

  for (const [name, value] of Object.entries(volumes)) {
    const gain = audioContext.createGain();
    gain.gain.value = value;
    gain.connect(master);
    channels[name] = gain;
  }
}

function trackSource(source) {
  activeSources.add(source);

  source.addEventListener('ended', () => {
    activeSources.delete(source);
  }, { once: true });

  return source;
}

function tone(
  frequency,
  duration,
  channel,
  type = 'sine',
  volume = 0.15
) {
  if (!audioContext || !channels[channel]) return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(
    frequency,
    audioContext.currentTime
  );

  gain.gain.setValueAtTime(
    0.0001,
    audioContext.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    Math.max(volume, 0.001),
    audioContext.currentTime + 0.04
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audioContext.currentTime + duration
  );

  oscillator.connect(gain);
  gain.connect(channels[channel]);

  trackSource(oscillator);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration + 0.05);
}

function noise(channel, volume, duration, filterFrequency) {
  if (!audioContext || !channels[channel]) return;

  const length = Math.floor(
    audioContext.sampleRate * duration
  );

  const buffer = audioContext.createBuffer(
    1,
    length,
    audioContext.sampleRate
  );

  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  source.buffer = buffer;

  filter.type = 'lowpass';
  filter.frequency.value = filterFrequency;

  gain.gain.value = volume;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(channels[channel]);

  trackSource(source);
  source.start();
}

function rainSound() {
  noise('rain', 0.12, 3, 1800);
}

function windSound() {
  noise('wind', 0.07, 4, 400);
}

function footstepSound() {
  tone(
    65 + Math.random() * 18,
    0.12,
    'steps',
    'triangle',
    0.18
  );
}

function coffinSound() {
  tone(90, 0.35, 'coffin', 'sawtooth', 0.08);
  tone(125, 0.22, 'coffin', 'triangle', 0.06);
}

function playMusicNote() {
  if (!audioContext || !running) return;

  const frequency = melody[musicIndex % melody.length];
  musicIndex++;

  tone(frequency, 2.2, 'music', 'sine', 0.15);
  tone(frequency * 1.5, 1.5, 'music', 'triangle', 0.035);
}

function startAmbience() {
  initAudio();

  if (!audioContext || running) return;

  running = true;

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  rainSound();
  windSound();

  musicTimer = setInterval(playMusicNote, 1800);
  stepTimer = setInterval(footstepSound, 550);
  rainTimer = setInterval(rainSound, 2400);
  windTimer = setInterval(windSound, 3500);

  coffinTimer = setInterval(() => {
    if (Math.random() > 0.65) {
      coffinSound();
    }
  }, 2800);
}

function stopAmbience() {
  if (!running) return;

  running = false;

  clearInterval(musicTimer);
  clearInterval(stepTimer);
  clearInterval(rainTimer);
  clearInterval(windTimer);
  clearInterval(coffinTimer);

  musicTimer = null;
  stepTimer = null;
  rainTimer = null;
  windTimer = null;
  coffinTimer = null;

  if (!audioContext) return;

  const now = audioContext.currentTime;

  Object.entries(channels).forEach(([name, channel]) => {
    channel.gain.cancelScheduledValues(now);
    channel.gain.setTargetAtTime(0, now, 0.04);
  });

  // Çalan ses kaynaklarını kapat
  activeSources.forEach(source => {
    try {
      source.stop();
    } catch (_) {}
  });

  activeSources.clear();
}

function resumeAmbience() {
  initAudio();

  if (!audioContext) return;

  Object.entries(channels).forEach(([name, channel]) => {
    channel.gain.cancelScheduledValues(audioContext.currentTime);
    channel.gain.setTargetAtTime(
      volumes[name],
      audioContext.currentTime,
      0.08
    );
  });

  running = false;
  startAmbience();
}

// KONUŞMA SESLERİ
function voice(message, character = 'female') {
  if (!('speechSynthesis' in window)) return;

  initAudio();

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'tr-TR';

  const voices = speechSynthesis.getVoices();

  const turkish = voices.find(v =>
    v.lang.toLowerCase().startsWith('tr')
  );

  if (turkish) {
    utterance.voice = turkish;
  }

  const settings = {
    female: { pitch: 1.15, rate: 0.88 },
    bihter: { pitch: 1.35, rate: 0.72 },
    behlul: { pitch: 0.82, rate: 0.91 },
    ezel: { pitch: 0.72, rate: 0.86 },
    male: { pitch: 0.85, rate: 0.9 }
  };

  const setting = settings[character] || settings.female;

  utterance.pitch = setting.pitch;
  utterance.rate = setting.rate;
  utterance.volume = 1;

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

// YAPAY AĞLAMA EFEKTİ
function cryingSound() {
  initAudio();

  if (!audioContext) return;

  tone(440, 0.35, 'music', 'sine', 0.08);

  setTimeout(() => {
    if (audioContext) {
      tone(390, 0.45, 'music', 'sine', 0.07);
    }
  }, 300);

  setTimeout(() => {
    if (audioContext) {
      tone(330, 0.55, 'music', 'sine', 0.06);
    }
  }, 650);
}

// HEDİYE SESİ
function giftSound() {
  initAudio();

  if (!audioContext) return;

  tone(660, 0.18, 'music', 'sine', 0.15);

  setTimeout(() => {
    tone(880, 0.3, 'music', 'sine', 0.15);
  }, 160);

  setTimeout(() => {
    tone(1100, 0.4, 'music', 'sine', 0.12);
  }, 330);
}

// SES KONTROLLERİ
function wireAudioUI() {
  const toggle = document.getElementById('soundToggle');

  if (toggle) {
    toggle.textContent = running ? 'SESİ KAPAT' : 'SESİ AÇ';

    toggle.addEventListener('click', () => {
      if (running) {
        stopAmbience();
        toggle.textContent = 'SESİ AÇ';

        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
        }
      } else {
        resumeAmbience();
        toggle.textContent = 'SESİ KAPAT';
      }
    });
  }

  const masterSlider = document.getElementById('masterVolume');

  if (masterSlider) {
    masterSlider.addEventListener('input', () => {
      initAudio();

      if (master) {
        master.gain.value =
          Number(masterSlider.value) / 100;
      }
    });
  }

  document.querySelectorAll('[data-volume]').forEach(slider => {
    slider.addEventListener('input', () => {
      const name = slider.dataset.volume;
      const value = Number(slider.value) / 100;

      if (!(name in volumes)) return;

      volumes[name] = value;

      if (channels[name]) {
        channels[name].gain.value = value;
      }
    });
  });
}

export {
  wireAudioUI,
  startAmbience,
  stopAmbience,
  voice,
  giftSound,
  cryingSound
};
