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
const reportBox = document.querySelector('#reportBox');
const historyList = document.querySelector('#historyList');
const dailyTip = document.querySelector('#dailyTip');
const tipButton = document.querySelector('#tipButton');

const ctx = previewCanvas.getContext('2d', { willReadFrequently: true });
let loadedImage = null;
let lastResult = null;
let lastFeatures = null;

const TIPS = [
  '사진은 밝기보다 빛의 방향이 더 중요합니다. 얼굴 한쪽만 너무 어두우면 결과가 강한 인상으로 기울 수 있습니다.',
  '배경색이 강하면 전체 색감 계산에 영향을 줍니다. 단색 배경에서 다시 찍으면 결과가 더 안정적입니다.',
  '웃는 사진과 무표정 사진은 분위기가 다르게 계산됩니다. 두 장을 비교하면 자신에게 자주 나오는 이미지를 알 수 있습니다.',
  '필터가 강한 사진은 대비와 부드러움이 실제보다 과하게 계산될 수 있습니다. 원본 사진도 함께 테스트해 보세요.',
  '얼굴이 너무 작게 나오면 배경 정보가 더 많이 반영됩니다. 어깨 위 중심 구도가 가장 무난합니다.'
];

const ANIMALS = [
  { key: 'cat', short: 'CAT', name: '고양이상', traits: ['도도한 분위기', '선명한 인상', '차분한 매력'], description: '또렷하고 정돈된 인상이 강하게 잡힙니다. 첫인상은 시크하지만 가까이 볼수록 섬세한 분위기가 살아나는 타입입니다.', weights: { contrast: 0.3, symmetry: 0.2, brightness: -0.12, warmth: -0.08, focus: 0.24, softness: -0.14 } },
  { key: 'dog', short: 'DOG', name: '강아지상', traits: ['밝은 에너지', '친근한 인상', '부드러운 미소'], description: '전체적으로 밝고 편안한 느낌이 큽니다. 다가가기 쉬운 인상과 따뜻한 분위기가 장점으로 보이는 타입입니다.', weights: { contrast: -0.05, symmetry: 0.12, brightness: 0.3, warmth: 0.24, focus: -0.04, softness: 0.18 } },
  { key: 'fox', short: 'FOX', name: '여우상', traits: ['날렵한 이미지', '세련된 분위기', '강한 존재감'], description: '대비와 윤곽감이 살아 있어 날렵하고 세련된 인상이 돋보입니다. 분위기를 빠르게 각인시키는 타입입니다.', weights: { contrast: 0.32, symmetry: -0.02, brightness: -0.06, warmth: 0.12, focus: 0.3, softness: -0.2 } },
  { key: 'deer', short: 'DEER', name: '사슴상', traits: ['맑은 인상', '단정한 분위기', '깨끗한 이미지'], description: '밝기와 균형감이 좋아 맑고 단정한 인상이 납니다. 과하지 않고 깨끗한 분위기가 강점인 타입입니다.', weights: { contrast: -0.08, symmetry: 0.32, brightness: 0.22, warmth: -0.02, focus: 0.1, softness: 0.12 } },
  { key: 'rabbit', short: 'RAB', name: '토끼상', traits: ['귀여운 인상', '부드러운 분위기', '밝은 생기'], description: '밝고 부드러운 톤이 두드러져 귀엽고 산뜻한 느낌이 납니다. 표정이 편안할수록 매력이 크게 살아나는 타입입니다.', weights: { contrast: -0.2, symmetry: 0.06, brightness: 0.34, warmth: 0.08, focus: -0.12, softness: 0.28 } },
  { key: 'bear', short: 'BEAR', name: '곰상', traits: ['든든한 인상', '온화한 분위기', '안정감'], description: '전체 톤이 차분하고 안정적으로 느껴집니다. 강한 자극보다 편안하고 묵직한 신뢰감을 주는 타입입니다.', weights: { contrast: -0.12, symmetry: 0.18, brightness: -0.18, warmth: 0.2, focus: -0.08, softness: 0.26 } }
];

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function normalize(value, min, max) {
  return clamp((value - min) / (max - min));
}

function percent(value) {
  return Math.round(value * 100);
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
  const softness = 1 - normalize(avgEdge, 0.025, 0.13);

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

  const imageSeed = Math.sin(features.brightness * 12.9898 + features.warmth * 78.233 + features.contrast * 37.719) * 0.035;
  return clamp(score + imageSeed, 0.18, 0.97);
}

