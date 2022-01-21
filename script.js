const loopCarousels = (carousel, index) => {
    const track = carousel.querySelector('.carousel_track');
    const nextButton = carousel.querySelector('.carousel_button-right');
    const prevButton = carousel.querySelector('.carousel_button-left');
    const dotsNav = carousel.querySelector('.carousel_nav');
    const slides = Array.from(track.children);
    let slideWidth = slides[0].getBoundingClientRect().width;
    let transition_speed = carousel.getAttribute('data-transition-speed');
    track.style.transition = transition_speed;

    // Transitionend events
    const moveFromLastToFirst = () => {
        track.removeEventListener('transitionend', moveFromLastToFirst, false);
        const currentSlide = track.querySelector('.current_slide');
        track.style.transition = '1ms';
        moveSlide(currentSlide, currentSlide.parentElement.children[1]);
        track.addEventListener('transitionend', removeZeroTransition);
    }
    const moveFromFirstToLast = () => {
        console.log(moveFromFirstToLast);
        track.removeEventListener('transitionend', moveFromFirstToLast, false);
        const currentSlide = track.querySelector('.current_slide');
        track.style.transition = '1ms';
        moveSlide(currentSlide, currentSlide.parentElement.children[currentSlide.parentElement.childElementCount - 2]);
        track.addEventListener('transitionend', removeZeroTransition);
    }
    const removeZeroTransition = () => {
        track.removeEventListener('transitionend', removeZeroTransition, false);
        track.style.transition = transition_speed;
    }

    // Move Slides Right function
    const moveToNextSlide = () => {
        const currentSlide = track.querySelector('.current_slide');
        const nextSlide = currentSlide.nextElementSibling;
        if(nextSlide) {
            moveSlide(currentSlide, nextSlide);
            if(dotsNav) {
                const currentDot = dotsNav.querySelector('.current_slide');
                const targetDot = currentDot.nextElementSibling || currentDot.parentElement.children[0];
                updateDots(currentDot, targetDot);
            }
        }
    }
    // Move Slides Left function
    const moveToPrevSlide = () => {
        const currentSlide = track.querySelector('.current_slide');
        const prevSlide = currentSlide.previousElementSibling;
        if(prevSlide) {
            moveSlide(currentSlide, prevSlide);
            if(dotsNav) {
                const currentDot = dotsNav.querySelector('.current_slide');
                const targetDot = currentDot.previousElementSibling || currentDot.parentElement.children[currentDot.parentElement.childElementCount - 1];
                updateDots(currentDot, targetDot);
            }
        }
    }
    // Move slides on dot click
    const dotNavClick = (e) => {
        const targetDot = e.target.closest('button');
        if(!targetDot) return;

        const currentSlide = track.querySelector('.current_slide');
        const currentDot = dotsNav.querySelector('.current_slide');
        const targetIndex = Array.from(dotsNav.children).findIndex(dot => dot == targetDot);
        const targetSlide = slides[targetIndex];
        moveSlide(currentSlide, targetSlide);
        updateDots(currentDot, targetDot);
    }
    // Move Slide
    const moveSlide = (current, target) => {
        track.style.transform = 'translateX(-' + target.style.left + ')';
        current.classList.remove('current_slide');
        target.classList.add('current_slide');

        // If last/first element move to other end
        if(!target.nextElementSibling)
            track.addEventListener('transitionend', moveFromLastToFirst);
        else if(!target.previousElementSibling) {
            console.log('Pre - moveFromFirstToLast');
            track.addEventListener('transitionend', moveFromFirstToLast);
        }
    }

    const updateDots = (currentDot, targetDot) => {
        currentDot.classList.remove('current_slide');
        targetDot.classList.add('current_slide');
    }

    // Set Slides Positions
    const setSlidesPosition = (slide, index) => {
        slide.style.left = slideWidth * index + 'px';
    }
    slides.forEach(setSlidesPosition);
    
    // Update slides width and position on window resize
    window.addEventListener("resize", (e) => {
        slideWidth = slides[0].getBoundingClientRect().width;
        slides.forEach(setSlidesPosition);
        const activeSlide = track.querySelector('.current_slide');
        const targetIndex = Array.from(track.children).findIndex(slide => slide == activeSlide);
        
        // Remove transition on page resize and get new current slide position
        track.style.transition = '1ms';
        track.style.transform = 'translateX(-' + slides[targetIndex].style.left + ')';
        track.addEventListener('transitionend', removeZeroTransition);
    });

    // Check if buttons are set and add click event
    if(nextButton)
        nextButton.addEventListener('click', moveToNextSlide);
    if(prevButton)
        prevButton.addEventListener('click', moveToPrevSlide);

    // Check if dots are set and add click event
    if(dotsNav) {
        const dotsNum = slides.length;
        let dot;
        for(let i = 0; i < dotsNum; i++) {
            dot = document.createElement('button');
            if(i == 0) dot.classList.add('current_slide');
            dotsNav.append(dot);
        }
        dotsNav.addEventListener('click', dotNavClick);
    }

    const copyFirst = track.children[0].cloneNode(true);
    const copyLast = track.children[track.childElementCount - 1].cloneNode(true);
    copyFirst.style.left = slideWidth * track.childElementCount + 'px';
    copyLast.style.left = slideWidth * -1 + 'px';
    track.append(copyFirst);
    track.prepend(copyLast);

}

document.querySelectorAll('.carousel').forEach(loopCarousels);