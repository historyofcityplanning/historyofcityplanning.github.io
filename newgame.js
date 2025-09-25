// --- المتغيرات العامة ---
let score = 0;
let lives = 5;
let availableCities = [];
let activeCards = [];
let placedCards = [];
let totalCities = 0; // إضافة لتتبع العدد الإجمالي
let dragScrollInterval = null; // لتجنب تراكم الـ intervals

// --- عناصر DOM ---
const scoreEl = document.querySelector(".score");
const livesEl = document.querySelector(".lives");
const activeRow = document.getElementById("active-card");
const dropContainer = document.querySelector('.drop-row-container');
const dropInner = document.getElementById('drop-zones-inner');
const gameOverBoard = document.getElementById("gameoverboard");
const overlay = document.getElementById("overlay");
const finalScoreEl = document.getElementById("final-score");
const positionEl = document.getElementById("position");

// --- دوال مساعدة للتعامل مع السنوات ---
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
    // للتعامل مع السنوات السالبة والموجبة بشكل صحيح
    return year1 - year2;
}

// --- إنشاء عناصر HTML ---
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
        // التأكد من أن المؤشر خرج فعلاً من المنطقة
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

// --- إنشاء أزرار السكرول ---
function createScrollButtons() {
    // إزالة الأزرار القديمة إذا كانت موجودة
    const oldLeftBtn = document.querySelector('.scroll-btn-left');
    const oldRightBtn = document.querySelector('.scroll-btn-right');
    if (oldLeftBtn) oldLeftBtn.remove();
    if (oldRightBtn) oldRightBtn.remove();

    const leftBtn = document.createElement('button');
    leftBtn.className = 'scroll-btn scroll-btn-left';
    leftBtn.innerHTML = '◀';
    leftBtn.onclick = () => {
        // إذا كنا قريبين من البداية، اسكرول للبداية تماماً
        if (dropContainer.scrollLeft <= 100) {
            scrollToStart();
        } else {
            scrollDropZone(-200);
        }
    };
    
    const rightBtn = document.createElement('button');
    rightBtn.className = 'scroll-btn scroll-btn-right';
    rightBtn.innerHTML = '▶';
    rightBtn.onclick = () => scrollDropZone(200);
    
    // إضافة الأزرار للـ container
    const gameContainer = document.querySelector('.game-container');
    const dropRowContainer = document.querySelector('.drop-row-container');
    
    // إنشاء wrapper للـ drop zone مع الأزرار
    if (!document.querySelector('.drop-zone-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'drop-zone-wrapper';
        
        // نقل الـ drop container للـ wrapper
        dropRowContainer.parentNode.insertBefore(wrapper, dropRowContainer);
        wrapper.appendChild(leftBtn);
        wrapper.appendChild(dropRowContainer);
        wrapper.appendChild(rightBtn);
    }
    
    updateScrollButtons();
}

// --- دوال السكرول المحسنة ---
function scrollDropZone(amount) {
    dropContainer.scrollBy({
        left: amount,
        behavior: 'smooth'
    });
    
    // تحديث الأزرار بعد السكرول
    setTimeout(updateScrollButtons, 300);
}

// دالة للسكرول للبداية (أول drop zone)
function scrollToStart() {
    dropContainer.scrollTo({
        left: 0,
        behavior: 'smooth'
    });
    setTimeout(updateScrollButtons, 300);
}

// دالة للسكرول للنهاية
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
    
    const isAtStart = dropContainer.scrollLeft <= 5; // تقليل المسافة للحساسية
    const isAtEnd = dropContainer.scrollLeft >= (dropContainer.scrollWidth - dropContainer.clientWidth - 5);
    
    // إخفاء/إظهار الأزرار حسب الموقع
    leftBtn.style.opacity = isAtStart ? '0.3' : '1';
    leftBtn.style.pointerEvents = isAtStart ? 'none' : 'auto';
    
    rightBtn.style.opacity = isAtEnd ? '0.3' : '1';
    rightBtn.style.pointerEvents = isAtEnd ? 'none' : 'auto';
    
    // إخفاء الأزرار إذا مفيش حاجة للسكرول
    const needsScroll = dropContainer.scrollWidth > dropContainer.clientWidth;
    const wrapper = document.querySelector('.drop-zone-wrapper');
    if (wrapper) {
        wrapper.style.display = needsScroll ? 'flex' : 'block';
        leftBtn.style.display = needsScroll ? 'flex' : 'none';
        rightBtn.style.display = needsScroll ? 'flex' : 'none';
    }
}

