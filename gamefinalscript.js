// Game variables
let score = 0;
let totalAttempts = 5;
let availableCities = [];
let activeCards = [];
let placedCards = [];
let totalCities = 0;
let dragScrollInterval = null;
let currentLevel = 1;
let unlockedLevels = 1;
let levelScores = {};

// DOM elements
const activeRow = document.getElementById("active-card");
const dropContainer = document.querySelector('.drop-row-container');
const dropInner = document.getElementById("drop-zones-inner");
const gameOverBoard = document.getElementById("gameoverboard");
const overlay = document.getElementById("overlay");
const finalScoreEl = document.getElementById("final-score");
const positionEl = document.getElementById("position");
const attemptsLeftEl = document.getElementById("attempts-left");

// Touch state for mobile
let touchState = {
    isDragging: false,
    draggedCard: null,
    touchStartX: 0,
    touchStartY: 0,
    currentDropZone: null,
    dragClone: null
};

// Helper functions for years
function parseYear(yearText) {
    if (typeof yearText === 'number') return yearText;
    if (yearText.includes('BCE')) {
        return -parseInt(yearText.replace('BCE', '').trim());
    }
    return parseInt(yearText.replace('CE', '').trim());
}

function formatYear(year) {
    return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
}

function compareYears(year1, year2) {
    return year1 - year2;
}

// Start new game
function startNewGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('celebration-screen').style.display = 'none';
    
    document.querySelector('.game-container').style.display = 'flex';
    document.querySelector('.instructions-container').style.display = 'flex';
    document.querySelector('.game-info').style.display = 'flex';
    
    totalAttempts = 5;
    currentLevel = 1;
    unlockedLevels = 1;
    levelScores = {};
    
    startLevel(1);
}

// Create HTML elements
function createPlacedCardHTML(name, year, imgSrc) {
    const displayYear = formatYear(year);
    return `
    <div class="card placed">
        <img src="${imgSrc}" alt="${name}">
        <div class="card-info">
            <h4>${name}</h4>
            <p>${displayYear}</p>
        </div>
    </div>`;
}

function createDropZone(index) {
    const zone = document.createElement('div');
    zone.className = 'drop-zone';
    zone.dataset.index = index;
    
    zone.addEventListener('dragover', e => e.preventDefault());
    zone.addEventListener('dragenter', () => zone.classList.add('active'));
    zone.addEventListener('dragleave', (e) => {
        if (!zone.contains(e.relatedTarget)) {
            zone.classList.remove('active');
        }
    });
    zone.addEventListener('drop', function (e) {
        zone.classList.remove('active');
        handleDrop.call(this, e);
    });
    
    return zone;
}

// Scroll functionality
function createScrollButtons() {
    const oldLeftBtn = document.querySelector('.scroll-btn-left');
    const oldRightBtn = document.querySelector('.scroll-btn-right');
    if (oldLeftBtn) oldLeftBtn.remove();
    if (oldRightBtn) oldRightBtn.remove();

    const leftBtn = document.createElement('button');
    leftBtn.className = 'scroll-btn scroll-btn-left';
    leftBtn.innerHTML = '◀';
    leftBtn.onclick = () => {
        if (dropContainer.scrollLeft <= 150) {
            scrollToStart();
        } else {
            scrollDropZone(-250);
        }
    };
    
    const rightBtn = document.createElement('button');
    rightBtn.className = 'scroll-btn scroll-btn-right';
    rightBtn.innerHTML = '▶';
    rightBtn.onclick = () => {
        if (dropContainer.scrollLeft >= (dropContainer.scrollWidth - dropContainer.clientWidth - 150)) {
            scrollToEnd();
        } else {
            scrollDropZone(250);
        }
    };
    
    const wrapper = document.querySelector('.drop-zone-wrapper');
    wrapper.appendChild(leftBtn);
    wrapper.appendChild(rightBtn);
    
    updateScrollButtons();
}

