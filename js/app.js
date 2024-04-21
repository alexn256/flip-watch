const currentTime = new Date(2025, 10, 22, 23, 58, 0);
const hours = currentTime.getHours();
const minutes = currentTime.getMinutes();
const seconds = currentTime.getSeconds();
console.log(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

let secPairCards = document.querySelector('#seconds');
let minPairCards = document.querySelector('#minutes');
let hourPairCards = document.querySelector('#hours');
let sec = document.querySelector("#o-s");
let secs = document.querySelector("#s-o");
let min = document.querySelector("#o-m");
let mins = document.querySelector("#m-o");
let hr = document.querySelector("#o-h");
let hrs = document.querySelector("#h-o");

class FlipCard {
    constructor(element, page1, page2, maxN = 5) {
        this.element = element;
        this.isPage1 = true;
        this.page1 = page1;
        this.page2 = page2;
        this.maxN = maxN;
        this.upValue = this.element.querySelector('.up .v');
        this.lowValue = this.element.querySelector('.low .v');
        this.backValue = this.element.querySelector('.back .v');
        this.upCard = this.element.querySelector('.up');
        this.n = Number.parseInt(this.upValue.innerHTML);
    }

    flip() {
        this.lowValue.innerHTML = Number.parseInt(this.upValue.innerHTML);
        if (this.isPage1) {
            this.upCard.classList.remove(this.page1);
            this.upValue.style.display = 'block';
            this.upValue.style.transform = 'rotateX(-180deg)';
            this.upCard.classList.add(this.page2);
            this.isPage1 = false;
            this.n = Number.parseInt(this.upValue.innerHTML);
            this.upValue.innerHTML = nextNum(this.n, this.maxN);
            this.lowValue.innerHTML = this.n;
        } else {
            this.upCard.classList.remove(this.page2);
            this.upValue.style.transform = 'rotateX(0deg)';
            this.upCard.classList.add(this.page1);
            this.isPage1 = true;
            const backVal = Number.parseInt(this.upValue.innerHTML);
            this.backValue.innerHTML = nextNum(backVal, this.maxN);
        }
    }

    singleFlipPostActions() {
        this.upValue.style = '';
        this.lowValue.innerHTML = nextNum(this.n, this.maxN);
    }
}

const nextNum = (n, maxN = 9) => {
    return n + 1 > maxN ? 0 : n + 1;
}

const initCard = (card, n) => {
    let upValue = card.querySelector('.up .v');
    upValue.innerHTML = n;
    let lowValue = card.querySelector('.low .v');
    lowValue.innerHTML = n;
    let backValue = card.querySelector('.back .v');
    backValue.innerHTML = nextNum(n);
}

const initPairCards = (pairCards, numValue) => {
    const rCard = pairCards.querySelector('[id^="o-"]');
    initCard(rCard, numValue % 10);
    const lCard = pairCards.querySelector('[id$="-o"]');
    initCard(lCard, Math.floor(numValue / 10));
}

/**
 * initialization.
 */
initPairCards(secPairCards, seconds);
initPairCards(minPairCards, minutes);
initPairCards(hourPairCards, hours);
const secFlipCard = new FlipCard(sec, 'sec-state-1', 'sec-state-2', 9);
const secsFlipCard = new FlipCard(secs, 'state-1', 'state-2');
secsFlipCard.isPage1 = false;
const minFlipCard = new FlipCard(min, 'state-1', 'state-2', 9);
const minsFslipCard = new FlipCard(mins, 'state-1', 'state-2');
minsFslipCard.isPage1 = false;
const hrFlipCard = new FlipCard(hr, 'state-1', 'state-2', 9);
hrFlipCard.isPage1 = false;
const hrsFlipCard = new FlipCard(hrs, 'state-1', 'state-2', 2);
hrsFlipCard.isPage1 = false;

window.addEventListener('load', () => {
    secFlipCard.upCard.classList.add('sec-state-1');
});

window.addEventListener('animationiteration', () => {
    secFlipCard.flip();
    if (secFlipCard.isPage1 && secFlipCard.n + 1 === 9) {
        secsFlipCard.flip();
    }
});

secs.addEventListener('animationend', () => {
    if (secsFlipCard.isPage1) {
        secsFlipCard.flip();
        if (!secsFlipCard.isPage1 && secsFlipCard.n + 1 === 6) {
            minFlipCard.flip();
        }
    } else {
        secsFlipCard.singleFlipPostActions();
    }
});

min.addEventListener('animationend', () => {
    if (hrsFlipCard.n > 1) {
        hrFlipCard.maxN = 3;
    } else {
        hrFlipCard.maxN = 9;
    }
    console.log(hrFlipCard.maxN);
    if (minFlipCard.isPage1) {
        minFlipCard.flip();
        if (!minFlipCard.isPage1 && minFlipCard.n + 1 === 10) {
            minsFslipCard.flip();
        }
    } else {
        minFlipCard.singleFlipPostActions();
    }
});

mins.addEventListener('animationend', () => {
    if (minsFslipCard.isPage1) {
        minsFslipCard.flip();
        if (!minsFslipCard.isPage1 && minsFslipCard.n + 1 === 6) {
            hrFlipCard.flip();
        }
    } else {
        minsFslipCard.singleFlipPostActions();
    }
});

hr.addEventListener('animationend', () => {
    if (hrFlipCard.isPage1) {
        hrFlipCard.flip();
        if (!hrFlipCard.isPage1 && hrFlipCard.n + 1 === hrFlipCard.maxN + 1) {
            hrsFlipCard.flip();
        }
    } else {
        hrFlipCard.singleFlipPostActions();
    }
});

hrs.addEventListener('animationend', () => {
    if (hrsFlipCard.isPage1) {
        hrsFlipCard.flip();
        if (!hrsFlipCard.isPage1 && hrsFlipCard.n + 1 === hrsFlipCard.maxN + 1) {
        }
    } else {
        hrsFlipCard.singleFlipPostActions();
        hrsFlipCard.n = nextNum(hrsFlipCard.n, hrsFlipCard.maxN);
    }
});