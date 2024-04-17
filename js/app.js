const currentTime = new Date();
const hours = currentTime.getHours();
const minutes = currentTime.getMinutes();
const seconds = currentTime.getSeconds();
console.log(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

let isPage1 = true;

let card = document.querySelector('#ss-up');
card.addEventListener('click', () => {
    card.classList.add('page1');
})

const nextNum = (n) => {
    return n + 1 > 9 ? 0 : n + 1;
}

let v = document.querySelector('#o-s-up .v');
let v2 = document.querySelector('#o-s-low .v');
let v3 = document.querySelector('#o-s .back .v');
let n = 1;
v3.innerHTML = nextNum(n);
card.addEventListener('animationiteration', () => {
    v2.innerHTML = nextNum(n);
    if (isPage1) {
        card.classList.remove('page1');
        v.style.display = 'block';
        v.style.transform = 'translateY(-50%)';
        v.style.transform = 'rotateX(-180deg)';
        card.classList.add('page2');
        console.log("page2");
        isPage1 = false;
        n = Number.parseInt(v.innerHTML);
        v.innerHTML = nextNum(n);
    } else {
        card.classList.remove('page2');
        v.style.transform = 'translateY(0%)';
        v.style.transform = 'rotateX(0deg)';
        card.classList.add('page1');
        console.log("page1");
        isPage1 = true;
        v3.innerHTML = nextNum(n + 1);
    }
});

const flip = (element) => {

}