function scrollDropZone(amount) {
    dropContainer.scrollBy({
        left: amount,
        behavior: 'smooth'
    });
    setTimeout(updateScrollButtons, 300);
}

function scrollToStart() {
    dropContainer.scrollTo({
        left: 0,
        behavior: 'smooth'
    });
    setTimeout(updateScrollButtons, 300);
}

function scrollToEnd() {
    dropContainer.scrollTo({
        left: dropContainer.scrollWidth,
        behavior: 'smooth'
    });
    setTimeout(updateScrollButtons, 300);
}

function updateScrollButtons() {
    const leftBtn = document.querySelector('.scroll-btn-left');
    const rightBtn = document.querySelector('.scroll-btn-right');
    
    if (!leftBtn || !rightBtn) return;
    
    const isAtStart = dropContainer.scrollLeft <= 10;
    const isAtEnd = dropContainer.scrollLeft >= (dropContainer.scrollWidth - dropContainer.clientWidth - 10);
    
    leftBtn.style.opacity = isAtStart ? '0.4' : '1';
    leftBtn.style.cursor = isAtStart ? 'not-allowed' : 'pointer';
    
    rightBtn.style.opacity = isAtEnd ? '0.4' : '1';
    rightBtn.style.cursor = isAtEnd ? 'not-allowed' : 'pointer';
    
    const needsScroll = dropContainer.scrollWidth > dropContainer.clientWidth + 20;
    leftBtn.style.display = needsScroll ? 'flex' : 'none';
    rightBtn.style.display = needsScroll ? 'flex' : 'none';
    
    if (isAtStart) {
        leftBtn.innerHTML = '◀';
        leftBtn.title = 'At the beginning';
    } else if (dropContainer.scrollLeft <= 150) {
        leftBtn.innerHTML = '⏮';
        leftBtn.title = 'Go to start';
    } else {
        leftBtn.innerHTML = '◀';
        leftBtn.title = 'Scroll left';
    }
    
    if (isAtEnd) {
        rightBtn.innerHTML = '▶';
        rightBtn.title = 'At the end';
    } else if (dropContainer.scrollLeft >= (dropContainer.scrollWidth - dropContainer.clientWidth - 150)) {
        rightBtn.innerHTML = '⏭';
        rightBtn.title = 'Go to end';
    } else {
        rightBtn.innerHTML = '▶';
        rightBtn.title = 'Scroll right';
    }
}

// Touch support
function handleTouchStart(e, card) {
    e.preventDefault();
    touchState.isDragging = true;
    touchState.draggedCard = card;
    touchState.touchStartX = e.touches[0].clientX;
    touchState.touchStartY = e.touches[0].clientY;
    
    createDragClone(card, e.touches[0].clientX, e.touches[0].clientY);
    card.classList.add('dragging', 'touch-dragging');
    
    // لا نمنع التمرير تماماً
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
}


function handleTouchMove(e) {
    if (!touchState.isDragging || !touchState.dragClone) return;
    e.preventDefault();

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.touchStartX;
    const deltaY = touch.clientY - touchState.touchStartY;

    // حرك الكارت المنسوخ
    touchState.dragClone.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    // منطق التمرير الرأسي
    const edgeThreshold = 150;
    const scrollSpeed = 25;
    const windowHeight = window.innerHeight;
    
    // التمرير للأعلى
    if (touch.clientY < edgeThreshold) {
        window.scrollTo({
            top: window.scrollY - scrollSpeed,
            behavior: 'auto'
        });
    }
    // التمرير للأسفل
    else if (touch.clientY > windowHeight - edgeThreshold) {
        window.scrollTo({
            top: window.scrollY + scrollSpeed,
            behavior: 'auto'
        });
    }

    // تحديد الـ drop-zone
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elementBelow?.closest('.drop-zone');

    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('active');
    });

    if (dropZone) {
        dropZone.classList.add('active');
        touchState.currentDropZone = dropZone;
    } else {
        touchState.currentDropZone = null;
    }
}




