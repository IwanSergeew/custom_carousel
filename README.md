
# Javascript/PHP/MySQL DataTable

Vanilla Javascript DataTable using PHP as back end to fetch data from MySQL.

## Usage/Examples

```html
<head>
  ...
  <script src="carousel.js"></script>
</head>
<body>
  <div class="carousel" id="carousel">
        <div class="carousel_container">
            <ul class="carousel_track">
                <li class="carousel_slide current_slide">
                    <img src="img/1.jpg" alt="Image 1">
                </li>
                <li class="carousel_slide">
                    <img src="img/2.jpg" alt="Image 2">
                </li>
                <li class="carousel_slide">
                    <img src="img/3.jpg" alt="Image 3">
                </li>
                <li class="carousel_slide">
                    <img src="img/4.jpg" alt="Image 4">
                </li>
            </ul>
        </div>

        <button class="carousel_button carousel_button-left"><</button>

        <button class="carousel_button carousel_button-right">></button>

        <div class="carousel_nav"></div>
    </div>
    
    <script>
        const carousel = new Carousel({
            selector: '#carousel',
            transitionSpeed: 300,
            draggable: true,
            dragSens: 1.5,
            loop: true,
            perPage: 2
        })
    </script>
</body>
```

## Screenshots

![App Screenshot](https://gcdnb.pbrd.co/images/r3R6SDRcYKOS.gif?o=1)

