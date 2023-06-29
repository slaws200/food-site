document.addEventListener('DOMContentLoaded', () => {

    const tabs = document.querySelectorAll('.tabheader__item'),
        tabsContent = document.querySelectorAll('.tabcontent'),
        tabsParent = document.querySelector('.tabheader__items');

    function hideTabContent() {
        tabsContent.forEach(item => {
            item.classList.add('hide');
            item.classList.remove('show', 'fade');
        });
        tabs.forEach(item => {
            item.classList.remove('tabheader__item_active');
        });
    }
    function showTabContent(i = 0) {
        tabsContent[i].classList.add('show', 'fade');
        tabsContent[i].classList.remove('hide');
        tabs[i].classList.add('tabheader__item_active');
    }
    hideTabContent();
    showTabContent();

    tabsParent.addEventListener('click', (event) => {
        const target = event.target;

        if(target && target.classList.contains('tabheader__item')){
            tabs.forEach((item, i) => {
                if(target === item){
                    hideTabContent();
                    showTabContent(i);
                }
            });
        }
    })
    // Timer
    const deadline = '2023-07-18T00:00';  
    const endOfSale = document.querySelector('.deadline');

    function getTimeRemaining(endTime){
        let days, hours, minutes, seconds;
        const t = Date.parse(endTime) - Date.parse(new Date());
        if(t <= 0){
            days = 0;
            hours = 0;
            minutes = 0;
            seconds = 0;
        } else {
            days = Math.floor(t/(1000 * 60 * 60 * 24)),
            hours = Math.floor((t / 1000 / 60 / 60) % 24),
            minutes = Math.floor((t / 1000 / 60) % 60),
            seconds = Math.floor((t / 1000) % 60);
        }        

        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds    
        }

    }

    function getZero(num){
        if(num >=0 && num < 10){
            return `0${num}`;
        } else {
            return num;
        }
    }

    function setClock(selector, endtime){
        const timer = document.querySelector(selector);
        const days = timer.querySelector('#days'),
        hours = timer.querySelector('#hours'),
        minutes = timer.querySelector('#minutes'),
        seconds = timer.querySelector('#seconds'),
        timeInterval = setInterval(updClock, 1000);
        updClock();
        

        function updClock(){
            const t = getTimeRemaining(endtime);

            days.innerHTML = getZero(t.days);
            hours.innerHTML = getZero(t.hours);
            minutes.innerHTML = getZero(t.minutes);
            seconds.innerHTML = getZero(t.seconds);

            if(total <= 0){
                clearInterval(timeInterval);
            }
        }
    }
    setClock('.timer', deadline);

    // Модальное окно
    const callModal = document.querySelectorAll('[data-modal]'),
    modal = document.querySelector('.modal'),
    modalClose = modal.querySelectorAll('.modal__close');

    

    function openModal() {
        modal.classList.add('show');
        modal.classList.remove('hide');
        document.body.style.overflow = 'hidden';
    }

    callModal.forEach(btn => {
        btn.addEventListener('click', openModal)
    })

    function closeModal() {
        modal.classList.add('hide');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    modal.addEventListener('click', (e) => {
        if(e.target === modal || e.target.getAttribute('data-close') == ''){
            closeModal();
        }
    })
    document.addEventListener('keydown', (e) => {
        if(e.code === 'Escape' && modal.classList.contains('show')){
            closeModal();
        }
    })

    function showModalByScroll() {
        if(window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight - 1){
            openModal();
            window.removeEventListener('scroll', showModalByScroll)
        }
    }
    window.addEventListener('scroll', showModalByScroll);

    //Используем классы для карточек
    class MenuCard {
        constructor(src, altimg, title, descr, price, parentSelector, ...classes) {
            this.src = src;
            this.altimg = altimg;
            this.title = title;
            this.descr = descr;
            this.price = price * 31;
            this.parent = document.querySelector(parentSelector);
            this.classes = classes;
        }

        render(){
            const element = document.createElement('div');
            if(this.classes.length === 0){
                this.element = 'menu__item';
                element.classList.add(this.element);
            } else {
                this.classes.forEach(className => element.classList.add(className));                
            }
            element.innerHTML = `
                <img src=${this.src} alt=${this.alt}>
                <h3 class="menu__item-subtitle">${this.title}</h3>
                <div class="menu__item-descr">${this.descr}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Цена:</div>
                    <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
                </div>
            ` ;
            this.parent.append(element);
        }
    }
    const getResource = async (url) => {
        const res = await fetch(url);
        if(!res.ok){
            throw new Error(`Could not fetch ${url}, status: ${res.status}`);
        }


        return await res.json();
    };
    getResource('http://localhost:3000/menu')
    .then(data => {
        data.forEach(({img, altimg, title, descr, price}) => {
            new MenuCard(img, altimg, title, descr, price, '.menu .container').render();
        });
    })


    // Формы
    const forms = document.querySelectorAll('form');
    const message = {
        loading: 'img/form/spinner.svg',
        success: 'Спасибо! Скоро мы с вами свяжемся.',
        failure: 'Что-то пошло не так...'
    };
    forms.forEach(item => {
        bindPostData(item);
    })

    const postData = async (url, data) => {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
        });
        return await res.json();
    };

    function bindPostData(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const statusMessage = document.createElement('img');
            statusMessage.src = message.loading;
            statusMessage.style.cssText = `
                display: block;
                margin: auto;
            `;
            form.insertAdjacentElement('afterend', statusMessage);
            
            const formData = new FormData(form);
            const json = JSON.stringify(Object.fromEntries(formData.entries()))

            postData('http://localhost:3000/requests', json)
            .then(data => {
                console.log(data);
                showThanksModal(message.success);
                statusMessage.remove();                
            }).catch(() => {
                showThanksModal(message.failure);
            }).finally(() => {                
                form.reset();
            });
        });
    }

    function showThanksModal(message) {
        const mainModalDialog = document.querySelector('.modal__dialog');
        mainModalDialog.classList.add('hide');

        openModal();
        const thanksModal = document.createElement('div');
        thanksModal.classList.add('modal__dialog');
        thanksModal.innerHTML = `
        <div class="modal__content">
            <div class="modal__close" data-close>&times;</div>
            <div class="modal__title">${message}</div>
        </div>
        `;
        document.querySelector('.modal').append(thanksModal);
        setTimeout(() => {
            thanksModal.remove();
            mainModalDialog.classList.add('show');
            mainModalDialog.classList.remove('hide');
            closeModal();
        }, 3000)
    }
    fetch('http://localhost:3000/menu')
    .then(data => data.json())
    .then(res => console.log(res));

    // Slider
    // const arrows = document.querySelectorAll('.offer__slider-counter [data-arrow]'),
    // slides = document.querySelectorAll('.offer__slide');
    
    // const slider = (arr, imgs) => {
    //     let i = 0;
    //     arr.forEach(item => {
    //         item.addEventListener('click', () => {
    //             if(item == arr[0]){
    //                 imgs[i].style.display = '';
    //                 i--;
    //                 i < 0 ? i = 3 : imgs[i].style.display = 'block';   
    //                 imgs[i].style.display = 'block'                
    //             } else {
    //                 imgs[i].style.display = 'none'; 
    //                 i++;                 
    //                 i > 3 ? i = 0 : imgs[i].style.display = 'block';
    //                 imgs[i].style.display = 'block';
    //             }                
    //             document.querySelector('#current').innerHTML = `0${i+1}`; 
    //         });             
    //     imgs[i].style.display = 'block';
    //     });    
    // }
    // slider(arrows, slides);

    const slides = document.querySelectorAll('.offer__slide'),
    slider = document.querySelector('.offer__slider'),
    prev = document.querySelector('.offer__slider-prev'),
    next = document.querySelector('.offer__slider-next'),
    allSlides = document.querySelector('#total'),
    currentSlide = document.querySelector('#current'),
    slidesWrapper = document.querySelector('.offer__slider-wrapper'),
    slidesField = document.querySelector('.offer__slider-inner'),
    width = window.getComputedStyle(slidesWrapper).width;

    let slideIndex = 1;
    let offset = 0;

    function delNoteDigits (str) {
        return +str.replace(/\D/g, '');
    }

    if(slides.length < 10){
        allSlides.textContent = `0${slides.length}`;
        currentSlide.textContent = `0${slideIndex}`;
    } else {
        allSlides.textContent = slides.length;
        currentSlide.textContent = slideIndex;
    }
    function setCurrentSlide(){        
        if(slides.length < 10){
            currentSlide.textContent = `0${slideIndex}`;
        } else {
            currentSlide.textContent = slideIndex;
        }
    }
    function changeActiveDot(){        
        dotsArray.forEach(dot => dot.style.opacity = '.5');
        dotsArray[slideIndex - 1].style.opacity = '1';
    }

    slidesField.style.width = 100 * slides.length + '%';
    slidesField.style.display = 'flex';    
    slidesField.style.transition = '0.5s all';
    slidesWrapper.style.overflow = 'hidden';

    slides.forEach(slide => {
        slide.style.width = width;
    })

    const dots = document.createElement('ol');
          dotsArray = [];
    dots.style.cssText = `
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 15;
        display: flex;
        justify-content: center;
        margin-right: 15%;
        margin-left: 15%;
        list-style: none;
    `;
    slider.append(dots);

    for(let i = 0; i < slides.length; i++){
        const dot = document.createElement('li');
        dot.setAttribute('data-slide-to', i + 1);
        dot.style.cssText = `
            box-sizing: content-box;
            flex: 0 1 auto;
            width: 30px;
            height: 6px;
            margin-right: 3px;
            margin-left: 3px;
            cursor: pointer;
            background-color: #fff;
            background-clip: padding-box;
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            opacity: .5;
            transition: opacity .6s ease;
        `;
        if(i == 0){
            dot.style.opacity = 1;
        }
        dots.append(dot);        
        dotsArray.push(dot);
    }

    const dot = document.createElement('li');
    dot.style.cssText = `
        box-sizing: content-box;
        flex: 0 1 auto;
        width: 30px;
        height: 6px;
        margin-right: 3px;
        margin-left: 3px;
        cursor: pointer;
        background-color: #fff;
        background-clip: padding-box;
        border-top: 10px solid transparent;
        border-bottom: 10px solid transparent;
        opacity: .5;
        transition: opacity .6s ease;
    `;

    next.addEventListener('click', () => {
        if(offset == delNoteDigits(width) * (slides.length - 1)){
            offset = 0;
        } else {
            offset += delNoteDigits(width);
        }
        slidesField.style.transform = `translateX(-${offset}px)`;
        if(slideIndex == slides.length){
            slideIndex = 1;
        } else {
            slideIndex++;
        }
        setCurrentSlide();
        changeActiveDot();
    })
    prev.addEventListener('click', () => {
        if(offset == 0){
            offset = delNoteDigits(width) * (slides.length - 1);
        } else {
            offset -= delNoteDigits(width);
        }
        slidesField.style.transform = `translateX(-${offset}px)`;
        if(slideIndex == 1){
            slideIndex = slides.length;
        } else {
            slideIndex--;
        }        
        setCurrentSlide();
        changeActiveDot();
    })

    dotsArray.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const slideTo = e.target.getAttribute('data-slide-to');

            slideIndex = slideTo;
            offset = delNoteDigits(width) * (slideTo - 1);
            slidesField.style.transform = `translateX(-${offset}px)`;            
            setCurrentSlide();
            changeActiveDot();            
        })
    })

    // Калькулятор каллорий
    const result = document.querySelector('.calculating__result span');
    let gender, height, weight, age, ratio;

    if(localStorage.getItem('gender')){
        gender = localStorage.getItem('gender');
    } else {
        gender = 'woman';
        localStorage.setItem('gender', gender);
    }
    if(localStorage.getItem('ratio')){
        ratio = localStorage.getItem('ratio');
    } else {
        ratio = 1.375; 
        localStorage.setItem('ratio', ratio);
    }

    function initLocalSettings(selector, activeClass){
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.classList.remove(activeClass);
            if(element.getAttribute('id') === localStorage.getItem('gender')){                
                element.classList.add(activeClass);
            }
            if(element.getAttribute('data-ratio') === localStorage.getItem('ratio')){
                element.classList.add(activeClass);
            }
        });
    }

    initLocalSettings('#gender div', 'calculating__choose-item_active');
    initLocalSettings('.calculating__choose_big div', 'calculating__choose-item_active');

    function calcResult(){
        if(!gender || !height || !weight || !age || !ratio){
            result.textContent = '_____';
            return;
        }
        if(gender === 'woman'){
            result.textContent = ((655.1 + (9.563 * weight) + (1.85 * height) - (4.676 * age)) * ratio).toFixed(0);
        } else {
            result.textContent = ((66.5 + (13.75 * weight) + (5.003 * height) - (6.775 * age)) * ratio).toFixed(0);
        }
    }
    calcResult();

    function getStaticInfo(parentSelector, activeClass){
        const elements = document.querySelectorAll(`${parentSelector} div`);

        elements.forEach(elem => {
            elem.addEventListener('click', (e) => {
                if(e.target.getAttribute('data-ratio')){
                    ratio = e.target.getAttribute('data-ratio');
                    localStorage.setItem('ratio', ratio);
                } else {
                    gender = e.target.getAttribute('id');
                    localStorage.setItem('gender', gender);
                }
                elements.forEach(element => {
                    element.classList.remove(activeClass);
                });
                e.target.classList.add(activeClass);            
                calcResult();
            });
        });
        
    }
    getStaticInfo('#gender', 'calculating__choose-item_active');
    getStaticInfo('.calculating__choose_big', 'calculating__choose-item_active');

    function getDynamicInfo(selector){
        const input = document.querySelector(selector);

        input.addEventListener('input', () => {

            if(input.value.match(/\D/g) ){
                input.style.cssText = 'box-shadow: 1px 1px 10px 2px rgba(255,0,0,0.6); border: 1px solid red;';
            } else {
                input.style.cssText = 'box-shadow: ; border: none;';
            }


            switch(input.getAttribute('id')) {
                case 'height':
                    height = +input.value;
                    break;
                case 'weight':
                    weight = +input.value;
                    break;
                case 'age':
                    age = +input.value;
                    break;
            }  
            calcResult();
        })      
    };
    getDynamicInfo('#height');
    getDynamicInfo('#weight');
    getDynamicInfo('#age');
    
});
