const imageInput = document.querySelector('#imageInput');
const dropZone = document.querySelector('#dropZone');
const previewCanvas = document.querySelector('#previewCanvas');
const emptyState = document.querySelector('#emptyState');
const analyzeButton = document.querySelector('#analyzeButton');
const resetButton = document.querySelector('#resetButton');
const resultEmpty = document.querySelector('#resultEmpty');
const resultContent = document.querySelector('#resultContent');
const animalMark = document.querySelector('#animalMark');
const animalName = document.querySelector('#animalName');
const matchScore = document.querySelector('#matchScore');
const animalDescription = document.querySelector('#animalDescription');
const traits = document.querySelector('#traits');
const meters = document.querySelector('#meters');
const copyButton = document.querySelector('#copyButton');

const ctx = previewCanvas.getContext('2d', { willReadFrequently: true });
let loadedImage = null;
let lastResult = null;

const ANIMALS = [
  {
    key: 'cat',
    short: 'CAT',
    name: '고양이상',
    traits: ['도도한 분위기', '선명한 인상', '차분한 매력'],
    description: '또렷하고 정돈된 인상이 강하게 잡힙니다. 첫인상은 시크하지만 가까이 볼수록 섬세한 분위기가 살아나는 타입입니다.',
    weights: { contrast: 0.3, symmetry: 0.2, brightness: -0.12, warmth: -0.08, focus: 0.24, softness: -0.14 }
  },
  {
    key: 'dog',
    short: 'DOG',
    name: '강아지상',
    traits: ['밝은 에너지', '친근한 인상', '부드러운 미소'],
    description: '전체적으로 밝고 편안한 느낌이 큽니다. 다가가기 쉬운 인상과 따뜻한 분위기가 장점으로 보이는 타입입니다.',
    weights: { contrast: -0.05, symmetry: 0.12, brightness: 0.3, warmth: 0.24, focus: -0.04, softness: 0.18 }
  },
  {
    key: 'fox',
    short: 'FOX',
    name: '여우상',
    traits: ['날렵한 이미지', '세련된 분위기', '강한 존재감'],
    description: '대비와 윤곽감이 살아 있어 날렵하고 세련된 인상이 돋보입니다. 분위기를 빠르게 각인시키는 타입입니다.',
    weights: { contrast: 0.32, symmetry: -0.02, brightness: -0.06, warmth: 0.12, focus: 0.3, softness: -0.2 }
  },
  {
    key: 'deer',
    short: 'DEER',
    name: '사슴상',
    traits: ['맑은 인상', '단정한 분위기', '깨끗한 이미지'],
    description: '밝기와 균형감이 좋아 맑고 단정한 인상이 납니다. 과하지 않고 깨끗한 분위기가 강점인 타입입니다.',
    weights: { contrast: -0.08, symmetry: 0.32, brightness: 0.22, warmth: -0.02, focus: 0.1, softness: 0.12 }
  },
  {
    key: 'rabbit',
    short: 'RAB',
    name: '토끼상',
    traits: ['귀여운 인상', '부드러운 분위기', '밝은 생기'],
    description: '밝고 부드러운 톤이 두드러져 귀엽고 산뜻한 느낌이 납니다. 표정이 편안할수록 매력이 크게 살아나는 타입입니다.',
    weights: { contrast: -0.2, symmetry: 0.06, brightness: 0.34, warmth: 0.08, focus: -0.12, softness: 0.28 }
  },
  {
    key: 'bear',
    short: 'BEAR',
    name: '곰상',
    traits: ['든든한 인상', '온화한 분위기', '안정감'],
    description: '전체 톤이 차분하고 안정적으로 느껴집니다. 강한 자극보다 편안하고 묵직한 신뢰감을 주는 타입입니다.',
    weights: { contrast: -0.12, symmetry: 0.18, brightness: -0.18, warmth: 0.2, focus: -0.08, softness: 0.26 }
  }
];

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function normalize(value, min, max) {
  return clamp((value - min) / (max - min));
}

function clearCanvas() {
  ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
}

function drawImageToCanvas(img) {
  const size = previewCanvas.width;
  const scale = Math.max(size / img.width, size / img.height);
  const width = img.width * scale;
  const height = img.height * scale;
  const x = (size - width) / 2;
  const y = (size - height) / 2;

  clearCanvas();
  ctx.drawImage(img, x, y, width, height);
}