// --- إضافة Mouse Wheel Support ---
function addMouseWheelSupport() {
    dropContainer.addEventListener('wheel', (e) => {
        // منع الـ vertical scroll والتحويل لـ horizontal
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            dropContainer.scrollBy({
                left: e.deltaY * 2,
                behavior: 'smooth'
            });
            
            setTimeout(updateScrollButtons, 100);
        }
    }, { passive: false });
}

// --- تحسين Touch Support ---
let touchScrollState = {
    startX: 0,
    startScrollLeft: 0,
    isDragging: false
};

function addTouchScrollSupport() {
    dropContainer.addEventListener('touchstart', (e) => {
        // تجنب التداخل مع سحب الكروت
        if (e.target.closest('.card')) return;
        
        touchScrollState.startX = e.touches[0].clientX;
        touchScrollState.startScrollLeft = dropContainer.scrollLeft;
        touchScrollState.isDragging = true;
        
        dropContainer.style.cursor = 'grabbing';
    }, { passive: true });
    
    dropContainer.addEventListener('touchmove', (e) => {
        if (!touchScrollState.isDragging || e.target.closest('.card')) return;
        
        e.preventDefault();
        const deltaX = e.touches[0].clientX - touchScrollState.startX;
        dropContainer.scrollLeft = touchScrollState.startScrollLeft - deltaX;
        
        updateScrollButtons();
    }, { passive: false });
    
    dropContainer.addEventListener('touchend', () => {
        touchScrollState.isDragging = false;
        dropContainer.style.cursor = 'grab';
        updateScrollButtons();
    }, { passive: true });
}

// --- متغيرات Touch ---
let touchState = {
    isDragging: false,
    draggedCard: null,
    touchStartX: 0,
    touchStartY: 0,
    currentDropZone: null,
    dragClone: null
};

// --- معالجة السحب المحسنة ---
function handleDragScrolling(event) {
    const edgeZone = 100;
    const draggingCard = document.querySelector(".dragging");
    if (!draggingCard) return;

    // إيقاف الـ scroll السابق
    if (dragScrollInterval) {
        clearInterval(dragScrollInterval);
        dragScrollInterval = null;
    }

    const clientX = event.clientX || (event.touches && event.touches[0] ? event.touches[0].clientX : 0);
    
    if (clientX > window.innerWidth - edgeZone) {
        dragScrollInterval = setInterval(() => {
            dropContainer.scrollLeft += 10;
            updateScrollButtons();
        }, 16); // 60fps
    } else if (clientX < edgeZone) {
        dragScrollInterval = setInterval(() => {
            dropContainer.scrollLeft -= 10;
            updateScrollButtons();
        }, 16);
    }
}

function stopDragScrolling() {
    if (dragScrollInterval) {
        clearInterval(dragScrollInterval);
        dragScrollInterval = null;
    }
    updateScrollButtons();
}

// --- Touch Events للموبايل ---
function handleTouchStart(e, card) {
    e.preventDefault();
    
    touchState.isDragging = true;
    touchState.draggedCard = card;
    touchState.touchStartX = e.touches[0].clientX;
    touchState.touchStartY = e.touches[0].clientY;
    
    // إنشاء نسخة مرئية للسحب
    createDragClone(card, e.touches[0].clientX, e.touches[0].clientY);
    
    // إضافة class للكارت الأصلي
    card.classList.add('dragging', 'touch-dragging');
    
    // منع scroll الصفحة أثناء السحب
    document.body.style.overflow = 'hidden';
}

