// ======================================================
//          ملف game.js الجديد بالكامل
// ======================================================

const dropZonesContainer = document.getElementById('drop-zones');
const activeCardContainer = document.getElementById('active-card');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');

// متغيرات اللعبة
let remainingCards = [...gameCards].sort((a, b) => 0.5 - Math.random()); // نلخبط الكروت في الأول
let activeCard = null;
let score = 0;
let lives = 5;

// **المتغير الأهم: ده هو الخط الزمني اللي هيتبني تحت**
// هنستخدم null لتمثيل الـ drop-zone الفاضي
let timeline = [];

// دالة لتحديث الأرقام على الشاشة
function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
  livesDisplay.textContent = `Lives: ${lives}`;
}

// دالة لإنشاء عنصر الكارت
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

// **دالة جديدة لرسم الخط الزمني تحت**
function redrawTimeline() {
  dropZonesContainer.innerHTML = ''; // نفضي المكان كل مرة

  timeline.forEach((item, index) => {
    if (item === null) {
      // لو المكان فاضي (null)، ارسم drop-zone
      const zone = document.createElement('div');
      zone.className = 'drop-zone';
      zone.dataset.index = index;
      zone.addEventListener('dragover', (e) => e.preventDefault());
      zone.addEventListener('drop', () => handleCardDrop(index));
      dropZonesContainer.appendChild(zone);
    } else {
      // لو المكان فيه كارت، ارسم الكارت
      const cardEl = createCardElement(item, false); // false عشان ميتسحبش تاني
      dropZonesContainer.appendChild(cardEl);
    }
  });
}

// دالة لإظهار الكارت التالي القابل للعب
function showNextCard() {
  if (remainingCards.length === 0 || lives <= 0) {
    endGame();
    return;
  }
  activeCardContainer.innerHTML = '';
  activeCard = remainingCards.shift();
  const cardEl = createCardElement(activeCard, true);
  activeCardContainer.appendChild(cardEl);
}

// **دالة جديدة تماماً للتعامل مع رمي الكارت**
function handleCardDrop(dropIndex) {
  // 1. تحديد الكارت السابق والتالي لمكان الرمي عشان نعرف الترتيب صح ولا غلط
  let prevCard = null;
  for (let i = dropIndex - 1; i >= 0; i--) {
    if (timeline[i] !== null) {
      prevCard = timeline[i];
      break;
    }
  }

  let nextCard = null;
  for (let i = dropIndex + 1; i < timeline.length; i++) {
    if (timeline[i] !== null) {
      nextCard = timeline[i];
      break;
    }
  }

  // 2. التحقق من صحة الترتيب
  const isAfterPrev = prevCard ? activeCard.year > prevCard.year : true;
  const isBeforeNext = nextCard ? activeCard.year < nextCard.year : true;

  if (isAfterPrev && isBeforeNext) {
    score++;
  } else {
    lives--;
  }
  
  // 3. ضع الكارت في مكانه في الخط الزمني السفلي
  timeline[dropIndex] = activeCard;

  // 4. ضيف أماكن لعب جديدة على الأطراف
  if (timeline[0] !== null) {
      timeline.unshift(null);
  }
  if (timeline[timeline.length - 1] !== null) {
      timeline.push(null);
  }

  // 5. أعد رسم الخط الزمني بالكامل وأظهر الكارت التالي
  redrawTimeline();
  updateScore();
  showNextCard();
}

// دالة نهاية اللعبة
function endGame() {
  document.querySelector('.game-container').style.display = 'none';
  document.getElementById('leaderboard').style.display = 'block';
  document.getElementById('final-score').textContent = score;
  // (ممكن تضيف هنا كود حفظ النتيجة لو حبيت)
}

// دالة إعادة تشغيل اللعبة
function restartGame() {
    // إعادة كل شيء لوضعه الأصلي
    remainingCards = [...gameCards].sort((a, b) => 0.5 - Math.random());
    score = 0;
    lives = 5;
    document.getElementById('leaderboard').style.display = 'none';
    document.querySelector('.game-container').style.display = 'flex';
    startGame();
}

// دالة بدء اللعبة
function startGame() {
  // نبدأ الخط الزمني السفلي بأول كارت من الكروت الباقية ومكانين فاضيين حواليه
  const firstCard = remainingCards.shift();
  timeline = [null, firstCard, null]; // [مكان فاضي, كارت, مكان فاضي]
  
  redrawTimeline();
  updateScore();
  showNextCard();
}

// ابدأ اللعبة عند تحميل الصفحة
window.onload = startGame;