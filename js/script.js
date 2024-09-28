'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const tab_wrapper = document.querySelector('.tabcontainer'),
        tabs = tab_wrapper.querySelectorAll('.tabcontent'),
        tab_list_items = tab_wrapper.querySelectorAll('.tabheader__item'),
        tab_list_items_parent = tab_wrapper.querySelector('.tabheader__items'),

        span_days = document.querySelector('span#days'),
        span_hours = document.querySelector('span#hours'),
        span_minutes = document.querySelector('span#minutes'),
        span_seconds = document.querySelector('span#seconds'),

        modalButtons = document.querySelectorAll('[data-modal]'),
        modalWindow = document.querySelector('.modal');

    tab_list_items_parent.addEventListener('click', (e) => {
        e.preventDefault();
        let target = e.target;
        if (target && target.classList.contains('tabheader__item')) {
            hideTabs();
            tab_list_items.forEach((item, i) => {
                if (item == target) {
                    showTabs(i);
                }
            })
        }
    });
    function showTabs(i = 0) {
        tabs[i].classList.remove('hide');
        tabs[i].classList.add('show', 'fade');
        tab_list_items[i].classList.add('tabheader__item_active');

    }

    function hideTabs() {
        tabs.forEach((tab) => {
            tab.classList.remove('show', 'fade');
            tab.classList.add('hide');
        })
        tab_list_items.forEach((item2) => {
            item2.classList.remove('tabheader__item_active');
        })
    }

    hideTabs();
    showTabs();

    //Таймер

    function getTime() {
        const timeLeft = new Date('2024-08-30') - new Date() - 10800000,
            days = Math.round(timeLeft / (1000 * 60 * 60 * 24)),
            hours = (Math.round((timeLeft / (1000 * 60 * 60)) % 24)),
            minutes = Math.round((timeLeft / (1000 * 60)) % 60),
            seconds = Math.round(timeLeft / 1000 % 60);
        return {
            countedDays: days,
            countedHours: hours,
            countedMinutes: minutes,
            countedSeconds: seconds,
            countedEnd: timeLeft
        }
    }
    const backTimer = setInterval(setTime, 1000);

    function setTime() {
        const data = getTime();
        span_days.textContent = data.countedDays;
        span_hours.textContent = numberPlus(data.countedHours);
        span_minutes.textContent = numberPlus(data.countedMinutes);
        span_seconds.textContent = numberPlus(data.countedSeconds);
        if (data.countedEnd < 1) {
            clearInterval(backTimer);
        }
    }

    function numberPlus(date) {
        if (date < 10) {
            date = "0" + date;
        }
        return date;
    }

    setTime();

    //Modal

    function hideModal() {
        modalWindow.classList.add('hide');
        modalWindow.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    function showModal() {
            modalWindow.classList.add('show');
            modalWindow.classList.remove('hide');
            document.body.style.overflow = 'hidden';
            clearTimeout(modalTimeOpen);
            window.removeEventListener('scroll', modalScroll);
    }


    function modalScroll() {
        if (document.documentElement.scrollTop >= 2400) {
            showModal();
        }
    }

    modalButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            console.log(e.target);
            if (e.target.classList.contains('btn_no_modal')) {
                showModal();
                const modalAmount = document.querySelector('.modal__dialog');
                modalAmount.classList.add('hide');
            }
            showModal();
        })
    })
    modalWindow.addEventListener('click', (e) => {
        if (e.target === modalWindow || e.target.getAttribute('data-close') == '') {
            hideModal();
        }
    })
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalWindow.classList.contains('show')) {
            hideModal();
        }
    });

    const modalTimeOpen = setTimeout(showModal, 10000);
    window.addEventListener('scroll', modalScroll);

    //Классы "Табов"

    class MenuTab {
        constructor(img, title, descr, price, parentSelector, ...classes) {
            this.img = img;
            this.title = title;
            this.descr = descr;
            this.price = price;
            this.classes = classes;
            this.parent = document.querySelector(parentSelector);
        }
        render() {
            const tab = document.createElement('div');
            if (this.classes.length === 0) {
                tab.classList.add('menu__item');
            }
            this.classes.forEach((className) => {
                tab.classList.add(className);
            });
            tab.innerHTML = `<img src="${this.img}" alt="post">
                            <h3 class="menu__item-subtitle">${this.title}</h3>
                            <div class="menu__item-descr">${this.descr}</div>
                            <div class="menu__item-divider"></div>
                            <div class="menu__item-price">
                            <div class="menu__item-cost">Цена:</div>
                            <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
                        </div>`;
            this.parent.append(tab);
        }
    }

    const getResource = async (url) => {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Could not fetch ${url}, status: ${res.status}`);
        }
        return await res.json();
    }
    
    getResource('http://localhost:3000/menu')
        .then(data => {
            data.forEach(({img, title, descr, price}) => {
                new MenuTab(img, title, descr, price, '.menu .container').render();
            });
        });

    //Forms

    const forms = document.querySelectorAll('form');

    const message = {
        loading: "../img/form/spinner.svg",
        success: "Спасибо, скоро мы с Вами свяжемся!",
        failure: "Что-то пошло не так..."
    }

    forms.forEach((item) => {
        bindPostData(item);
    })

    function bindPostData(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const statusMessage = document.createElement('img');
            statusMessage.src = message.loading;
            statusMessage.style.cssText = `
                display: block;
                margin: 0 auto;
            `;
            form.insertAdjacentElement('afterend', statusMessage); 
            
            const formData = new FormData(form);

            const json = JSON.stringify(Object.fromEntries(formData.entries()));

            postData("http://localhost:3000/requests", json)
            .then(data => {
                console.log(data);
                showThanksModal(message.success);
                statusMessage.remove();
            }).catch(() => {
                showThanksModal(message.failure);
            }).finally(() => {
                form.reset();
            })

        });
    }

    const postData = async (url, data) => {
        const res = await fetch(url, {
            method: 'POST', 
            headers: {'Content-type': 'application/json'
            }, 
            body: data
        });
        return await res.json();
    }

    function showThanksModal(message) {
        const modalDialog = document.querySelector('.modal__dialog');
        modalDialog.classList.add('hide');
        showModal();

        const thanksModal = document.createElement('div');
        thanksModal.classList.add('modal__dialog');
        thanksModal.innerHTML = `
            <div class="modal__content">
                <div data-close class="modal__close">&times;</div>
                <div class="modal__title">${message}</div>
            </div> //
        `;
        modalWindow.append(thanksModal);
        setTimeout(()=>{
                thanksModal.remove();
                modalDialog.classList.add('show');
                modalDialog.classList.remove('hide');
                hideModal();
        }, 4000)
    }

    fetch('http://localhost:3000/menu')
        .then(data => data.json())
        .then(res => console.log(res));    

})