function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('이미지 파일을 선택해 주세요');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      loadedImage = img;
      drawImageToCanvas(img);
      emptyState.classList.add('hidden');
      analyzeButton.disabled = false;
      resetButton.disabled = false;
      hideResult();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function getFeatures() {
  const { width, height } = previewCanvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let total = 0;
  let brightness = 0;
  let warmth = 0;
  let saturation = 0;
  let edge = 0;
  let softness = 0;
  let leftLum = 0;
  let rightLum = 0;
  let centerLum = 0;
  let outerLum = 0;
  let previousLum = null;

  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const dx = Math.abs(x / width - 0.5);
      const dy = Math.abs(y / height - 0.5);
      const inCenter = dx < 0.25 && dy < 0.34;

      brightness += lum;
      warmth += (r - b + 255) / 510;
      saturation += max === 0 ? 0 : (max - min) / max;
      if (previousLum !== null) edge += Math.abs(lum - previousLum);
      previousLum = lum;

      if (x < width / 2) leftLum += lum;
      else rightLum += lum;

      if (inCenter) centerLum += lum;
      else outerLum += lum;

      total += 1;
    }
  }

  const avgBrightness = brightness / total;
  const avgWarmth = warmth / total;
  const avgSaturation = saturation / total;
  const avgEdge = edge / total;
  const symmetry = 1 - normalize(Math.abs(leftLum - rightLum), 0, total * 0.06);
  const focus = normalize(centerLum / Math.max(outerLum, 1), 0.28, 0.55);

  softness = 1 - normalize(avgEdge, 0.025, 0.13);

  return {
    brightness: normalize(avgBrightness, 0.28, 0.78),
    warmth: normalize(avgWarmth, 0.42, 0.62),
    contrast: normalize(avgSaturation + avgEdge * 3, 0.18, 0.72),
    symmetry: clamp(symmetry),
    focus: clamp(focus),
    softness: clamp(softness)
  };
}

function scoreAnimal(animal, features) {
  let score = 0.54;
  Object.entries(animal.weights).forEach(([feature, weight]) => {
    score += (features[feature] - 0.5) * weight;
  });

  const imageSeed = Math.sin(
    features.brightness * 12.9898 +
    features.warmth * 78.233 +
    features.contrast * 37.719
  ) * 0.035;

  return clamp(score + imageSeed, 0.18, 0.97);
}

function analyze() {
  if (!loadedImage) return;

  const features = getFeatures();
  const ranked = ANIMALS.map((animal) => ({
    ...animal,
    score: scoreAnimal(animal, features)
  })).sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const adjustedTopScore = Math.max(top.score, ranked[1].score + 0.04);
  lastResult = { ...top, score: clamp(adjustedTopScore), ranked };
  renderResult(lastResult);
}

function renderResult(result) {
  resultEmpty.hidden = true;
  resultContent.hidden = false;
  animalMark.textContent = result.short;
  animalName.textContent = result.name;
  matchScore.textContent = `${Math.round(result.score * 100)}% match`;
  animalDescription.textContent = result.description;

  traits.innerHTML = '';
  result.traits.forEach((trait) => {
    const chip = document.createElement('span');
    chip.className = 'trait';
    chip.textContent = trait;
    traits.appendChild(chip);
  });

  meters.innerHTML = '';
  result.ranked.slice(0, 4).forEach((animal) => {
    const row = document.createElement('div');
    row.className = 'meter-row';
    const percent = Math.round(animal.score * 100);
    row.innerHTML = `
      <div class="meter-label"><span>${animal.name}</span><span>${percent}%</span></div>
      <div class="meter-track"><div class="meter-fill" style="width: ${percent}%"></div></div>
    `;
    meters.appendChild(row);
  });
}

function hideResult() {
  lastResult = null;
  resultEmpty.hidden = false;
  resultContent.hidden = true;
}

function reset() {
  loadedImage = null;
  imageInput.value = '';
  clearCanvas();
  emptyState.classList.remove('hidden');
  analyzeButton.disabled = true;
  resetButton.disabled = true;
  hideResult();
}

async function copyResult() {
  if (!lastResult) return;

  const text = `내 얼굴 동물상은 ${lastResult.name}! ${Math.round(lastResult.score * 100)}% 매치. ${lastResult.traits.join(', ')}`;
  try {
    await navigator.clipboard.writeText(text);
    showToast('결과를 복사했습니다');
  } catch {
    showToast('복사 권한을 확인해 주세요');
  }
}

function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 1800);
}

imageInput.addEventListener('change', (event) => loadFile(event.target.files[0]));
analyzeButton.addEventListener('click', analyze);
resetButton.addEventListener('click', reset);
copyButton.addEventListener('click', copyResult);

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.classList.add('dragging');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragging');
});

dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragging');
  loadFile(event.dataTransfer.files[0]);
});
