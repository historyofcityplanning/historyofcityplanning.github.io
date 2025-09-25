// تقسيم المدن إلى مراحل
const gameLevels = [
    {
        level: 1,
        name: "Misopotamia",
        cities: [
            { name: "Eridu", year: -5000, img: "images/eridu.jpg" },
            { name: "Nippur", year: -4800, img: "images/nippur.jpg" },
            { name: "Ashur", year: -2600, img: "images/ashur.jpg" },
            { name: "Nineveh", year: -700, img: "images/nineveh.jpg" }
        ]
    },
    {
        level: 2,
        name: "Indus Valley",
        cities: [
            { name: "Chanhu-Daro", year: -4000, img: "images/chanhu-daro.jpg" },
            { name: "Kalibangan", year: -3500, img: "images/kalibangan.jpg" },
            { name: "Dholavira", year: -3000, img: "images/dholavira.webp" },
            { name: "Kot Diji", year: -2800, img: "images/kot diji.jpg" },
            { name: "Banawali", year: -2600, img: "images/banawali.avif" },
            { name: "Lothal", year: -2400, img: "images/lothal.jpg" },
            { name: "Surkotada", year: -2100, img: "images/surkotada.jpg" }
        ]
    },
    {
        level: 3,
        name: "Ancient Egypt-1",
        cities: [
            { name: "Naqada", year: -4000, img: "images/naqada.jpg" },
            { name: "Elkab (Nekheb)", year: -4000, img: "images/elkab.jpg" },
            { name: "Memphis", year: -3100, img: "images/memphis.jpg" },
            { name: "Abydos", year: -2890, img: "images/abydos.jpg" },
            { name: "Kahun", year: -1878, img: "images/kahun.jpg" },
            { name: "Elephantine Island", year: -1750, img: "images/elephantine.jpg" }
        ]
    },
    {
        level: 4,
        name: "Ancient Egypt-2",
        cities: [
            { name: "Tanis", year: -1550, img: "images/tanis.jpg" },
            { name: "Tell Basta", year: -1550, img: "images/tell.jpg" },
            { name: "Tell El-Amarnah", year: -1350, img: "images/amarnah.jpg" },
            { name: "Akhenaten", year: -1345, img: "images/akhenaten.jpg" },
            { name: "Habu", year: -1186, img: "images/habu.jpg" },
            { name: "Pi-Ramesses", year: -1050, img: "images/ramesses.jpg" }
        ]
    },
    {
        level: 5,
        name: "Ancient Greek-1",
        cities: [
            { name: "Mycenae", year: -2000, img: "images/mycenae.jpg" },
            { name: "Ephesus", year: -1000, img: "images/ephesus.jpg" },
            { name: "Sparta", year: -900, img: "images/sparta.webp" },
            { name: "Corinth", year: -747, img: "images/corinth.jpg" },
            { name: "Olynthus", year: -650, img: "images/olyntuhs.jpg" }
        ]
    },
    {
        level: 6,
        name: "Ancient Greek-2",
        cities: [
            { name: "Delphi", year: -580, img: "images/delphi.JPG" },
            { name: "Athens", year: -480, img: "images/athens.jpg" },
            { name: "Rhodes", year: -408, img: "images/rhodes.jpg" },
            { name: "Ancient Thebes", year: -371, img: "images/thebes.webp" },
            { name: "Delos", year: -314, img: "images/delos.jpg" }
        ]
    },
    {
        level: 7,
        name: "Perian Empire-1",
        cities: [
            { name: "Ecbatana", year: -678, img: "images/ecbatana.jpg" },
            { name: "Passagardae", year: -550, img: "images/passagardae.jpg" },
            { name: "Susa", year: -540, img: "images/susa.jpg" },
            { name: "Persepolis", year: -518, img: "images/persepolis.jpg" },
            { name: "Nisa", year: -247, img: "images/nisa.webp" }
        ]
    },
    {
        level: 8,
        name: "Persian Empire-2",
        cities: [
            { name: "Ctesiphon", year: -129, img: "images/ctesiphon.jpg" },
            { name: "Ardashir Khurrah", year: 224, img: "images/ardashir.jpg" },
            { name: "Gundeshapur", year: 256, img: "images/gundeshapur.jpg" },
            { name: "Bishapur", year: 266, img: "images/bishapur.jpg" }
        ]
    },
    {
        level: 9,
        name: "Mesoamerica",
        cities: [
            { name: "Monte Albán", year: -500, img: "images/monte alban.webp" },
            { name: "Teotihuacan", year: -100, img: "images/teotihuacan.jpg" },
            { name: "Palenque", year: 200, img: "images/palenque.webp" },
            { name: "Tikal", year: 250, img: "images/tikal.jpg" },
            { name: "Chichen Itza", year: 500, img: "images/Chichen Itza.jpg" }
        ]
    },
    {
        level: 10,
        name: "Roman Era-1",
        cities: [
            { name: "Ostia", year: -620, img: "images/ostia.jpg" },
            { name: "Minturnae", year: -296, img: "images/minturnae.jpg" },
            { name: "Tarraco", year: -218, img: "images/tarraco.jpg" },
            { name: "Lucca", year: -180, img: "images/lucca.jpg" },
            { name: "Thessalonica", year: -168, img: "images/thessalonica.jpg" },
            { name: "Ephesus", year: -129, img: "images/ephesus-2.jpg" },
            { name: "Herculaneum", year: -89, img: "images/herculaneum.jpg" },
        ]
    },
    {
        level: 11,
        name: "Roman Era-2",
        cities: [
            { name: "Antioch", year: -64, img: "images/antioch.jpg" },
            { name: "Carthage", year: -44, img: "images/carthage.webp" },
            { name: "Turin", year: -28, img: "images/turin.jpg" },
            { name: "Aosta", year: -25, img: "images/aosta.avif" },
            { name: "Trier", year: -16, img: "images/trier.webp" },
            { name: "Londinium", year: 47, img: "images/londinium.webp" },
            { name: "Timgad", year: 100, img: "images/timgad.jpeg" }
        ]
    },
    {
        level: 12,
        name: "Medieval Cities-1",
        cities: [
            { name: "Cologne", year: 450, img: "images/cologne.webp" },
            { name: "Arras", year: 499, img: "images/arras.jpg" },
            { name: "Dubrovnik", year: 650, img: "images/dubrovnik.jpg" },
            { name: "Edinburgh", year: 680, img: "images/edinburgh.jpg" },
            { name: "Mont Saint Michel", year: 708, img: "images/mont.jpg" },
            { name: "Colmar", year: 823, img: "images/colmar.webp" },
            { name: "Arnhem", year: 893, img: "images/arnhem.jpg" }
        ]
    },
    {
        level: 13,
        name: "Medieval Cities-2",
        cities: [
            { name: "Avila", year: 1090, img: "images/avila.jpg" },
            { name: "San Gimignano", year: 1119, img: "images/san.webp" },
            { name: "Lübeck", year: 1159, img: "images/lubeck.avif" },
            { name: "Cesky Krumlov", year: 1250, img: "images/cesky.jpg" },
            { name: "Kraków", year: 1257, img: "images/krakow.jpg" },
            { name: "Carcassonne", year: 1266, img: "images/carcassonne.webp" }
        ]
    },
    {
        level: 13,
        name: "Renaissance  Cities-1",
        cities: [
            { name: "Rome", year: 1420, img: "images/rome.webp" },
            { name: "Urbino", year: 1443, img: "images/Urbino.webp" },
            { name: "Ferrara", year: 1445, img: "images/ferrara.webp" },
            { name: "Naples", year: 1450, img: "images/naples.jpeg" },
            { name: "Mantua", year: 1459, img: "images/Mantua.jpg" },
            { name: "Rimini", year: 1460, img: "images/rimini.jpg" },
            { name: "Lyon", year: 1470, img: "images/lyon.jpg" },
            
            
            
        ]
    },
    {
        level: 14,
        name: "Renaissance  Cities-2",
        cities: [
            { name: "Milan", year: 1480, img: "images/milan.webp" },
            { name: "Genoa", year: 1500, img: "images/genoa.jpg" },
            { name: "Nuremberg", year: 1525, img: "images/nuremberg.webp" },
            { name: "Toledo", year: 1540, img: "images/toledo.JPG" },
            { name: "London", year: 1550, img: "images/london.webp" },
            { name: "Palmanova", year: 1593, img: "images/palmanova.jpg" }
        ]
    }
];