function handleTouchEnd(e) {
    if (!touchState.isDragging) return;
    e.preventDefault();
    
    // لا نعيد تعيين overflow
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('active');
    });
    
    if (touchState.currentDropZone && touchState.draggedCard) {
        const dropEvent = new Event('drop');
        Object.defineProperty(dropEvent, 'preventDefault', { value: () => {} });
        
        const card = touchState.draggedCard;
        card.classList.add('dragging');
        
        handleDrop.call(touchState.currentDropZone, dropEvent);
    }
    
    cleanupTouch();
}

javascript
 Copy
 Insert
 Export

function handleTouchStart(e, card) {
    e.preventDefault();
    touchState.isDragging = true;
    touchState.draggedCard = card;
    touchState.touchStartX = e.touches[0].clientX;
    touchState.touchStartY = e.touches[0].clientY;
    
    createDragClone(card, e.touches[0].clientX, e.touches[0].clientY);
    card.classList.add('dragging', 'touch-dragging');
    
    // لا نمنع التمرير تماماً
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
}

function handleTouchMove(e) {
    if (!touchState.isDragging || !touchState.dragClone) return;
    e.preventDefault();

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.touchStartX;
    const deltaY = touch.clientY - touchState.touchStartY;

    // حرك الكارت المنسوخ
    touchState.dragClone.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    // منطق التمرير الرأسي
    const edgeThreshold = 150;
    const scrollSpeed = 25;
    const windowHeight = window.innerHeight;
    
    // التمرير للأعلى
    if (touch.clientY < edgeThreshold) {
        window.scrollTo({
            top: window.scrollY - scrollSpeed,
            behavior: 'auto'
        });
    }
    // التمرير للأسفل
    else if (touch.clientY > windowHeight - edgeThreshold) {
        window.scrollTo({
            top: window.scrollY + scrollSpeed,
            behavior: 'auto'
        });
    }

    // تحديد الـ drop-zone
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elementBelow?.closest('.drop-zone');

    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('active');
    });

    if (dropZone) {
        dropZone.classList.add('active');
        touchState.currentDropZone = dropZone;
    } else {
        touchState.currentDropZone = null;
    }
}

function handleTouchEnd(e) {
    if (!touchState.isDragging) return;
    e.preventDefault();
    
    // لا نعيد تعيين overflow
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('active');
    });
    
    if (touchState.currentDropZone && touchState.draggedCard) {
        const dropEvent = new Event('drop');
        Object.defineProperty(dropEvent, 'preventDefault', { value: () => {} });
        
        const card = touchState.draggedCard;
        card.classList.add('dragging');
        
        handleDrop.call(touchState.currentDropZone, dropEvent);
    }
    
    cleanupTouch();
}

// أضف هذه الدالة الجديدة
function enableScroll() {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.touchAction = '';
    document.documentElement.style.touchAction = '';
}

// استدعاء الدالة عند بدء اللعبة
function startNewGame() {
    enableScroll(); // أضف هذا السطر
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('celebration-screen').style.display = 'none';
    
    document.querySelector('.game-container').style.display = 'flex';
    document.querySelector('.instructions-container').style.display = 'flex';
    document.querySelector('.game-info').style.display = 'flex';
    
    totalAttempts = 5;
    currentLevel = 1;
    unlockedLevels = 1;
    levelScores = {};
    
    startLevel(1);
}



function createDragClone(card, x, y) {
    const clone = card.cloneNode(true);
    clone.className = 'card drag-clone';
    
    Object.assign(clone.style, {
        position: 'fixed',
        top: card.getBoundingClientRect().top + 'px',
        left: card.getBoundingClientRect().left + 'px',
        width: card.offsetWidth + 'px',
        height: card.offsetHeight + 'px',
        zIndex: '9999',
        opacity: '0.8',
        pointerEvents: 'none',
        transform: 'rotate(5deg)',
        transition: 'none'
    });
    
    document.body.appendChild(clone);
    touchState.dragClone = clone;
}