function handleTouchMove(e) {
    if (!touchState.isDragging || !touchState.dragClone) return;
    
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.touchStartX;
    const deltaY = touch.clientY - touchState.touchStartY;
    
    // تحريك النسخة المرئية
    touchState.dragClone.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    
    // العثور على drop zone تحت الإصبع
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elementBelow?.closest('.drop-zone');
    
    // إزالة active من جميع المناطق
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('active');
    });
    
    // إضافة active للمنطقة الحالية
    if (dropZone) {
        dropZone.classList.add('active');
        touchState.currentDropZone = dropZone;
    } else {
        touchState.currentDropZone = null;
    }
    
    // معالجة scroll الحواف
    handleDragScrolling(e);
}

function handleTouchEnd(e) {
    if (!touchState.isDragging) return;
    
    e.preventDefault();
    
    // استعادة scroll الصفحة
    document.body.style.overflow = '';
    
    // إيقاف auto scroll
    stopDragScrolling();
    
    // إزالة active من جميع المناطق
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('active');
    });
    
    // معالجة الإسقاط إذا كان في منطقة صحيحة
    if (touchState.currentDropZone && touchState.draggedCard) {
        // محاكاة drop event
        const dropEvent = new Event('drop');
        Object.defineProperty(dropEvent, 'preventDefault', { value: () => {} });
        
        // تمرير بيانات الكارت
        const card = touchState.draggedCard;
        card.classList.add('dragging'); // للتأكد من وجود الـ class
        
        handleDrop.call(touchState.currentDropZone, dropEvent);
    }
    
    // تنظيف
    cleanupTouch();
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
        transform: 'rotate(3deg)',
        transition: 'none',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
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

// --- بدء اللعبة ---
function startGame() {
    // التأكد من وجود البيانات
    if (typeof citiesData === 'undefined') {
        console.error('بيانات المدن غير متوفرة! تأكد من تحميل cities-data.js أولاً');
        showFlash('خطأ: بيانات المدن غير متوفرة!', 'error');
        return;
    }
    
    // التحقق من صحة البيانات
    if (!Array.isArray(citiesData) || citiesData.length === 0) {
        console.error('بيانات المدن غير صحيحة أو فارغة');
        showFlash('خطأ: بيانات المدن غير صحيحة!', 'error');
        return;
    }

    score = 0;
    lives = 5;
    totalCities = citiesData.length;
    availableCities = [...citiesData].sort(() => 0.5 - Math.random());
    activeCards = [];
    placedCards = [];

    updateUI();
    dropInner.innerHTML = "";
    activeRow.innerHTML = "";
    gameOverBoard.style.display = "none";
    overlay.style.display = "none";

    dropInner.appendChild(createDropZone(0));
    
    // إنشاء أزرار السكرول
    createScrollButtons();
    
    // إضافة دعم السكرول المحسن
    addMouseWheelSupport();
    addTouchScrollSupport();
    
    refillActiveCards();
    
    // إضافة رسالة ترحيب
    showFlash(`Hello ! Arrange This ${totalCities} City According To it's Founding Year`, 'info');
}

function updateUI() {
    scoreEl.textContent = "Score: " + score;
    livesEl.textContent = "Lives: " + lives;
}

