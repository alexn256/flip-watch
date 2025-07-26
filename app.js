class FlipWatch {
    constructor() {
        this.isInitialized = false;
        this.animationFrameId = null;
        this.lastSecond = -1;
        
        this.initializeElements();
        this.initializeCards();
        this.startClock();
        this.setupErrorHandling();
    }

    initializeElements() {
        try {
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

            // Validate all elements exist
            Object.values(this.elements).forEach(timeUnit => {
                if (!timeUnit.container || !timeUnit.tens || !timeUnit.ones) {
                    throw new Error('Required DOM elements not found');
                }
            });
        } catch (error) {
            console.error('Failed to initialize elements:', error);
            this.showError('Clock initialization failed');
        }
    }

    initializeCards() {
        try {
            const currentTime = new Date();
            const hours = currentTime.getHours();
            const minutes = currentTime.getMinutes();
            const seconds = currentTime.getSeconds();

            // Initialize display values
            this.initializePairCards(this.elements.seconds, seconds);
            this.initializePairCards(this.elements.minutes, minutes);
            this.initializePairCards(this.elements.hours, hours);

            // Create flip card instances with proper error handling
            this.flipCards = {
                secondsOnes: new FlipCard(this.elements.seconds.ones, 'sec-state-1', 'sec-state-2', 9),
                secondsTens: new FlipCard(this.elements.seconds.tens, 'state-1', 'state-2', 5),
                minutesOnes: new FlipCard(this.elements.minutes.ones, 'state-1', 'state-2', 9),
                minutesTens: new FlipCard(this.elements.minutes.tens, 'state-1', 'state-2', 5),
                hoursOnes: new FlipCard(this.elements.hours.ones, 'state-1', 'state-2', 9),
                hoursTens: new FlipCard(this.elements.hours.tens, 'state-1', 'state-2', 2)
            };

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize cards:', error);
            this.showError('Card initialization failed');
        }
    }

    initializePairCards(pairElements, timeValue) {
        const onesValue = timeValue % 10;
        const tensValue = Math.floor(timeValue / 10);
        
        this.initializeCard(pairElements.ones, onesValue);
        this.initializeCard(pairElements.tens, tensValue);
    }

    initializeCard(cardElement, value) {
        try {
            const upValue = cardElement.querySelector('.up .v');
            const lowValue = cardElement.querySelector('.low .v');
            const backValue = cardElement.querySelector('.back .v');
            
            if (!upValue || !lowValue || !backValue) {
                throw new Error('Card elements not found');
            }
            
            upValue.textContent = value.toString().padStart(1, '0');
            lowValue.textContent = value.toString().padStart(1, '0');
            backValue.textContent = this.getNextValue(value, this.getMaxValue(cardElement)).toString().padStart(1, '0');
        } catch (error) {
            console.error('Failed to initialize card:', error);
        }
    }

    getMaxValue(cardElement) {
        const id = cardElement.id;
        if (id.includes('s-o') || id.includes('m-o')) return 5;
        if (id.includes('h-o')) return 2;
        if (id.includes('o-h')) {
            // Dynamic max for hours ones based on tens
            const hoursTens = parseInt(this.elements.hours.tens.querySelector('.up .v').textContent) || 0;
            return hoursTens >= 2 ? 3 : 9;
        }
        return 9;
    }

    getNextValue(current, max) {
        return current >= max ? 0 : current + 1;
    }

    startClock() {
        if (!this.isInitialized) {
            console.error('Cannot start clock: not initialized');
            return;
        }

        try {
            // Start the main animation loop
            this.flipCards.secondsOnes.startAnimation();
            
            // Set up cascade events
            this.setupCascadeEvents();
            
            // Start the main clock loop
            this.clockLoop();
            
            console.log('Flip Watch started successfully!');
        } catch (error) {
            console.error('Failed to start clock:', error);
            this.showError('Clock start failed');
        }
    }

    clockLoop() {
        const now = new Date();
        const currentSecond = now.getSeconds();
        
        // Only process when second changes
        if (currentSecond !== this.lastSecond) {
            this.lastSecond = currentSecond;
            this.handleSecondChange(now);
        }
        
        // Schedule next frame
        this.animationFrameId = requestAnimationFrame(() => this.clockLoop());
    }

    handleSecondChange(now) {
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // Trigger appropriate flips based on time changes
        if (seconds === 0) {
            if (minutes === 0) {
                // Hour change
                this.synchronizeTime(hours, minutes, seconds);
            } else {
                // Minute change
                this.flipCards.minutesOnes.flip();
                if (minutes % 10 === 0) {
                    this.flipCards.minutesTens.flip();
                }
            }
        }
    }

    setupCascadeEvents() {
        // Seconds ones animation triggers the cascade
        this.elements.seconds.ones.addEventListener('animationiteration', (e) => {
            if (e.animationName === 'flip-down' || e.animationName === 'flip-up') {
                this.flipCards.secondsOnes.flip();
                
                const currentValue = parseInt(this.flipCards.secondsOnes.getCurrentValue());
                if (currentValue === 9) {
                    setTimeout(() => this.flipCards.secondsTens.flip(), 50);
                }
            }
        });

        // Set up other cascade events with proper timing
        this.setupCascadeEvent(this.elements.seconds.tens, this.flipCards.secondsTens, this.flipCards.minutesOnes);
        this.setupCascadeEvent(this.elements.minutes.ones, this.flipCards.minutesOnes, this.flipCards.minutesTens);
        this.setupCascadeEvent(this.elements.minutes.tens, this.flipCards.minutesTens, this.flipCards.hoursOnes);
        this.setupCascadeEvent(this.elements.hours.ones, this.flipCards.hoursOnes, this.flipCards.hoursTens);
        
        // Hours tens completes the cycle
        this.elements.hours.tens.addEventListener('animationend', () => {
            this.flipCards.hoursTens.handleAnimationEnd();
        });
    }

    setupCascadeEvent(element, currentCard, nextCard) {
        element.addEventListener('animationend', () => {
            currentCard.handleAnimationEnd();
            
            if (currentCard.shouldTriggerNext()) {
                setTimeout(() => nextCard.flip(), 100);
            }
        });
    }

    synchronizeTime(hours, minutes, seconds) {
        try {
            // Update all displays to current time
            this.initializePairCards(this.elements.seconds, seconds);
            this.initializePairCards(this.elements.minutes, minutes);
            this.initializePairCards(this.elements.hours, hours);
            
            // Reset flip card states
            Object.values(this.flipCards).forEach(card => {
                card.reset();
            });
        } catch (error) {
            console.error('Failed to synchronize time:', error);
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showError('An unexpected error occurred');
        });

        // Handle visibility change to resync when tab becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isInitialized) {
                const now = new Date();
                this.synchronizeTime(now.getHours(), now.getMinutes(), now.getSeconds());
            }
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(231, 76, 60, 0.9);
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            font-family: inherit;
            z-index: 1000;
            backdrop-filter: blur(10px);
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        Object.values(this.flipCards || {}).forEach(card => {
            if (card.destroy) card.destroy();
        });
    }
}