function cleanupTouch() {
    if (touchState.dragClone) {
        document.body.removeChild(touchState.dragClone);
    }
    
    if (touchState.draggedCard) {
        touchState.draggedCard.classList.remove('dragging', 'touch-dragging');
    }
    
    touchState = {
        isDragging: false,
        draggedCard: null,
        touchStartX: 0,
        touchStartY: 0,
        currentDropZone: null,
        dragClone: null
    };
}

// Game logic
function startLevel(levelNumber) {
    document.querySelectorAll('.level-complete-overlay').forEach(el => el.remove());
    currentLevel = levelNumber;
    const level = gameLevels[levelNumber - 1];
    
    if (!level) {
        console.error('Level not found:', levelNumber);
        return;
    }

    score = 0;
    totalCities = level.cities.length;
    availableCities = [...level.cities].sort(() => 0.5 - Math.random());
    activeCards = [];
    placedCards = [];

    updateUI();
    updateLevelInfo();
    dropInner.innerHTML = "";
    activeRow.innerHTML = "";
    gameOverBoard.style.display = "none";
    overlay.style.display = "none";

    dropInner.appendChild(createDropZone(0));
    createScrollButtons();
    initializeScrollFeatures();
    refillActiveCards();
    
    showFlash(`Level ${levelNumber}: ${level.name}`, 'info');
}

function updateUI() {
    attemptsLeftEl.textContent = totalAttempts;
    updateLevelProgress();
}

function updateLevelInfo() {
    const level = gameLevels[currentLevel - 1];
    document.getElementById('current-level').textContent = currentLevel;
    document.getElementById('level-name').textContent = level.name;
    updateLevelProgress();
}

function updateLevelProgress() {
    const progress = (score / totalCities) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('level-score').textContent = `Score: ${score}/${totalCities}`;
}

function addActiveCard() {
    if (availableCities.length === 0 || activeCards.length >= 3) return;
    
    const city = availableCities.pop();
    activeCards.push(city);

    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;
    card.dataset.year = city.year;
    card.dataset.name = city.name;
    
    card.innerHTML = `
        <img src="${city.img}" alt="${city.name}">
        <div class="card-info">
            <h4>${city.name}</h4>
        </div>`;

    // Desktop drag handlers
    let dragStartHandler = (e) => {
        card.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", "");
    };

    let dragEndHandler = () => {
        card.classList.remove("dragging");
    };

    // Touch handlers
    let touchStartHandler = (e) => handleTouchStart(e, card);
    let touchMoveHandler = (e) => handleTouchMove(e);
    let touchEndHandler = (e) => handleTouchEnd(e);

    card.addEventListener("dragstart", dragStartHandler);
    card.addEventListener("dragend", dragEndHandler);
    card.addEventListener("touchstart", touchStartHandler, { passive: false });
    document.addEventListener("touchmove", touchMoveHandler, { passive: false });
    document.addEventListener("touchend", touchEndHandler, { passive: false });

    card._dragHandlers = { 
        dragStartHandler, 
        dragEndHandler, 
        touchStartHandler, 
        touchMoveHandler, 
        touchEndHandler 
    };

    activeRow.appendChild(card);
}

function refillActiveCards() {
    while (activeCards.length < 3 && availableCities.length > 0) {
        addActiveCard();
    }
    
    if (availableCities.length === 0 && activeCards.length === 0 && placedCards.length > 0) {
        checkLevelCompletion();
    }
}

function checkLevelCompletion() {
    const allCitiesPlaced = placedCards.length === totalCities;
    
    if (allCitiesPlaced) {
        let isCorrectOrder = true;
        for (let i = 1; i < placedCards.length; i++) {
            if (compareYears(placedCards[i].year, placedCards[i-1].year) < 0) {
                isCorrectOrder = false;
                break;
            }
        }
        
        if (isCorrectOrder) {
            levelScores[currentLevel] = score;
            
            if (currentLevel === gameLevels.length) {
                showCelebration();
            } else {
                showLevelCompleteTransition();
            }
        } else {
            endGame();
        }
    }
}