// --- إدارة الكروت ---
function addActiveCard() {
    if (availableCities.length === 0 || activeCards.length >= 3) {
        return;
    }
    
    const city = availableCities.pop();
    activeCards.push(city);

    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;
    card.dataset.year = city.year;
    card.dataset.name = city.name;
    
    // إضافة fallback للصورة
    const imgSrc = city.img;
    
    card.innerHTML = `
        <img src="${imgSrc}" alt="${city.name}">
        <div class="card-info">
            <h4>${city.name}</h4>
        </div>`;

    // Desktop drag handlers
    let dragStartHandler = (e) => {
        card.classList.add("dragging");
        document.addEventListener("dragover", handleDragScrolling);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", ""); // للتوافق مع المتصفحات
    };

    let dragEndHandler = () => {
        card.classList.remove("dragging");
        document.removeEventListener("dragover", handleDragScrolling);
        stopDragScrolling();
    };

    // Touch handlers للموبايل
    let touchStartHandler = (e) => handleTouchStart(e, card);
    let touchMoveHandler = (e) => handleTouchMove(e);
    let touchEndHandler = (e) => handleTouchEnd(e);

    // Desktop events
    card.addEventListener("dragstart", dragStartHandler);
    card.addEventListener("dragend", dragEndHandler);
    
    // Touch events للموبايل
    card.addEventListener("touchstart", touchStartHandler, { passive: false });
    document.addEventListener("touchmove", touchMoveHandler, { passive: false });
    document.addEventListener("touchend", touchEndHandler, { passive: false });

    // حفظ الـ handlers للتنظيف لاحقاً
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
    
    // إذا لم تعد هناك مدن متاحة ولا توجد كروت نشطة
    if (availableCities.length === 0 && activeCards.length === 0 && placedCards.length > 0) {
        setTimeout(winGame, 500);
    }
}

// --- معالجة الإفلات المحسنة ---
function handleDrop(e) {
    e.preventDefault();
    const dragged = document.querySelector(".dragging");
    if (!dragged) return;

    const year = parseInt(dragged.dataset.year);
    const name = dragged.dataset.name;
    const imgElement = dragged.querySelector('img');
    const imgSrc = imgElement ? imgElement.src : '';
    const zoneIndex = parseInt(this.dataset.index);

    // التحقق من صحة البيانات
    if (isNaN(year) || !name) {
        console.error('بيانات الكارت غير صحيحة:', { year, name });
        return;
    }

    if (checkPlacement(year, zoneIndex)) {
        score++;
        showFlash('Brilliant ! +1 Point', 'success');
    } else {
        lives--;
        const correctPosition = findCorrectPosition(year);
        showFlash(`Wrong ! The Right Place Is ${correctPosition + 1}`, 'error');
        
        if (lives <= 0) {
            endGame();
            return;
        }
    }

    updateUI();
    placeInCorrectSpot(name, year, imgSrc);
    
    // إزالة الكارت من القائمة النشطة وتنظيف الـ event listeners
    activeCards = activeCards.filter(c => c.name !== name);
    if (dragged._dragHandlers) {
        // Desktop events
        dragged.removeEventListener("dragstart", dragged._dragHandlers.dragStartHandler);
        dragged.removeEventListener("dragend", dragged._dragHandlers.dragEndHandler);
        
        // Touch events
        dragged.removeEventListener("touchstart", dragged._dragHandlers.touchStartHandler);
        document.removeEventListener("touchmove", dragged._dragHandlers.touchMoveHandler);
        document.removeEventListener("touchend", dragged._dragHandlers.touchEndHandler);
    }
    dragged.remove();
    
    refillActiveCards();
}

// --- التحقق من الوضع الصحيح المحسن ---
function checkPlacement(year, index) {
    const leftCard = placedCards[index - 1] || null;
    const rightCard = placedCards[index] || null;

    if (leftCard && compareYears(year, leftCard.year) < 0) return false;
    if (rightCard && compareYears(year, rightCard.year) > 0) return false;

    return true;
}

function findCorrectPosition(year) {
    // العثور على الموضع الصحيح للمدينة
    for (let i = 0; i <= placedCards.length; i++) {
        if (checkPlacement(year, i)) {
            return i;
        }
    }
    return placedCards.length; // في النهاية إذا لم يجد موضعاً
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
    
    // تحديث أزرار السكرول بعد إضافة محتوى جديد
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

// --- رسائل التفاعل المحسنة ---
function showFlash(message, type = 'info') {
    // إزالة الرسائل القديمة
    document.querySelectorAll('.flash-message').forEach(flash => {
        if (document.body.contains(flash)) {
            document.body.removeChild(flash);
        }
    });

    const flash = document.createElement('div');
    flash.className = `flash-message ${type}-flash`;
    flash.textContent = message;
    
    // إضافة أنماط أساسية
    Object.assign(flash.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        borderRadius: '5px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: '9999',
        opacity: '0',
        transition: 'opacity 0.3s ease'
    });

    // ألوان حسب النوع
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3'
    };
    flash.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(flash);
    
    // تأثير الظهور
    setTimeout(() => flash.style.opacity = '1', 10);
    
    // الاختفاء
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(flash)) {
                document.body.removeChild(flash);
            }
        }, 300);
    }, 2000);
}

