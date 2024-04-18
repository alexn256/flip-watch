const currentTime = new Date();
const hours = currentTime.getHours();
const minutes = currentTime.getMinutes();
const seconds = currentTime.getSeconds();
console.log(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
let n = seconds % 10;

let isPage1 = true;

let secPairCards = document.querySelector('#seconds');
let x = document.querySelector('#ss-up');
let sec = document.querySelector("#o-s");

const nextNum = (n) => {
    return n + 1 > 9 ? 0 : n + 1;
}

const initCard = (card, n) => {
    let upValue = card.querySelector('.up .v');
    upValue.innerHTML = n;
    let lowValue = card.querySelector('.low .v');
    lowValue.innerHTML = n;
    let backValue = card.querySelector('.back .v');
    backValue.innerHTML = nextNum(n);
}

const initPairCards =(pairCards, num) => {
    const rCard = pairCards.querySelector('[id^="o-"]');
    initCard(rCard, num % 10);
    const lCard = pairCards.querySelector('[id$="-o"]');
    initCard(lCard, Math.floor(num / 10));
}

const flip = (element) => {
    let upValue = element.querySelector('.up .v');
    let lowValue = element.querySelector('.low .v');
    let backValue = element.querySelector('.back .v');
    lowValue.innerHTML = nextNum(n);
    if (isPage1) {
        x.classList.remove('page1');
        upValue.style.display = 'block';
        upValue.style.transform = 'translateY(-50%)';
        upValue.style.transform = 'rotateX(-180deg)';
        x.classList.add('page2');
        isPage1 = false;
        n = Number.parseInt(upValue.innerHTML);
        upValue.innerHTML = nextNum(n);
        lowValue.innerHTML = n;
    } else {
        x.classList.remove('page2');
        upValue.style.transform = 'translateY(0%)';
        upValue.style.transform = 'rotateX(0deg)';
        x.classList.add('page1');
        isPage1 = true;
        backValue.innerHTML = nextNum(n + 1);
    }
}

initPairCards(secPairCards, seconds);

x.addEventListener('click', () => {
    x.classList.add('page1');
});

x.addEventListener('animationiteration', () => {
    flip(sec);
});