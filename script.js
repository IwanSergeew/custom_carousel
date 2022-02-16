const loopCarousels = (carousel, index) => {
    const track = carousel.querySelector('.carousel_track');
    const nextButton = carousel.querySelector('.carousel_button-right');
    const prevButton = carousel.querySelector('.carousel_button-left');
    const dotsNav = carousel.querySelector('.carousel_nav');
    const slides = Array.from(track.children);
    let slideWidth = slides[0].getBoundingClientRect().width;
    let transition_speed = carousel.getAttribute('courasel-transition-speed');
    const draggable = carousel.getAttribute('courasel-draggable');
    let lastMousePosX = null;
    let lastMoveTime = new Date().getTime();

    track.style.transition = transition_speed;
    track.style.transform = 'translateX(0px)';

    // Transitionend events
    const moveFromLastToFirst = () => {
        track.removeEventListener('transitionend', moveFromLastToFirst, false);
        const currentSlide = track.querySelector('.current_slide');
        track.style.transition = '1ms';
        moveSlide(currentSlide, currentSlide.parentElement.children[1]);
        track.addEventListener('transitionend', removeZeroTransition);
    }
    const moveFromFirstToLast = () => {
        track.removeEventListener('transitionend', moveFromFirstToLast, false);
        const currentSlide = track.querySelector('.current_slide');
        const lastSlide = currentSlide.parentElement.children[currentSlide.parentElement.childElementCount - 2];
        track.style.transition = '1ms';
        moveSlide(currentSlide, lastSlide);
        track.addEventListener('transitionend', removeZeroTransition);
    }
    const removeZeroTransition = () => {
        track.removeEventListener('transitionend', removeZeroTransition, false);
        track.style.transition = transition_speed;
    }

    // Courasel Drag function
    const dragCourasel = (x) => {
        const transform = track.style.transform;
        if(transform) {
            const px = Number(transform.replace('translateX(', '').replace('px)', '')) || 0;
            track.style.transform = `translateX(${(px + x)}px)`;
        }
    }
    const snapClosestAfterDrag = () => {
        let translate = Number(track.style.transform.replace('translateX(', '').replace('px)', '')) || 0;

        // Dragged before first element
        if(translate > 0) {
            moveSlide(track.querySelector('.current_slide'), track.children[track.childElementCount - 2]);
            if(dotsNav) {
                const currentDot = dotsNav.querySelector('.current_slide');
                const targetDot = dotsNav.children[dotsNav.childElementCount - 1];
                updateDots(currentDot, targetDot);
            }
            return;
        }

        if(translate < 0) translate *= -1;

        const count = track.childElementCount;
        let closestChild = -1;
        let closestBy = null;

        for(let i = 0; i < count; i++) {
            distance = Number(track.children[i].style.left.replace('px', '')) - translate;
            if(distance < 0) distance *= -1;
            
            if(closestBy == null || distance < closestBy) {
                closestBy = distance;
                closestChild = i;
            }
        }

        // Dragged after last element
        if(closestChild >= count - 1) {
            moveSlide(track.querySelector('.current_slide'), track.children[1]);
            if(dotsNav) {
                const currentDot = dotsNav.querySelector('.current_slide');
                const targetDot = dotsNav.children[0];
                updateDots(currentDot, targetDot);
            }
            return;
        }

        moveSlide(track.querySelector('.current_slide'), track.children[closestChild]);
        if(dotsNav) {
            const currentDot = dotsNav.querySelector('.current_slide');
            const targetDot = dotsNav.children[closestChild - 1];
            updateDots(currentDot, targetDot);
        }
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
        if(target.style.left[0] == '-')
            track.style.transform = 'translateX(' + target.style.left.replace('-', '') + ')';
        else
            track.style.transform = 'translateX(-' + target.style.left + ')';
        current.classList.remove('current_slide');
        target.classList.add('current_slide');

        // If last/first element move to other end
        if(!target.nextElementSibling)
            track.addEventListener('transitionend', moveFromLastToFirst);
        else if(!target.previousElementSibling)
            track.addEventListener('transitionend', moveFromFirstToLast);
    }
    // Mouse down on track
    const mouseDownOnSlide = (e) => {
        let atrClass;
        const targetSlide = e.path.find(el => {
            atrClass = el.getAttribute('class');
            return (atrClass && atrClass.includes('carousel_slide'));
        });
        if(targetSlide) {
            e.preventDefault();
            lastMousePosX = e.screenX;
        }
    }
    // Mouse move
    const mouseMoveEvent = (e) => {
        if(lastMousePosX != null) {
            e.preventDefault();

            const time = new Date().getTime();
            if(time - lastMoveTime > 50) {
                lastMoveTime = time;
                dragCourasel(e.screenX-lastMousePosX);
                lastMousePosX = e.screenX;
            }
        }
    }
    // Mouse up
    const mouseUpEvent = (e) => {
        if(lastMousePosX != null) {
            e.preventDefault();
            lastMousePosX = null;
            snapClosestAfterDrag();
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
    window.addEventListener("mousemove", mouseMoveEvent);
    window.addEventListener("mouseup", mouseUpEvent);

    // Check if buttons are set and add click event
    if(nextButton)
        nextButton.addEventListener('click', moveToNextSlide);
    if(prevButton)
        prevButton.addEventListener('click', moveToPrevSlide);
    
    // Get mouse events if draggable
    if(draggable) {
        track.querySelectorAll('.carousel_slide').forEach(child => {
            child.setAttribute('draggable', 'true');
            child.addEventListener('mousedown', mouseDownOnSlide);
        })

    }

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