// --- انتهاء اللعبة ---
function winGame() {
    overlay.style.display = "block";
    gameOverBoard.style.display = "flex";
    finalScoreEl.textContent = `Final SCORE: ${score}/${totalCities}`;
    positionEl.textContent = "Congrats ! You Nailed It ! 🏆";
    
    const gameTitle = gameOverBoard.querySelector('h1');
    if (gameTitle) {
        gameTitle.textContent = "You Nailed It !";
        gameTitle.style.color = "#4CAF50";
    }
    
    // حفظ أفضل نتيجة
    saveHighScore(score, totalCities);
}

function endGame() {
    overlay.style.display = "block";
    gameOverBoard.style.display = "flex";
    finalScoreEl.textContent = `Score: ${score}/${totalCities}`;
    
    let message = "Try Again!";
    const percentage = (score / totalCities) * 100;
    
    if (percentage >= 80) message = "Unbelievable ! 🎉";
    else if (percentage >= 60) message = "Very Good! 👏";
    else if (percentage >= 40) message = "Good ! 👍";
    else if (percentage >= 20) message = "Get Better ! 💪";
    
    positionEl.textContent = message;
    
    const gameTitle = gameOverBoard.querySelector('h1');
    if (gameTitle) {
        gameTitle.textContent = "Game Over !";
        gameTitle.style.color = "#d32f2f";
    }

    // منع السحب للكروت المتبقية
    activeRow.querySelectorAll(".card").forEach(card => {
        card.draggable = false;
        card.style.opacity = '0.5';
        card.style.cursor = 'not-allowed';
        
        // إزالة touch events أيضاً
        if (card._dragHandlers) {
            card.removeEventListener("touchstart", card._dragHandlers.touchStartHandler);
            document.removeEventListener("touchmove", card._dragHandlers.touchMoveHandler);
            document.removeEventListener("touchend", card._dragHandlers.touchEndHandler);
        }
    });
    
    // حفظ النتيجة
    saveHighScore(score, totalCities);
}

// --- إدارة أفضل النتائج ---
function saveHighScore(currentScore, total) {
    try {
        const highScore = localStorage.getItem('timeline_high_score');
        const highScoreData = highScore ? JSON.parse(highScore) : { score: 0, total: 0 };
        
        const currentPercentage = (currentScore / total) * 100;
        const highPercentage = highScoreData.total > 0 ? (highScoreData.score / highScoreData.total) * 100 : 0;
        
        if (currentPercentage > highPercentage) {
            localStorage.setItem('timeline_high_score', JSON.stringify({ score: currentScore, total }));
            showFlash('New High Score! 🌟', 'success');
        }
    } catch (error) {
        console.log('لا يمكن حفظ النتيجة:', error);
    }
}

function getHighScore() {
    try {
        const highScore = localStorage.getItem('timeline_high_score');
        return highScore ? JSON.parse(highScore) : null;
    } catch (error) {
        console.log('لا يمكن قراءة أفضل نتيجة:', error);
        return null;
    }
}

// --- إعادة التشغيل المحسنة ---
function restartGame() {
    // تأكيد إعادة التشغيل إذا كانت اللعبة جارية
    if (placedCards.length > 0 && lives > 0) {
        if (!confirm('هل أنت متأكد من إعادة تشغيل اللعبة؟ ستفقد التقدم الحالي.')) {
            return;
        }
    }
    
    // تنظيف الـ intervals والـ event listeners
    stopDragScrolling();
    document.removeEventListener("dragover", handleDragScrolling);
    
    startGame();
}