function analyze() {
  if (!loadedImage) return;

  const features = getFeatures();
  const ranked = ANIMALS.map((animal) => ({ ...animal, score: scoreAnimal(animal, features) })).sort((a, b) => b.score - a.score);
  const top = ranked[0];
  const adjustedTopScore = Math.max(top.score, ranked[1].score + 0.04);
  lastFeatures = features;
  lastResult = { ...top, score: clamp(adjustedTopScore), ranked };
  renderResult(lastResult, features);
  saveHistory(lastResult);
  renderHistory();
}

function renderResult(result, features) {
  resultEmpty.hidden = true;
  resultContent.hidden = false;
  animalMark.textContent = result.short;
  animalName.textContent = result.name;
  matchScore.textContent = `${percent(result.score)}% match`;
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
    const animalPercent = percent(animal.score);
    row.innerHTML = `<div class="meter-label"><span>${animal.name}</span><span>${animalPercent}%</span></div><div class="meter-track"><div class="meter-fill" style="width: ${animalPercent}%"></div></div>`;
    meters.appendChild(row);
  });

  renderReport(result, features);
}

function renderReport(result, features) {
  const runnerUp = result.ranked[1];
  const tone = features.brightness > 0.62 ? '밝고 산뜻한 톤' : features.brightness < 0.38 ? '차분하고 깊은 톤' : '균형 잡힌 자연 톤';
  const texture = features.contrast > 0.62 ? '윤곽과 대비가 선명한 편' : features.softness > 0.62 ? '부드러운 질감이 강한 편' : '선명함과 부드러움이 적당히 섞인 편';
  const balance = features.symmetry > 0.72 ? '좌우 밝기 균형이 안정적' : '조명 방향의 영향이 조금 있는 편';

  reportBox.innerHTML = `
    <h3>상세 분위기 리포트</h3>
    <p>이 사진은 ${tone}이고, ${texture}입니다. ${balance}이라서 ${result.name} 결과가 가장 높게 계산됐습니다.</p>
    <dl class="feature-list">
      <div><dt>밝기</dt><dd>${percent(features.brightness)}%</dd></div>
      <div><dt>대비</dt><dd>${percent(features.contrast)}%</dd></div>
      <div><dt>따뜻한 색감</dt><dd>${percent(features.warmth)}%</dd></div>
      <div><dt>구도 균형</dt><dd>${percent(features.symmetry)}%</dd></div>
    </dl>
    <p class="sub-result">보조 분위기는 ${runnerUp.name}입니다. 두 결과를 함께 보면 사진의 인상을 더 자연스럽게 해석할 수 있습니다.</p>
  `;
}

function hideResult() {
  lastResult = null;
  lastFeatures = null;
  resultEmpty.hidden = false;
  resultContent.hidden = true;
  if (reportBox) reportBox.innerHTML = '';
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

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('animalMatchHistory') || '[]');
  } catch {
    return [];
  }
}

function saveHistory(result) {
  const next = [{ name: result.name, score: percent(result.score), at: new Date().toLocaleDateString('ko-KR') }, ...getHistory()].slice(0, 5);
  localStorage.setItem('animalMatchHistory', JSON.stringify(next));
}

function renderHistory() {
  if (!historyList) return;
  const history = getHistory();
  if (history.length === 0) {
    historyList.textContent = '아직 저장된 결과가 없습니다.';
    return;
  }

  historyList.innerHTML = history.map((item) => `<div class="history-item"><span>${item.name}</span><strong>${item.score}%</strong><small>${item.at}</small></div>`).join('');
}

async function copyResult() {
  if (!lastResult) return;

  const featureText = lastFeatures ? ` 밝기 ${percent(lastFeatures.brightness)}%, 대비 ${percent(lastFeatures.contrast)}%.` : '';
  const text = `내 얼굴 동물상은 ${lastResult.name}! ${percent(lastResult.score)}% 매치. ${lastResult.traits.join(', ')}.${featureText}`;
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

function rotateTip() {
  if (!dailyTip) return;
  const current = TIPS.indexOf(dailyTip.textContent);
  dailyTip.textContent = TIPS[(current + 1 + TIPS.length) % TIPS.length];
}

imageInput.addEventListener('change', (event) => loadFile(event.target.files[0]));
analyzeButton.addEventListener('click', analyze);
resetButton.addEventListener('click', reset);
copyButton.addEventListener('click', copyResult);
if (tipButton) tipButton.addEventListener('click', rotateTip);

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

renderHistory();
