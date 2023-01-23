import { initAddCartAction } from "./lib";
import { updateCartCount } from "./lib";

window.addEventListener('DOMContentLoaded', (event) => {
    initSecurePopover();
    initCartDrawer();
    initCartBannerOverlay();
});

function initSecurePopover() {

    const secureBtnElementList = document.querySelectorAll('[data-secure-action]');
    console.log('secureBtnElementList',secureBtnElementList)
    const secureCloseBtnElementList = document.querySelectorAll('[data-secure-close]');
    const securePopoverElement = document.getElementById('secure-popover');

    let popperInstanceList = [];

    secureCloseBtnElementList.forEach(secureCloseBtnElement => {secureCloseBtnElement.addEventListener('click', hideSecure)})
    
    secureBtnElementList.forEach((secureBtnElement, index) => {
        secureBtnElement.addEventListener('click', (event, secureBtnElement) => {handleSecureToggle(secureBtnElement, index)});

        const popperInstance = Popper.createPopper(secureBtnElement, securePopoverElement, {
            placement: 'top',
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [0, 24],
                    },
                },
            ],
        });
        //console.log('secureBtnElement',secureBtnElement)
        //console.log('popperInstance',popperInstance)
        popperInstanceList.push(popperInstance)
    })

    function handleSecureToggle(secureBtnElement, index) {
        console.log('click')
        securePopoverElement.classList.toggle('hidden');
        popperInstanceList[index].update();
    }

    function hideSecure() {
        securePopoverElement.classList.add('hidden');
    }

}

function initCartDrawer() {
    console.log('initCartDrawer')
    let drawerOpen = false;
    const backdropOpacity = 0.4;

    const cartBtnElementList = document.querySelectorAll('[data-cart-open]');
    cartBtnElementList.forEach((cartBtnElement) => {
        cartBtnElement.addEventListener('click', handleCartToggle);
    })

    const cartCloseBtnElement = document.getElementById('cart-close-btn');
    cartCloseBtnElement.addEventListener('click', handleCartToggle);

    const cartWrapperElement = document.getElementById('cart-drawer-overlay');
    const cartDrawerElement = document.getElementById('cart-drawer');

    cartWrapperElement.style.opacity = 0;
    cartDrawerElement.style.transform = 'translateX(100%)';
    cartWrapperElement.addEventListener('click', handleCartToggle);

    updateCartCount();

    function handleCartToggle() {

        if(drawerOpen === false) {
            cartWrapperElement.classList.remove('hidden');
            cartDrawerElement.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            setTimeout(() => {
                cartWrapperElement.style.opacity = backdropOpacity;
                cartDrawerElement.style.transform = 'translateX(0%)';
            }, 20);
            drawerOpen = true
            handleCartFetch();
        } else if(drawerOpen === true) {
            cartWrapperElement.style.opacity = 0;
            cartDrawerElement.style.transform = 'translateX(100%)';
            cartWrapperElement.addEventListener('transitionend', () => {
                cartWrapperElement.classList.add('hidden');
                cartDrawerElement.classList.add('hidden');
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
            }, {once:true})
            drawerOpen = false
        }
    }

    function handleCartFetch() {
        enableLoading()
        const section = 'cart-content'
        const elementCartDrawerContentSection = document.getElementById('cart-drawer-content');
        fetch(window.Shopify.routes.root + "?sections=" + section)
        .then((res) => {
            if(!res.ok) {
                throw new Error();
            }
            return res.json()
        })
        .then((data) => {
            elementCartDrawerContentSection.innerHTML = data[section];
            document.getElementById('shopify-section-'+section).classList.add('h-full', 'flex', 'flex-col', 'shrink', 'overflow-auto');
        })
        .catch((error) => {
            console.error(error)
        })
        .finally(() => {
            disableLoading()
            initCartAction();
            initSecurePopover();
        })

        function enableLoading() {
            document.querySelector('[data-cart-drawer-state="default"]').classList.add('hidden');
            document.querySelector('[data-cart-drawer-state="loading"]').classList.remove('hidden');
        }

        function disableLoading() {
            document.querySelector('[data-cart-drawer-state="default"]').classList.remove('hidden');
            document.querySelector('[data-cart-drawer-state="loading"]').classList.add('hidden');
        }

    }

    function initCartAction() {

        const cartDrawerElement = document.getElementById('cart-drawer')
        const cartActionElementList = cartDrawerElement.querySelectorAll('[data-cart-action]')

        const cartShopBtnElement = document.getElementById('cart-shop-btn');

        if(cartShopBtnElement !== null) {
            cartShopBtnElement.addEventListener('click', handleCartToggle);
        }

        cartActionElementList.forEach(cartActionElement => {
            cartActionElement.addEventListener('click', handleCartAction)
        })

        function handleCartAction(event) {
            let currentId = parseInt(event.currentTarget.dataset.cartItemId)
            let currentQuantity = parseInt(event.currentTarget.dataset.cartItemQuantity)

            let currentAction = event.currentTarget.dataset.cartAction
            if(currentAction === 'minus') {
                currentQuantity--;
            } else if(currentAction === 'plus') {
                currentQuantity++;
            }

            let formData = {
                'line': currentId,
                'quantity': currentQuantity
            };
    
            fetch(window.Shopify.routes.root + 'cart/change.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then((res) => {
                if(!res.ok) {
                    throw new Error();
                }
                return res.json()
            })
            .then((data) => {
                updateCartCount()
            })
            .catch((error) => {
                console.error(error)
            })
            .finally(() => {
                handleCartFetch();
            })

        }
    }
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