class FlipCard {
    constructor(element, state1Class, state2Class, maxValue, startInState1 = true) {
        this.element = element;
        this.state1Class = state1Class;
        this.state2Class = state2Class;
        this.maxValue = maxValue;
        this.isInState1 = startInState1;
        this.isAnimating = false;
        
        try {
            this.upCard = element.querySelector('.up');
            this.upValue = element.querySelector('.up .v');
            this.lowValue = element.querySelector('.low .v');
            this.backValue = element.querySelector('.back .v');
            
            if (!this.upCard || !this.upValue || !this.lowValue || !this.backValue) {
                throw new Error('Required card elements not found');
            }
            
            this.currentValue = parseInt(this.upValue.textContent) || 0;
        } catch (error) {
            console.error('FlipCard initialization error:', error);
        }
    }

    startAnimation() {
        if (!this.upCard) return;
        
        try {
            this.upCard.classList.add(this.state1Class);
        } catch (error) {
            console.error('Failed to start animation:', error);
        }
    }

    flip() {
        if (this.isAnimating || !this.upCard) return;
        
        try {
            this.isAnimating = true;
            this.lowValue.textContent = this.upValue.textContent;
            
            if (this.isInState1) {
                this.upCard.classList.remove(this.state1Class);
                this.upCard.classList.add(this.state2Class);
                this.isInState1 = false;
                
                this.currentValue = parseInt(this.upValue.textContent) || 0;
                const nextValue = this.getNextValue();
                this.upValue.textContent = nextValue.toString().padStart(1, '0');
                this.lowValue.textContent = this.currentValue.toString().padStart(1, '0');
            } else {
                this.upCard.classList.remove(this.state2Class);
                this.upCard.classList.add(this.state1Class);
                this.isInState1 = true;
                
                const backValue = parseInt(this.upValue.textContent) || 0;
                this.backValue.textContent = this.getNextValue(backValue).toString().padStart(1, '0');
            }
            
            // Reset animation flag after animation completes
            setTimeout(() => {
                this.isAnimating = false;
            }, 600);
            
        } catch (error) {
            console.error('Flip error:', error);
            this.isAnimating = false;
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
        try {
            const nextValue = this.getNextValue(this.currentValue);
            this.lowValue.textContent = nextValue.toString().padStart(1, '0');
        } catch (error) {
            console.error('Post-flip cleanup error:', error);
        }
    }

    shouldTriggerNext() {
        return !this.isInState1 && (this.currentValue + 1) > this.maxValue;
    }

    getCurrentValue() {
        return this.upValue ? this.upValue.textContent : '0';
    }

    getNextValue(value = this.currentValue) {
        return value >= this.maxValue ? 0 : value + 1;
    }

    reset() {
        try {
            this.isAnimating = false;
            this.isInState1 = true;
            this.upCard.classList.remove(this.state1Class, this.state2Class);
            this.currentValue = parseInt(this.upValue.textContent) || 0;
        } catch (error) {
            console.error('Reset error:', error);
        }
    }

    destroy() {
        if (this.upCard) {
            this.upCard.classList.remove(this.state1Class, this.state2Class);
        }
    }
}

// Initialize the flip watch when the page loads
let flipWatch = null;

document.addEventListener('DOMContentLoaded', () => {
    try {
        flipWatch = new FlipWatch();
    } catch (error) {
        console.error('Failed to initialize FlipWatch:', error);
    }
});

// Add loading animation and cleanup
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (flipWatch && flipWatch.destroy) {
        flipWatch.destroy();
    }
});

// Handle page visibility for better performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when tab is not visible
        document.body.style.animationPlayState = 'paused';
    } else {
        // Resume animations when tab becomes visible
        document.body.style.animationPlayState = 'running';
    }
});