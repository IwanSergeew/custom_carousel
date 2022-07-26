class Carousel {
    constructor({
        selector,
        transitionSpeed = 300,
        transitionExtra = 'linear',
        draggable = true,
        dragSens = 1.5,
        loop = true,
        perPage = 2,
        autoScroll = 5
    }) {
        if(!selector) return console.error('Invalid carousel selector provided');
        this.carousel = typeof(selector) == 'string' ? document.querySelector(selector) : selector;
        if(!transitionSpeed || transitionSpeed < 1) return console.error('Transition Speed can not be less than 1');
        else this.transitionSpeed = transitionSpeed;
        this.transitionExtra = transitionExtra;
        this.track = this.carousel.querySelector('.carousel_track');
        this.track.style = 'transform: translateX(0px);';
        this.nextBtn = this.carousel.querySelector('.carousel_button-right');
        this.prevBtn = this.carousel.querySelector('.carousel_button-left');
        this.dotsNav = this.carousel.querySelector('.carousel_nav');
        this.trackWidth = this.track.getBoundingClientRect().width;
        this.autoScroll = autoScroll;
        this.dragSens = dragSens;
        this.loop = loop;
        this.perPage = perPage;
        this.lastMousePosX = null;
        this.autoScrollTimeOut = null;

        // Check if buttons are set and add click event
        if(this.nextBtn) this.nextBtn.addEventListener('click', this.moveToNextSlide);
        if(this.prevBtn) this.prevBtn.addEventListener('click', this.moveToPrevSlide);
        
        // Get mouse events if draggable
        if(draggable) {
            window.addEventListener("mousemove", this.mouseMoveEvent);
            window.addEventListener("mouseup", this.mouseUpEvent);
            this.track.querySelectorAll('.carousel_slide').forEach(child => {
                child.setAttribute('draggable', 'true');
                child.addEventListener('mousedown', this.mouseDownOnSlide);
            })
        }

        // Check if dots are set and add click event
        if(this.dotsNav) {
            const dotsNum = this.track.children.length;
            let dot;
            for(let i = 0; i < dotsNum; i++) {
                dot = document.createElement('button');
                if(i == 0) dot.classList.add('current_slide');
                this.dotsNav.append(dot);
                dot.addEventListener('click', this.dotNavClick);
            }
        }

        this.addExtraFirstAndLast();

        this.setSlidesPosition(this.track.children);

        // Update slides width and position on window resize
        window.addEventListener("resize", this.windowResizeEvent);

        this.setAutoScrollTimeout();
    }

    windowResizeEvent = () => {
        const children = this.track.children;
        this.setSlidesPosition(children);
        const activeSlide = track.querySelector('.current_slide');
        const targetIndex = Array.from(children).findIndex(slide => slide == activeSlide);
        
        // Remove transition on page resize and get new current slide position
        this.track.style.transform = `translateX(-${slides[targetIndex].style.left})`;
    }

    setCarouselPosition = (position) => {
        if(position >= this.trackWidth) this.track.style.transform = `translateX(${(((this.track.childElementCount - 3) * this.trackWidth) * -1)}px)`;
        else if(position <= (((this.track.childElementCount - 2) * this.trackWidth) * -1)) this.track.style.transform = `translateX(0px)`;
        else this.track.style.transform = `translateX(${position}px)`;
    }

    snapClosestAfterDrag = () => {
        // Get current translate propperty value
        let translateX = this.convertTranslateX(this.track.style.transform);

        // Dragged before first element
        if(translateX > (this.trackWidth / 2)) {
            this.moveSlide(this.track.querySelector('.current_slide'), this.track.children[0]);
            return;
        }

        if(translateX < (((this.track.childElementCount - 2) * this.trackWidth) * -1)) {
            this.moveSlide(this.track.querySelector('.current_slide'), this.track.children[this.track.childElementCount - 2]);
            return;
        }

        // Convert to positive value
        if(translateX < 0) translateX *= -1;

        let closestChild = -1;
        let closestBy = null;
        let distance;

        // Find closest slider in track
        for(let i = 0; i < this.track.childElementCount; i++) {
            distance = this.convertTranslateX(this.track.children[i].style.transform) - translateX;
            if(distance < 0) distance *= -1;
            
            if(closestBy == null || distance < closestBy) {
                closestBy = distance;
                closestChild = i;
            }
        }

        // Move slider
        this.moveSlide(this.track.querySelector('.current_slide'), this.track.children[closestChild]);
    }

    convertTranslateX = (transform) => {
        const res = transform.match(/translateX\(([0-9\.?\-?]+(px|em|%|ex|ch|rem|vh|vw|vmin|vmax|mm|cm|in|pt|pc))\)/);
        return res ? Number(res[1].replace('px', '')) : 0;
    }

    // Move Slides Right function
    moveToNextSlide = () => {
        const currentSlide = this.track.querySelector('.current_slide');
        let nextSlide = currentSlide.nextElementSibling;
        if(!nextSlide) {
            this.track.style.transition = 'unset';
            this.setCarouselPosition(this.trackWidth);
            nextSlide = this.track.children[1];
        }
        this.track.style.transition = `transform ${this.transitionSpeed}ms ${this.transitionExtra}`;
        this.moveSlide(currentSlide, nextSlide);
    }
    // Move Slides Left function
    moveToPrevSlide = () => {
        const currentSlide = this.track.querySelector('.current_slide');
        let prevSlide = currentSlide.previousElementSibling;
        if(!prevSlide) {
            this.track.style.transition = 'unset';
            this.setCarouselPosition(((this.track.childElementCount - 2) * this.trackWidth) * -1);
            prevSlide = this.track.children[this.track.childElementCount - 3];
        }
        this.track.style.transition = `transform ${this.transitionSpeed}ms ${this.transitionExtra}`;
        this.moveSlide(currentSlide, prevSlide);
    }
    // Move slides on dot click
    dotNavClick = (e) => {
        const index = Array.from(this.dotsNav.children).findIndex(dot => dot == e.currentTarget);
        const currentSlide = this.track.querySelector('.current_slide');
        this.track.style.transition = `transform ${this.transitionSpeed}ms ${this.transitionExtra}`;
        this.moveSlide(currentSlide, this.track.children[index + 1]);
    }
    
    // Move Slide
    moveSlide = (current, target) => {
        clearTimeout(this.autoScrollTimeOut);
        this.autoScrollTimeOut = null;
        this.track.removeEventListener('transitionend', this.slideTransitionEnd);

        current.classList.remove('current_slide');
        target.classList.add('current_slide');

        const targetTranslateX = this.convertTranslateX(target.style.transform);
        this.track.style.transform = `translateX(${targetTranslateX * -1}px)`;

        this.track.addEventListener('transitionend', this.slideTransitionEnd);
        
        if(this.dotsNav) this.updateDots();

        this.setAutoScrollTimeout();
    }

    slideTransitionEnd = (e) => {
        this.track.style.transition = 'unset';
        const currentSlide = this.track.querySelector('.current_slide');
        if(!currentSlide.nextElementSibling) {
            this.track.style.transform = `translateX(0px)`;
            this.track.querySelector('.current_slide').classList.remove('current_slide');
            this.track.children[1].classList.add('current_slide');
            if(this.dotsNav) this.updateDots();
        }
        else if(!currentSlide.previousElementSibling) {
            this.track.style.transform = `translateX(${((this.track.childElementCount - 3) * this.trackWidth) * -1}px)`;
            this.track.querySelector('.current_slide').classList.remove('current_slide');
            this.track.children[this.track.childElementCount - 2].classList.add('current_slide');
            if(this.dotsNav) this.updateDots();
        }
    }

    // Mouse down on track
    mouseDownOnSlide = (e) => {
        clearTimeout(this.autoScrollTimeOut);
        this.autoScrollTimeOut = null;
        let atrClass;
        const targetSlide = e.composedPath().find(el => {
            atrClass = el.getAttribute('class');
            return (atrClass && atrClass.includes('carousel_slide'));
        });
        if(targetSlide) {
            e.preventDefault();
            const translateX = this.convertTranslateX(this.track.style.transform);
            this.setCarouselPosition(translateX);
            this.lastMousePosX = e.screenX;
        }
    }
    // Mouse move
    mouseMoveEvent = (e) => {
        if(this.lastMousePosX != null) {
            e.preventDefault();

            let el = e.target;
            while(el = el.parentElement) {
                if(el.classList.contains('carousel_slide')) {
                    const amount = (e.screenX - this.lastMousePosX) * this.dragSens;
                    const translateX = this.convertTranslateX(this.track.style.transform);
                    if(isNaN(translateX)) return;
                    this.setCarouselPosition(translateX + amount);
                    this.lastMousePosX = e.screenX;
                    return;
                }
            }

            this.mouseUpEvent(e);
        }
    }
    // Mouse up
    mouseUpEvent = (e) => {
        if(this.lastMousePosX != null) {
            e.preventDefault();
            this.lastMousePosX = null;
            this.snapClosestAfterDrag();
        }
    }

    updateDots = (index = -1) => {
        if(index < 0) {
            const currentSlide = this.track.querySelector('.current_slide');
            index = Array.from(this.track.children).findIndex(el => el == currentSlide);
            index -= 1;
        }
        if(index < 0) index = this.dotsNav.childElementCount - 1;
        if(index >= this.dotsNav.childElementCount) index = 0;
        const currentSlide = this.dotsNav.querySelector('.current_slide');
        currentSlide?.classList?.remove('current_slide');
        this.dotsNav.children[index].classList.add('current_slide');
    }

    setSlidesPosition = (slides) => {
        for(let i = 0; i < slides.length; i++) {
            slides[i].style.transform = `translateX(${this.trackWidth * (i-1)}px)`;
        }
    }

    autoScrollFunc = () => {
        const currentSlide = this.track.querySelector('.current_slide');
        const targetSlide = currentSlide.nextElementSibling || this.track.children[1];
        this.track.style.transition = `transform ${this.transitionSpeed}ms ${this.transitionExtra}`;
        this.moveSlide(currentSlide, targetSlide);
    }

    setAutoScrollTimeout = () => {
        if(this.autoScroll) {
            this.autoScrollTimeOut = setTimeout(this.autoScrollFunc, (this.autoScroll * 1000))
        }
    }

    addExtraFirstAndLast = () => {
        const first = this.track.children[0].cloneNode(true);
        const last = this.track.children[this.track.childElementCount-1].cloneNode(true);
        first.addEventListener('mousedown', this.mouseDownOnSlide);
        last.addEventListener('mousedown', this.mouseDownOnSlide);
        first.classList.remove('current_slide');
        last.classList.remove('current_slide');
        this.track.append(first);
        this.track.prepend(last);
    }
}

// window.addEventListener('DOMContentLoaded', (event) => {
//     const couraselElements = document.querySelectorAll('[data-carousel-html]');
//     if(couraselElements.length > 0)
//         couraselElements.forEach(e => new Carousel({
//             selector: e,

//         }));
// });