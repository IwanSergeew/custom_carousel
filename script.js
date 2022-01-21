const loopCarousels = (carousel, index) => {
    const track = carousel.querySelector('.carousel_track');
    const nextButton = carousel.querySelector('.carousel_button-right');
    const prevButton = carousel.querySelector('.carousel_button-left');
    const dotsNav = carousel.querySelector('.carousel_nav');
    const slides = Array.from(track.children);
    const slideWidth = slides[0].getBoundingClientRect().width;

    // Set Slides Positions
    slides.forEach((slide, index) => {
        slide.style.left = slideWidth * index + 'px';
    });

    // Move Slides Right function
    const moveToNextSlide = () => {
        const currentSlide = track.querySelector('.current_slide');
        const nextSlide = currentSlide.nextElementSibling || currentSlide.parentElement.children[0];
        const currentDot = dotsNav.querySelector('.current_slide');
        const targetDot = currentDot.nextElementSibling || currentDot.parentElement.children[0];
        moveSlide(currentSlide, nextSlide);
        updateDots(currentDot, targetDot);
    }
    // Move Slides Left function
    const moveToPrevSlide = () => {
        const currentSlide = track.querySelector('.current_slide');
        const prevSlide = currentSlide.previousElementSibling || currentSlide.parentElement.children[currentSlide.parentElement.childElementCount - 1];
        const currentDot = dotsNav.querySelector('.current_slide');
        const targetDot = currentDot.previousElementSibling || currentDot.parentElement.children[currentDot.parentElement.childElementCount - 1];
        moveSlide(currentSlide, prevSlide);
        updateDots(currentDot, targetDot);
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
    }

    const updateDots = (currentDot, targetDot) => {
        currentDot.classList.remove('current_slide');
        targetDot.classList.add('current_slide');
    }

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

    /* let copy = track.children[0].cloneNode(true);
    track.append(copy); */
}

document.querySelectorAll('.carousel').forEach(loopCarousels);