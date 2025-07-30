// citiesGameData.js موجود فعلاً
let placedCards = [];
let remainingCards = [...gameCards];
let activeCard = null;
let score = 0;
let lives = 5;

const placedCardsContainer = document.getElementById('placed-cards');
const dropZonesContainer = document.getElementById('drop-zones');
const activeCardContainer = document.getElementById('active-card');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');

function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
  livesDisplay.textContent = `Lives: ${lives}`;
}

function createCardElement(cardData, draggable = true) {
  const card = document.createElement('div');
  card.className = 'card';
  if (draggable) {
    card.setAttribute('draggable', true);
    card.addEventListener('dragstart', () => card.classList.add('dragging'));
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  }

  const img = document.createElement('img');
  img.src = cardData.image;
  const name = document.createElement('div');
  name.className = 'card-name';
  name.textContent = cardData.name;

  card.appendChild(img);
  card.appendChild(name);

  return card;
}

function setupDropZones() {
  dropZonesContainer.innerHTML = '';

  for (let i = 0; i <= placedCards.length; i++) {
    const zone = document.createElement('div');
    zone.className = 'drop-zone';
    zone.dataset.index = i;

    zone.addEventListener('dragover', (e) => e.preventDefault());

    zone.addEventListener('drop', () => {
      handleCardDrop(i);
    });

    dropZonesContainer.appendChild(zone);
  }
}

function showNextCard() {
  if (remainingCards.length === 0 || lives <= 0) {
    endGame();
    return;
  }

  activeCardContainer.innerHTML = '';
  setupDropZones();

  activeCard = remainingCards.shift();
  const cardEl = createCardElement(activeCard, true);
  activeCardContainer.appendChild(cardEl);
}

function handleCardDrop(dropIndex) {
  const correctIndex = placedCards.findIndex(c => activeCard.year < c.year);
  const actualIndex = correctIndex === -1 ? placedCards.length : correctIndex;

  if (dropIndex === actualIndex) {
    score++;
  } else {
    lives--;
  }

  placedCards.splice(actualIndex, 0, activeCard);
  redrawPlacedCards();
  updateScore();
  showNextCard();
}

function redrawPlacedCards() {
  placedCardsContainer.innerHTML = '';
  placedCards.forEach(card => {
    const cardEl = createCardElement(card, false); // ثابت
    placedCardsContainer.appendChild(cardEl);
  });
}

function endGame() {
  document.querySelector('.game-container').style.display = 'none';
  document.getElementById('leaderboard').style.display = 'block';
  document.getElementById('final-score').textContent = score;

  const li = document.createElement('li');
  li.textContent = `Score: ${score}`;
  document.getElementById('leaderboard-list').appendChild(li);
}

function restartGame() {
  placedCards = [];
  remainingCards = [...gameCards];
  score = 0;
  lives = 5;
  document.getElementById('leaderboard').style.display = 'none';
  document.querySelector('.game-container').style.display = 'flex';
  startGame();
}

function startGame() {
  // أول لعب، حط كارتين ثابتين
  placedCards = remainingCards.splice(0, 2);
  redrawPlacedCards();
  updateScore();
  showNextCard();
}

window.onload = startGame;
