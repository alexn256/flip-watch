class FlipWatch {
    constructor() {
        this.initializeElements();
        this.initializeCards();
        this.startClock();
    }

    initializeElements() {
        this.elements = {
            seconds: {
                container: document.querySelector('#seconds'),
                tens: document.querySelector("#s-o"),
                ones: document.querySelector("#o-s")
            },
            minutes: {
                container: document.querySelector('#minutes'),
                tens: document.querySelector("#m-o"),
                ones: document.querySelector("#o-m")
            },
            hours: {
                container: document.querySelector('#hours'),
                tens: document.querySelector("#h-o"),
                ones: document.querySelector("#o-h")
            }
        };
    }

    initializeCards() {
        const currentTime = new Date();
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const seconds = currentTime.getSeconds();

        // Initialize display values
        this.initializePairCards(this.elements.seconds, seconds);
        this.initializePairCards(this.elements.minutes, minutes);
        this.initializePairCards(this.elements.hours, hours);

        // Create flip card instances
        this.flipCards = {
            secondsOnes: new FlipCard(this.elements.seconds.ones, 'sec-state-1', 'sec-state-2', 9),
            secondsTens: new FlipCard(this.elements.seconds.tens, 'state-1', 'state-2', 5),
            minutesOnes: new FlipCard(this.elements.minutes.ones, 'state-1', 'state-2', 9),
            minutesTens: new FlipCard(this.elements.minutes.tens, 'state-1', 'state-2', 5),
            hoursOnes: new FlipCard(this.elements.hours.ones, 'state-1', 'state-2', 9),
            hoursTens: new FlipCard(this.elements.hours.tens, 'state-1', 'state-2', 2)
        };
    }

    initializePairCards(pairElements, timeValue) {
        const onesValue = timeValue % 10;
        const tensValue = Math.floor(timeValue / 10);
        
        this.initializeCard(pairElements.ones, onesValue);
        this.initializeCard(pairElements.tens, tensValue);
    }

    initializeCard(cardElement, value) {
        const upValue = cardElement.querySelector('.up .v');
        const lowValue = cardElement.querySelector('.low .v');
        const backValue = cardElement.querySelector('.back .v');
        
        upValue.textContent = value;
        lowValue.textContent = value;
        backValue.textContent = this.getNextValue(value, this.getMaxValue(cardElement));
    }

    getMaxValue(cardElement) {
        const id = cardElement.id;
        if (id.includes('s-o') || id.includes('m-o') || id.includes('h-o')) return 5;
        if (id.includes('h-')) return 2;
        return 9;
    }

    getNextValue(current, max) {
        return current >= max ? 0 : current + 1;
    }

    startClock() {
        // Start the seconds animation
        this.flipCards.secondsOnes.startAnimation();
        
        // Set up the cascade timing
        this.setupCascadeEvents();
        
        // Update time every second to stay synchronized
        setInterval(() => {
            this.synchronizeTime();
        }, 60000); // Check every minute for synchronization
    }

    setupCascadeEvents() {
        // Seconds ones triggers seconds tens
        this.elements.seconds.ones.addEventListener('animationiteration', () => {
            this.flipCards.secondsOnes.flip();
            
            const currentValue = parseInt(this.flipCards.secondsOnes.getCurrentValue());
            if (currentValue === 9) {
                this.flipCards.secondsTens.flip();
            }
        });

        // Seconds tens triggers minutes ones
        this.elements.seconds.tens.addEventListener('animationend', () => {
            this.flipCards.secondsTens.handleAnimationEnd();
            
            if (this.flipCards.secondsTens.shouldTriggerNext()) {
                this.flipCards.minutesOnes.flip();
            }
        });

        // Minutes ones triggers minutes tens
        this.elements.minutes.ones.addEventListener('animationend', () => {
            this.flipCards.minutesOnes.handleAnimationEnd();
            
            if (this.flipCards.minutesOnes.shouldTriggerNext()) {
                this.flipCards.minutesTens.flip();
            }
        });

        // Minutes tens triggers hours ones
        this.elements.minutes.tens.addEventListener('animationend', () => {
            this.flipCards.minutesTens.handleAnimationEnd();
            
            if (this.flipCards.minutesTens.shouldTriggerNext()) {
                this.flipCards.hoursOnes.flip();
            }
        });

        // Hours ones triggers hours tens
        this.elements.hours.ones.addEventListener('animationend', () => {
            // Adjust max value for hours based on tens digit
            const hoursTensValue = parseInt(this.flipCards.hoursTens.getCurrentValue());
            this.flipCards.hoursOnes.maxValue = hoursTensValue >= 2 ? 3 : 9;
            
            this.flipCards.hoursOnes.handleAnimationEnd();
            
            if (this.flipCards.hoursOnes.shouldTriggerNext()) {
                this.flipCards.hoursTens.flip();
            }
        });

        // Hours tens completes the cycle
        this.elements.hours.tens.addEventListener('animationend', () => {
            this.flipCards.hoursTens.handleAnimationEnd();
        });
    }

    synchronizeTime() {
        const currentTime = new Date();
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const seconds = currentTime.getSeconds();

        // Only synchronize if we're significantly off
        if (seconds === 0 && minutes === 0) {
            this.resynchronize(hours, minutes, seconds);
        }
    }

    resynchronize(hours, minutes, seconds) {
        // Update all displays to current time
        this.initializePairCards(this.elements.seconds, seconds);
        this.initializePairCards(this.elements.minutes, minutes);
        this.initializePairCards(this.elements.hours, hours);
    }
}

class FlipCard {
    constructor(element, state1Class, state2Class, maxValue, startInState1 = true) {
        this.element = element;
        this.state1Class = state1Class;
        this.state2Class = state2Class;
        this.maxValue = maxValue;
        this.isInState1 = startInState1;
        
        this.upCard = element.querySelector('.up');
        this.upValue = element.querySelector('.up .v');
        this.lowValue = element.querySelector('.low .v');
        this.backValue = element.querySelector('.back .v');
        
        this.currentValue = parseInt(this.upValue.textContent) || 0;
    }

    startAnimation() {
        this.upCard.classList.add(this.state1Class);
    }

    flip() {
        this.lowValue.textContent = this.upValue.textContent;
        
        if (this.isInState1) {
            this.upCard.classList.remove(this.state1Class);
            this.upCard.classList.add(this.state2Class);
            this.isInState1 = false;
            
            this.currentValue = parseInt(this.upValue.textContent);
            this.upValue.textContent = this.getNextValue();
            this.lowValue.textContent = this.currentValue;
        } else {
            this.upCard.classList.remove(this.state2Class);
            this.upCard.classList.add(this.state1Class);
            this.isInState1 = true;
            
            const backValue = parseInt(this.upValue.textContent);
            this.backValue.textContent = this.getNextValue(backValue);
        }
    }

    handleAnimationEnd() {
        if (!this.isInState1) {
            this.flip();
        } else {
            this.postFlipCleanup();
        }
    }

    postFlipCleanup() {
        this.lowValue.textContent = this.getNextValue(this.currentValue);
    }

    shouldTriggerNext() {
        return !this.isInState1 && (this.currentValue + 1) > this.maxValue;
    }

    getCurrentValue() {
        return this.upValue.textContent;
    }

    getNextValue(value = this.currentValue) {
        return value >= this.maxValue ? 0 : value + 1;
    }
}

// Initialize the flip watch when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FlipWatch();
});

// Add some visual feedback for loading
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    console.log('Flip Watch initialized successfully!');
});