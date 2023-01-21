window.addEventListener('DOMContentLoaded', (event) => {
    initSecurePopover();
    initCartDrawer();
    initCartBannerOverlay();
});

function initSecurePopover() {

    const secureBtnElementList = document.querySelectorAll('[data-secure-action]');
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

        popperInstanceList.push(popperInstance)
    })

    function handleSecureToggle(secureBtnElement, index) {
        securePopoverElement.classList.toggle('hidden');
        popperInstanceList[index].update();
    }

    function hideSecure() {
        securePopoverElement.classList.add('hidden');
    }

}

function initCartDrawer() {

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

export function initAddCartAction() {

    const addCartActionElementList = document.querySelectorAll('[data-add-cart]');

    addCartActionElementList.forEach((element) => {
        element.addEventListener('click', handleAddCart);
    })

    function handleAddCart(event) {

        const targetElement = event.currentTarget
        const productId = parseInt(targetElement.dataset.addCart);
        enableBtnLoading(targetElement);

        let formData = {
            'items': [{
                    'id': productId,
                    'quantity': 1
                }]
        };

        fetch(window.Shopify.routes.root + 'cart/add.js', {
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
            disableBtnLoading(targetElement);
        })

        function enableBtnLoading(element) {
            element.querySelector('[data-add-state="default"]').classList.add('hidden')
            element.querySelector('[data-add-state="loading"]').classList.remove('hidden')
            element.disabled = true
        }
    
        function disableBtnLoading(element) {
            element.querySelector('[data-add-state="loading"]').classList.add('hidden')
            element.querySelector('[data-add-state="success"]').classList.remove('hidden')
            setTimeout(() => {
                element.querySelector('[data-add-state="success"]').classList.add('hidden')
                element.querySelector('[data-add-state="default"]').classList.remove('hidden')
                element.disabled = false
            }, 500);
        }

    }

}

function updateCartCount() {

    fetch(window.Shopify.routes.root + "cart.js")
    .then((res) => {
        if(!res.ok) {
            throw new Error();
        }
        return res.json()
    })
    .then((data) => {
        handleCartCount(data.item_count)
        handleCartTotal(data.items_subtotal_price)
    })
    .catch((error) => {
        console.error(error)
    })
    .finally(() => {
    })

    function handleCartTotal(total) {
        let text = '$'
        console.log('total', total)
        if(total === 0) {
            text += total + '.00'
        } else if(total.toString().length === 2) {
            text += '0.' + total
        } else {
            let prefix = total.toString().slice(0,-2)
            let suffix = total.toString().slice(-2)
            text += prefix + '.' + suffix
        }
        text += ' USD'
        
        const cartTotalElementList = document.querySelectorAll('[data-cart-total]')
        cartTotalElementList.forEach((cartTotalElement) => {
            cartTotalElement.innerText = text
        })
    }

    function handleCartCount(count) {
        let text = 'empty'
        if(count === 1) {
            text = '1 item';
        } else if(count > 1) {
            text = count+' items'
        }
        
        const cartCountElementList = document.querySelectorAll('[data-cart-count]')
        cartCountElementList.forEach((cartCountElement) => {
            if(cartCountElement.dataset.cartCount === 'full') {
                cartCountElement.innerText = text
            } else if(cartCountElement.dataset.cartCount === 'short') {
                cartCountElement.innerText = count
            }
        })
    }

}

function initCartBannerOverlay() {

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