function handleDrop(e) {
    e.preventDefault();
    const dragged = document.querySelector(".dragging");
    if (!dragged) return;

    const year = parseInt(dragged.dataset.year);
    const name = dragged.dataset.name;
    const imgElement = dragged.querySelector('img');
    const imgSrc = imgElement ? imgElement.src : '';
    const zoneIndex = parseInt(this.dataset.index);

    if (isNaN(year) || !name) {
        console.error('Invalid card data:', { year, name });
        return;
    }

    if (checkPlacement(year, zoneIndex)) {
        score++;
        showFlash('Excellent! +1 Point', 'success');
        
        if (score === totalCities) {
            showLevelCompleteTransition();
        }
    } else {
        totalAttempts--;
        showFlash(`Wrong! ${totalAttempts} attempts remaining`, 'error');
        
        if (totalAttempts <= 0) {
            endGame();
            return;
        }
    }

    updateUI();
    placeInCorrectSpot(name, year, imgSrc);
    
    activeCards = activeCards.filter(c => c.name !== name);
    if (dragged._dragHandlers) {
        dragged.removeEventListener("dragstart", dragged._dragHandlers.dragStartHandler);
        dragged.removeEventListener("dragend", dragged._dragHandlers.dragEndHandler);
        dragged.removeEventListener("touchstart", dragged._dragHandlers.touchStartHandler);
        dragged.removeEventListener("touchmove", dragged._dragHandlers.touchMoveHandler);
        dragged.removeEventListener("touchend", dragged._dragHandlers.touchEndHandler);
    }
    dragged.remove();
    
    refillActiveCards();
}