// --- تشغيل اللعبة ---
function initializeGame() {
    // التأكد من تحميل البيانات قبل بدء اللعبة
    if (typeof citiesData === 'undefined') {
        console.log('في انتظار تحميل بيانات المدن...');
        setTimeout(initializeGame, 100);
        return;
    }
    
    startGame();
    
    // عرض أفضل نتيجة إذا كانت متوفرة
    const highScore = getHighScore();
    if (highScore) {
        const percentage = Math.round((highScore.score / highScore.total) * 100);
        setTimeout(() => {
            showFlash(`High Score: ${highScore.score}/${highScore.total} (${percentage}%)`, 'info');
        }, 1000);
    }
}

// بدء اللعبة عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

// تنظيف عند إغلاق الصفحة
window.addEventListener('beforeunload', () => {
    stopDragScrolling();
    document.removeEventListener("dragover", handleDragScrolling);
    cleanupTouch();
});

// --- أنماط CSS إضافية للموبايل ---
function addMobileStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .card.touch-dragging {
            opacity: 0.3 !important;
            transform: scale(0.95) !important;
        }
        
        .drag-clone {
            border: 2px solid #2196F3 !important;
            border-radius: 8px !important;
        }
        
        .drop-zone.active {
            background-color: rgba(76, 175, 80, 0.2) !important;
            border: 2px dashed #4CAF50 !important;
            transform: scale(1.05) !important;
        }
        
        /* منع selection أثناء السحب على الموبايل */
        .card {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
        }
        
        /* تحسين التفاعل مع اللمس */
        .card, .drop-zone {
            touch-action: none;
        }
        
        /* تأثير hover للمس */
        .card:active {
            transform: scale(0.98);
        }

        /* أزرار السكرول */
        .drop-zone-wrapper {
            display: flex;
            align-items: center;
            width: 100%;
            position: relative;
            justify-content: center;
        }

        .scroll-btn {
            position: absolute;
            z-index: 100;
            background: rgba(255, 255, 255, 0.9);
            color: #111;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
        }

        .scroll-btn:hover {
            background: rgba(255, 255, 255, 1);
            transform: scale(1.1);
        }

        .scroll-btn-left {
            left: 10px;
        }

        .scroll-btn-right {
            right: 10px;
        }

        .scroll-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }

        /* تحسين السكرول على الموبايل */
        @media (max-width: 768px) {
            .scroll-btn {
                width: 35px;
                height: 35px;
                font-size: 14px;
            }
        }
    `;
    document.head.appendChild(style);
}

// إضافة الأنماط عند التحميل
addMobileStyles();

// إضافة مؤشرات السكرول المرئية
function addScrollIndicators() {
    // مؤشر للمحتوى على الشمال
    const leftIndicator = document.createElement('div');
    leftIndicator.className = 'scroll-indicator scroll-indicator-left';
    leftIndicator.innerHTML = '...';
    
    // مؤشر للمحتوى على اليمين
    const rightIndicator = document.createElement('div');
    rightIndicator.className = 'scroll-indicator scroll-indicator-right';
    rightIndicator.innerHTML = '...';
    
    // إضافة الأنماط للمؤشرات
    const indicatorStyle = document.createElement('style');
    indicatorStyle.textContent = `
        .scroll-indicator {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: linear-gradient(90deg, transparent, rgba(0,0,0,0.8));
            color: #4CAF50;
            font-weight: bold;
            font-size: 20px;
            padding: 10px 15px;
            z-index: 99;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .scroll-indicator-left {
            left: 0;
            background: linear-gradient(90deg, rgba(0,0,0,0.8), transparent);
        }
        
        .scroll-indicator-right {
            right: 0;
            background: linear-gradient(90deg, transparent, rgba(0,0,0,0.8));
        }
    `;
    document.head.appendChild(indicatorStyle);
    
    return { leftIndicator, rightIndicator };
}

// Event listener لتحديث المؤشرات والأزرار عند السكرول
dropContainer.addEventListener('scroll', () => {
    setTimeout(updateScrollButtons, 50);
});