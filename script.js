const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

const resultsDialog = document.querySelector('#results-dialog');
const resultsGrid = document.querySelector('#results-grid');
const resultViewer = document.querySelector('#result-viewer');
const viewerImage = document.querySelector('#viewer-image');
const viewerCaption = document.querySelector('#viewer-caption');
const resultCount = 259;
let currentResult = 0;
let galleryReady = false;

const sheetColumns = 5;
const sheetRows = 4;
const resultsPerSheet = sheetColumns * sheetRows;
const resultSprite = (index) => ({
  path: `./assets/results/sheet-${String(Math.floor(index / resultsPerSheet) + 1).padStart(2, '0')}.svg`,
  column: index % sheetColumns,
  row: Math.floor((index % resultsPerSheet) / sheetColumns),
});

function applySprite(element, index) {
  const sprite = resultSprite(index);
  element.style.backgroundImage = `url('${sprite.path}')`;
  element.style.backgroundSize = `${sheetColumns * 100}% ${sheetRows * 100}%`;
  element.style.backgroundPosition = `${sprite.column * 25}% ${sprite.row * (100 / 3)}%`;
}

function buildGallery() {
  if (galleryReady) return;
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < resultCount; index += 1) {
    const button = document.createElement('button');
    button.className = 'result-thumb';
    button.type = 'button';
    button.setAttribute('aria-label', `投稿写真 ${index + 1} を拡大`);
    button.dataset.resultIndex = index;

    const image = document.createElement('span');
    image.className = 'result-sprite';
    image.setAttribute('role', 'img');
    image.setAttribute('aria-label', `買取大吉 マツゲン西浜店の投稿写真 ${index + 1}`);
    applySprite(image, index);
    button.append(image);
    fragment.append(button);
  }
  resultsGrid.append(fragment);
  galleryReady = true;
}

function showResult(index) {
  currentResult = (index + resultCount) % resultCount;
  applySprite(viewerImage, currentResult);
  viewerImage.setAttribute('aria-label', `買取大吉 マツゲン西浜店の投稿写真 ${currentResult + 1}`);
  viewerCaption.textContent = `${currentResult + 1} / ${resultCount}`;
  resultViewer.hidden = false;
  document.querySelector('[data-close-viewer]').focus();
}

function closeViewer() {
  resultViewer.hidden = true;
  viewerImage.style.backgroundImage = '';
}

document.querySelector('[data-open-results]').addEventListener('click', () => {
  buildGallery();
  resultsDialog.showModal();
});

document.querySelector('[data-close-results]').addEventListener('click', () => resultsDialog.close());
document.querySelectorAll('[data-close-viewer]').forEach((button) => button.addEventListener('click', closeViewer));
document.querySelector('[data-viewer-prev]').addEventListener('click', () => showResult(currentResult - 1));
document.querySelector('[data-viewer-next]').addEventListener('click', () => showResult(currentResult + 1));

resultsGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-result-index]');
  if (button) showResult(Number(button.dataset.resultIndex));
});

resultsDialog.addEventListener('click', (event) => {
  if (event.target === resultsDialog) resultsDialog.close();
});

resultsDialog.addEventListener('cancel', (event) => {
  if (!resultViewer.hidden) {
    event.preventDefault();
    closeViewer();
  }
});

document.addEventListener('keydown', (event) => {
  if (resultViewer.hidden) return;
  if (event.key === 'ArrowLeft') showResult(currentResult - 1);
  if (event.key === 'ArrowRight') showResult(currentResult + 1);
});
