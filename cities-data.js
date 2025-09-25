// بيانات المدن التاريخية مع سنوات تأسيسها
const citiesData = [
    { 
        name: "Eridu", 
        year: -5000, 
        img: "images/eridu.jpg",
    },
    { 
        name: "Nippur", 
        year: -4800, 
        img: "images/nippur.jpg",
    },
    { 
        name: "Ashur", 
        year: -2600, 
        img: "images/ashur.jpg",
    },
    { 
        name: "Nineveh", 
        year: -700, 
        img: "images/nineveh.jpg",
    },
    { 
        name: "Chanhu-Daro", 
        year: -4000, 
        img: "images/chanhu-daro.jpg",
    },
    { 
        name: "Kalibangan", 
        year: -3500, 
        img: "images/kalibangan.jpg",
    },
    { 
        name: "Dholavira", 
        year: -3000, 
        img: "images/dholavira.webp",
    },
    { 
        name: "Kot Diji", 
        year: -2800, 
        img: "images/kot diji.jpg",
    },
    { 
        name: "Banawali", 
        year: -2600, 
        img: "images/banawali.avif",
    },
    { 
        name: "Lothal", 
        year: -2400, 
        img: "images/lothal.jpg",
    },
    { 
        name: "Surkotada", 
        year: -1700, 
        img: "images/surkotada.jpg",
    },
    { 
        name: "Naqada", 
        year: -4000, 
        img: "images/naqada.jpg",
    }
];

// دالة للحصول على صورة المدينة مع fallback
function getCityImage(cityName) {
    const city = citiesData.find(c => c.name === cityName);
    return city ? city.img : placeholderImages[cityName] || "https://via.placeholder.com/150x100/666666/FFFFFF?text=City";
}

// دالة لخلط المدن عشوائياً
function shuffleCities(cities) {
    const shuffled = [...cities];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// دالة للحصول على عدد محدد من المدن عشوائياً
function getRandomCities(count = 8) {
    const shuffled = shuffleCities(citiesData);
    return shuffled.slice(0, Math.min(count, citiesData.length));
}