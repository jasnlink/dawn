import { updateCartCount } from "./lib";
import { handleCartToggle } from "./lib";
import { initSecurePopover } from "./lib";

window.addEventListener('DOMContentLoaded', (event) => {
    initSecurePopover();
    initCartDrawer();
    initCartBannerOverlay();
    initSalesPopup();
});

function initCartDrawer() {
    const cartBtnElementList = document.querySelectorAll('[data-cart-open]');
    cartBtnElementList.forEach((cartBtnElement) => {
        cartBtnElement.addEventListener('click', (e) => {handleCartToggle(true);});
    })

    const cartCloseBtnElement = document.getElementById('cart-close-btn');
    cartCloseBtnElement.addEventListener('click', (e) => {handleCartToggle(false);});

    const cartWrapperElement = document.getElementById('cart-drawer-overlay');
    const cartDrawerElement = document.getElementById('cart-drawer');

    cartWrapperElement.style.opacity = 0;
    cartDrawerElement.style.transform = 'translateX(100%)';
    cartWrapperElement.addEventListener('click', (e) => {handleCartToggle(false);});

    updateCartCount();

}

function initCartBannerOverlay() {

    if(!document.querySelector('[data-no-overlay]')) {

        let observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 1.0
        }
    
        // let observer = new IntersectionObserver(handleCartBannerOverlay, observerOptions);
    
        const observer = new IntersectionObserver(entries => {
            handleCartBannerOverlay(entries)
        })
    
        observer.observe(document.querySelector('#main-header'))
    
        function handleCartBannerOverlay(entries) {
            const overlayElement = document.getElementById('cart-banner-overlay');
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    overlayElement.classList.add('hidden');
                } else {
                    overlayElement.classList.remove('hidden');
                }
            })
        }
        
    }

}

function initSalesPopup() {

    const salesCloseBtnElement = document.querySelector('[data-sales-close]')
    salesCloseBtnElement.addEventListener('click', (e) => {
        togglePopup(false)
    })
    togglePopup(false)

    fetch('/products.json')
    .then((response) => {
        return response.json()
    })
    .then((data) => {

        const regionList = {
            countries: ['UK', 'CA', 'USA'],
            UK: ['Avon','Bedfordshire','Berkshire','Buckinghamshire','Cambridgeshire','Cheshire','Cleveland','Cornwall','Cumbria','Derbyshire','Devon','Dorset','Durham','East Sussex','Essex','Gloucestershire','Hampshire','Herefordshire','Hertfordshire','Isle of Wight','Kent','Lancashire','Leicestershire','Lincolnshire','London','Merseyside','Middlesex','Norfolk','Northamptonshire','Northumberland','North Humberside','North Yorkshire','Nottinghamshire','Oxfordshire','Rutland','Shropshire','Somerset','South Humberside','South Yorkshire','Staffordshire','Suffolk','Surrey','Tyne and Wear','Warwickshire','West Midlands','West Sussex','West Yorkshire','Wiltshire','Worcestershire'],
            CA: ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon Territory'],
            USA: ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'],
        }

        let randomInterval = getRandomInt(4, 9)

        setTimeout(() => {
            generateRandomProduct()
        }, randomInterval * 1000)

        function generateRandomProduct() {
            let randomProductSeed = getRandomInt(0, data.products.length)

            let randomCountrySeed = getRandomInt(0, regionList.countries.length)
            let randomDistrictSeed = getRandomInt(0, regionList[regionList.countries[randomCountrySeed]].length)
            let randomRegion = regionList[regionList.countries[randomCountrySeed]][randomDistrictSeed]  + ', ' + regionList.countries[randomCountrySeed]

            let randomTimeSeed = getRandomInt(1, 720)
            let salesTimeText

            if(randomTimeSeed >= 60) {
                let salesTimeHour = Math.round(randomTimeSeed / 60)
                salesTimeText = salesTimeHour === 1 ? `1 hour ago` : `${salesTimeHour} hours ago`
            } else {
                salesTimeText = randomTimeSeed === 1 ? `1 min ago` : `${randomTimeSeed} mins ago`
            }
    
            let productTitle = data.products[randomProductSeed].title
            let productMedia = data.products[randomProductSeed].images[0].src
            let productHandle = data.products[randomProductSeed].handle
            
            let salesUrlElement = document.querySelector('[data-sales-url]')
            salesUrlElement.setAttribute('href', `/products/${productHandle}`)
            salesUrlElement.setAttribute('title', `/products/${productTitle}`)
    
            let salesMediaElement = document.querySelector('[data-sales-media]')
            salesMediaElement.setAttribute('src', `${productMedia}`)
            salesMediaElement.setAttribute('alt', `/products/${productTitle}`)
    
            let salesTitleElement = document.querySelector('[data-sales-title]')
            salesTitleElement.textContent = productTitle
            
            let salesLocationElement = document.querySelector('[data-sales-location]')
            salesLocationElement.textContent = randomRegion

            let salesTimeElement = document.querySelector('[data-sales-time]')
            salesTimeElement.textContent = salesTimeText

            togglePopup(true)
            setTimeout(() => {
                togglePopup(false)
                let randomInterval = getRandomInt(4, 9)
                setTimeout(() => {
                    generateRandomProduct()
                }, randomInterval * 1000)
            }, 5000)
        }
    })
    
    function togglePopup(state) {
        
        const salesPopupElement = document.querySelector('[data-sales-popup-element]')
        
        if(state === true) {
            salesPopupElement.style.transform= 'translateY(0%)'
        } else if(state === false) {
            salesPopupElement.style.transform= 'translateY(200%)'
        }

    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
    }
}