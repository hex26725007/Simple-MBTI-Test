import { QUESTIONS, DIMENSIONS, DESCRIPTIONS } from './data.js';

const startSection = document.getElementById('start');
const testCard = document.getElementById('test');
const startBtn = document.getElementById('start-btn');
const quizSection = document.getElementById('quiz');
const resultSection = document.getElementById('result');
const progressText = document.getElementById('progress-text');
const barFill = document.getElementById('bar-fill');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const resultType = document.getElementById('result-type');
const resultDesc = document.getElementById('result-desc');
const dimensionsEl = document.getElementById('dimensions');
const restartBtn = document.getElementById('restart');
const backBtn = document.getElementById('back-btn');

let current = 0;
let scores = {};
let history = [];

function resetScores() {
  scores = {};
  DIMENSIONS.flat().forEach(letter => { scores[letter] = 0; });
}

function createOption(option, letter) {
  const btn = document.createElement('button');
  btn.className = 'option';

  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = letter;

  const text = document.createElement('span');
  text.textContent = option.text;

  btn.append(label, text);
  btn.addEventListener('click', () => choose(option));
  return btn;
}

function optionScore(option) {
  return option.score ?? 1;
}

function dimensionPercents() {
  return DIMENSIONS.map(([left, right]) => {
    const leftScore = scores[left];
    const rightScore = scores[right];
    const total = leftScore + rightScore;
    const leftPct = total === 0 ? 50 : Math.round((leftScore / total) * 100);
    return { left, right, leftPct, rightPct: 100 - leftPct };
  });
}

function renderDimensions() {
  dimensionsEl.replaceChildren(
    ...dimensionPercents().map(({ left, right, leftPct, rightPct }) => {
      const row = document.createElement('div');
      row.className = 'dim-row';

      const meta = document.createElement('div');
      meta.className = 'dim-meta';

      const leftSide = document.createElement('div');
      leftSide.className = 'dim-side dim-side-left';
      const leftLetter = document.createElement('span');
      leftLetter.className = 'dim-letter';
      leftLetter.textContent = left;
      const leftPctEl = document.createElement('span');
      leftPctEl.className = 'dim-pct';
      leftPctEl.textContent = `${leftPct}%`;
      leftSide.append(leftLetter, leftPctEl);

      const rightSide = document.createElement('div');
      rightSide.className = 'dim-side dim-side-right';
      const rightPctEl = document.createElement('span');
      rightPctEl.className = 'dim-pct';
      rightPctEl.textContent = `${rightPct}%`;
      const rightLetter = document.createElement('span');
      rightLetter.className = 'dim-letter';
      rightLetter.textContent = right;
      rightSide.append(rightPctEl, rightLetter);

      meta.append(leftSide, rightSide);

      const track = document.createElement('div');
      track.className = 'dim-track';
      track.setAttribute('role', 'presentation');

      const leftSeg = document.createElement('div');
      leftSeg.className = 'dim-seg dim-seg-left';
      leftSeg.style.width = `${leftPct}%`;

      const rightSeg = document.createElement('div');
      rightSeg.className = 'dim-seg dim-seg-right';
      rightSeg.style.width = `${rightPct}%`;

      track.append(leftSeg, rightSeg);
      row.append(meta, track);
      return row;
    })
  );
}

function renderQuestion() {
  const total = QUESTIONS.length;
  const item = QUESTIONS[current];

  progressText.textContent = `第 ${current + 1} / ${total} 题`;
  barFill.style.width = `${(current / total) * 100}%`;
  questionEl.textContent = item.q;

  optionsEl.replaceChildren(
    createOption(item.a, 'A'),
    createOption(item.b, 'B')
  );

  backBtn.hidden = current === 0;

  quizSection.classList.remove('fade-in');
  void quizSection.offsetWidth;
  quizSection.classList.add('fade-in');
}

function goBack() {
  if (history.length === 0) return;

  const last = history.pop();
  scores[last.dim] -= last.score;
  current = history.length;
  renderQuestion();
}

function choose(option) {
  const dim = option.dim;
  const score = optionScore(option);

  history.push({ dim, score });
  scores[dim] += score;
  current += 1;

  if (current < QUESTIONS.length) {
    renderQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  const type = DIMENSIONS.map(([first, second]) => (
    scores[first] >= scores[second] ? first : second
  )).join('');

  barFill.style.width = '100%';
  resultType.textContent = type;
  resultDesc.textContent = DESCRIPTIONS[type] ?? '暂无该类型的详细说明。';
  renderDimensions();

  quizSection.hidden = true;
  resultSection.hidden = false;
  resultSection.classList.remove('fade-in');
  void resultSection.offsetWidth;
  resultSection.classList.add('fade-in');
}

function showStart() {
  startSection.hidden = false;
  testCard.hidden = true;
}

function begin() {
  current = 0;
  history = [];
  resetScores();
  resultSection.hidden = true;
  quizSection.hidden = false;
  startSection.hidden = true;
  testCard.hidden = false;
  renderQuestion();
}

startBtn.addEventListener('click', begin);
backBtn.addEventListener('click', goBack);
restartBtn.addEventListener('click', showStart);
showStart();