function showLevelCompleteTransition() {
    const overlay = document.createElement('div');
    overlay.className = 'level-complete-overlay';
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <div class="level-complete-content">
            <h2>🎉 Level Complete! 🎉</h2>
            <p>Perfect Score: ${score}/${totalCities}</p>
            <p>Get ready for Level ${currentLevel + 1}!</p>
            <button class="start-next-level" onclick="this.closest('.level-complete-overlay').remove(); nextLevel();">Start Level ${currentLevel + 1}</button>

        </div>
    `;
    
    document.body.appendChild(overlay);
    
    
}

function nextLevel() {
    const msg = document.getElementById("levelCompleteMessage");
    if (msg) msg.style.display = "none";

    if (currentLevel < gameLevels.length) {
        currentLevel++;
        startLevel(currentLevel);
    } else {
        showCelebration();
    }
}

function checkPlacement(year, index) {
    const leftCard = placedCards[index - 1] || null;
    const rightCard = placedCards[index] || null;

    if (leftCard && compareYears(year, leftCard.year) < 0) return false;
    if (rightCard && compareYears(year, rightCard.year) > 0) return false;

    return true;
}

function placeInCorrectSpot(name, year, img) {
    placedCards.push({ name, year, img });
    placedCards.sort((a, b) => compareYears(a.year, b.year));
    
    updateDropZones();
    setTimeout(() => {
        scrollToNewCard(year);
        updateScrollButtons();
    }, 100);
}

function updateDropZones() {
    dropInner.innerHTML = "";
    dropInner.appendChild(createDropZone(0));

    placedCards.forEach((city, i) => {
        const cardEl = document.createElement("div");
        cardEl.innerHTML = createPlacedCardHTML(city.name, city.year, city.img);
        dropInner.appendChild(cardEl.firstElementChild);
        dropInner.appendChild(createDropZone(i + 1));
    });
    
    setTimeout(updateScrollButtons, 100);
}

function scrollToNewCard(year) {
    const targetCard = Array.from(dropInner.querySelectorAll(".card.placed"))
        .find(card => {
            const yearText = card.querySelector('p')?.textContent;
            if (!yearText) return false;
            
            const cardYear = parseYear(yearText);
            return cardYear === year;
        });

    if (targetCard) {
        const containerWidth = dropContainer.offsetWidth;
        const cardLeft = targetCard.offsetLeft;
        const cardWidth = targetCard.offsetWidth;
        const newScroll = cardLeft - (containerWidth / 2) + (cardWidth / 2);
        
        dropContainer.scrollTo({ 
            left: Math.max(0, newScroll), 
            behavior: "smooth" 
        });
    }
}

function showFlash(message, type = 'info') {
    document.querySelectorAll('.flash-message').forEach(flash => {
        if (document.body.contains(flash)) {
            document.body.removeChild(flash);
        }
    });

    const flash = document.createElement('div');
    flash.className = `flash-message ${type}-flash`;
    flash.textContent = message;

    document.body.appendChild(flash);
    
    setTimeout(() => flash.style.opacity = '1', 10);
    
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(flash)) {
                document.body.removeChild(flash);
            }
        }, 300);
    }, 2500);
}

function showCelebration() {
    overlay.style.display = "block";
    const celebrationScreen = document.getElementById('celebration-screen');
    celebrationScreen.style.display = "flex";
    
    const totalScore = Object.values(levelScores).reduce((a, b) => a + b, 0);
    const maxScore = gameLevels.reduce((sum, level) => sum + level.cities.length, 0);
    
    document.getElementById('final-total-score').textContent = `${totalScore}/${maxScore}`;
    document.getElementById('attempts-used').textContent = 5 - totalAttempts;
}

function endGame() {
    overlay.style.display = "block";
    gameOverBoard.style.display = "flex";
    finalScoreEl.textContent = `Game Over!`;
    positionEl.textContent = "No more attempts! Starting from level 1...";
    
    const gameTitle = gameOverBoard.querySelector('h1');
    gameTitle.textContent = "Game Over!";
    gameTitle.style.color = "#FF6B6B";

    activeRow.querySelectorAll(".card").forEach(card => {
        card.draggable = false;
        card.style.opacity = '0.5';
        card.style.cursor = 'not-allowed';
        
        if (card._dragHandlers) {
            card.removeEventListener("touchstart", card._dragHandlers.touchStartHandler);
            card.removeEventListener("touchmove", card._dragHandlers.touchMoveHandler);
            card.removeEventListener("touchend", card._dragHandlers.touchEndHandler);
        }
    });

    const button = gameOverBoard.querySelector('button');
    button.textContent = 'Try Again';
    button.onclick = () => {
        totalAttempts = 5;
        unlockedLevels = 1;
        levelScores = {};
        startLevel(1);
    };
}

function restartGame() {
    if (placedCards.length > 0 && totalAttempts > 0) {
        if (!confirm('Are you sure you want to restart? You will lose your current progress.')) {
            return;
        }
    }
    
    startNewGame();
}

// Scroll features
function updateScrollIndicators() {
    const hasLeftContent = dropContainer.scrollLeft > 20;
    const hasRightContent = dropContainer.scrollLeft < (dropContainer.scrollWidth - dropContainer.clientWidth - 20);
    
    dropContainer.classList.toggle('has-left-content', hasLeftContent);
    dropContainer.classList.toggle('has-right-content', hasRightContent);
}

function initializeScrollFeatures() {
    updateScrollButtons();
    updateScrollIndicators();
}

// Mouse wheel support
dropContainer?.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        
        const scrollAmount = e.deltaY * 3;
        dropContainer.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
        
        setTimeout(updateScrollButtons, 50);
    }
}, { passive: false });

// Update scroll on scroll
dropContainer?.addEventListener('scroll', () => {
    setTimeout(() => {
        updateScrollButtons();
        updateScrollIndicators();
    }, 50);
});

// Initialize game
function initializeGame() {
    startNewGame();
}

// Start game when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (dragScrollInterval) {
        clearInterval(dragScrollInterval);
    }
    cleanupTouch();
});