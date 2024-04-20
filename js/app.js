const currentTime = new Date();
const hours = currentTime.getHours();
const minutes = currentTime.getMinutes();
const seconds = currentTime.getSeconds();
console.log(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

let secPairCards = document.querySelector('#seconds');
let minPairCards = document.querySelector('#minutes');
let hourPairCards = document.querySelector('#hours');
let sec = document.querySelector("#o-s");
let secC = document.querySelector("#s-o");

class FlipCard {
    constructor(element, page1, page2, maxN = 9) {
        this.element = element;
        this.isPage1 = true;
        this.page1 = page1;
        this.page2 = page2;
        this.n = 0;
        this.maxN = maxN;
        this.upValue = this.element.querySelector('.up .v');
        this.lowValue = this.element.querySelector('.low .v');
        this.backValue = this.element.querySelector('.back .v');
        this.upCard = this.element.querySelector('.up');
    }

    flip () {
        this.lowValue.innerHTML = Number.parseInt(this.upValue.innerHTML);
        if (this.isPage1) {
            this.upCard.classList.remove(this.page1);
            this.upValue.style.display = 'block';
            this.upValue.style.transform = 'translateY(-50%)';
            this.upValue.style.transform = 'rotateX(-180deg)';
            this.upCard.classList.add(this.page2);
            this.isPage1 = false;
            this.n = Number.parseInt(this.upValue.innerHTML);
            this.upValue.innerHTML = nextNum(this.n, this.maxN);
            this.lowValue.innerHTML = this.n;
        } else {
            this.upCard.classList.remove(this.page2);
            this.upValue.style.transform = 'translateY(0%)';
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
const secFlipCard = new FlipCard(sec, 'page1', 'page2');
const seccFlipCard = new FlipCard(secC, 'page11', 'page22', 5);
seccFlipCard.isPage1 = false;


window.addEventListener('load', () => {
    secFlipCard.upCard.classList.add('page1');
});

window.addEventListener('animationiteration', () => {
    secFlipCard.flip();
    if (secFlipCard.isPage1 && secFlipCard.n + 1 === 9) {
        console.log('1');
        seccFlipCard.flip();
    }
});

window.addEventListener('animationend', () => {
    if (seccFlipCard.isPage1) {
        seccFlipCard.flip();
    } else {
        seccFlipCard.singleFlipPostActions();
    }
});