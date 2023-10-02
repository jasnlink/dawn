import Glide from "@glidejs/glide";

export function initAddCartAction() {

    const addCartActionElementList = document.querySelectorAll('[data-add-cart]');

    addCartActionElementList.forEach((element) => {
        element.removeEventListener('click', handleAddCart)
        element.addEventListener('click', handleAddCart);
    })

    function handleAddCart(event) {

        const targetElement = event.currentTarget

        const productId = parseInt(targetElement.dataset.addCart);

        enableLoading(targetElement);
        initAnimation(targetElement)

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
                throw new Error;
            }
            return res.json()
        })
        .then((data) => {
            updateCartCount()
            pushGtagAddCartEvent(productId)
            disableLoading(targetElement);
            playAnimation();
            handleCartToggle(true);
        })
        .catch((error) => {
            pushGtagAddErrorEvent(productId)
            disableLoading(targetElement, true);
            console.error(error)
        })

        function initAnimation(targetElement) {

            const animationObjectElement = document.querySelector('[data-animation-object="cart"]')
            const animationSourceElement = targetElement

            let animationSourceElementRect = animationSourceElement.getBoundingClientRect()

            let animationObjectRect = animationObjectElement.getBoundingClientRect()

            let animationObjectSourceX = animationSourceElementRect.x + (animationSourceElementRect.width/2) - (animationObjectRect.width/2)
            let animationObjectSourceY = animationSourceElementRect.y - (animationObjectRect.height/2)

            animationObjectElement.style.setProperty('left', `${animationObjectSourceX}px`)
            animationObjectElement.style.setProperty('top', `${animationObjectSourceY}px`)
            animationObjectElement.style.setProperty('transition', `all .45s cubic-bezier(.55,.05,.92,.54) 0s`)

        }

        function playAnimation() {

            const animationObjectElement = document.querySelector('[data-animation-object="cart"]')
            let animationTargetElement
            if(document.querySelector('[data-animation-target="overlay"]').classList.contains('hidden')) {
                animationTargetElement = document.querySelector('[data-animation-target="cart"]')
            } else {
                animationTargetElement = document.querySelector('[data-animation-target="overlay"]')
            }
            
            animationObjectElement.classList.remove('hidden')
    
            let animationObjectRect = animationObjectElement.getBoundingClientRect()
            let animationTargetElementRect = animationTargetElement.getBoundingClientRect()
    
            let animationObjectTargetX = animationTargetElementRect.x + (animationTargetElementRect.width/2) - (animationObjectRect.width/2)
            let animationObjectTargetY = animationTargetElementRect.y + (animationTargetElementRect.height/2) - (animationObjectRect.height/2)

            setTimeout(() => {
                animationObjectElement.style.setProperty('left', `${animationObjectTargetX}px`)
                animationObjectElement.style.setProperty('top', `${animationObjectTargetY}px`)
            }, 20);

            animationObjectElement.addEventListener('transitionend', () => {
                animationObjectElement.style.setProperty('transition', ``)
                animationObjectElement.classList.add('hidden')
            }, {once:true})
        }

        function enableLoading(element) {
            element.querySelector('[data-add-state="default"]').classList.add('hidden')
            element.querySelector('[data-add-state="loading"]').classList.remove('hidden')
            element.disabled = true
        }
    
        function disableLoading(element, error=false) {
            element.querySelector('[data-add-state="loading"]').classList.add('hidden')
            if(error) {
                element.querySelector('[data-add-state="error"]').classList.remove('hidden')
                setTimeout(() => {
                    element.querySelector('[data-add-state="error"]').classList.add('hidden')
                    element.querySelector('[data-add-state="default"]').classList.remove('hidden')
                    element.disabled = false
                }, 500);
            } else {
                element.querySelector('[data-add-state="success"]').classList.remove('hidden')
                setTimeout(() => {
                    element.querySelector('[data-add-state="success"]').classList.add('hidden')
                    element.querySelector('[data-add-state="default"]').classList.remove('hidden')
                    element.disabled = false
                }, 500);
            }

        }

        function pushGtagAddCartEvent(pushId) {

            const itemInfoElement = document.querySelector('[data-info-variant-id="'+ pushId +'"]')

            gtag("event", "add_to_cart", {
                currency: itemInfoElement.getAttribute('data-info-currency'),
                value: parseFloat(itemInfoElement.getAttribute('data-info-variant-price')),
                items: [
                    {
                        item_id: itemInfoElement.getAttribute('data-info-product-id'),
                        item_name: itemInfoElement.getAttribute('data-info-product-title'),
                        item_brand: itemInfoElement.getAttribute('data-info-product-vendor'),
                        item_category: itemInfoElement.getAttribute('data-info-product-collection'),
                        item_variant: itemInfoElement.getAttribute('data-info-variant-id'),
                        price: parseFloat(itemInfoElement.getAttribute('data-info-variant-price')),
                        quantity: 1
                    }
                ]
            });
        
        }

        function pushGtagAddErrorEvent(pushId) {

            const itemInfoElement = document.querySelector('[data-info-variant-id="'+ pushId +'"]')
            gtag("event", "error_add_cart", {
                currency: itemInfoElement.getAttribute('data-info-currency'),
                value: 0,
                items: [
                    {
                        item_id: itemInfoElement.getAttribute('data-info-product-id'),
                        item_name: itemInfoElement.getAttribute('data-info-product-title'),
                        item_brand: itemInfoElement.getAttribute('data-info-product-vendor'),
                        item_category: itemInfoElement.getAttribute('data-info-product-collection'),
                        item_variant: itemInfoElement.getAttribute('data-info-variant-id'),
                        price: parseFloat(itemInfoElement.getAttribute('data-info-variant-price')),
                        quantity: 1
                    }
                ]
            });
        
        }

    }

}

export function updateCartCount() {

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
        let currencySymbol = document.querySelector('[data-currency-symbol]').dataset.currencySymbol
        let text = currencySymbol
        if(total === 0) {
            text += total + '.00'
        } else if(total.toString().length === 2) {
            text += '0.' + total
        } else {
            let prefix = total.toString().slice(0,-2)
            let suffix = total.toString().slice(-2)
            text += prefix + '.' + suffix
        }
        text += ' '+window.Shopify.currency.active
        
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

export function handleCartToggle(state) {

    const backdropOpacity = 0.4;
    const cartWrapperElement = document.getElementById('cart-drawer-overlay');
    const cartDrawerElement = document.getElementById('cart-drawer');

    if(state === true) {
        cartWrapperElement.classList.remove('hidden');
        cartDrawerElement.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        setTimeout(() => {
            cartWrapperElement.style.opacity = backdropOpacity;
            cartDrawerElement.style.transform = 'translateX(0%)';
        }, 20);
        handleCartFetch()
    } else if(state === false) {
        cartWrapperElement.style.opacity = 0;
        cartDrawerElement.style.transform = 'translateX(100%)';
        cartWrapperElement.addEventListener('transitionend', () => {
            cartWrapperElement.classList.add('hidden');
            cartDrawerElement.classList.add('hidden');
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }, {once:true})
    }
}

export function handleCartFetch() {
    return new Promise((resolve) => {
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
            return
        })
        .then(async () => {
            const elementCartRecommendedSection = document.getElementById(`cart-drawer-recommended`)
            const cartLineItems = document.querySelectorAll(`#cart-drawer-items [data-cart-line-item]`)
            if (!cartLineItems.length || !elementCartRecommendedSection) {
                return
            }
            handleCartRecommendedFetch(cartLineItems[cartLineItems.length-1].getAttribute(`data-cart-line-item`), elementCartRecommendedSection)
            .then(() => {
                if (elementCartRecommendedSection.innerHTML.trim().length) {
                    initAddCartAction();
                    reloadScript('alireviews.min.js')
                    new Glide('.glide-cart-recommended', {
                        type: 'carousel',
                        startAt: 0,
                        perView: 3,
                        gap: 4,
                        breakpoints: {
                            1536: {
                                perView: 3
                            },
                            1024: {
                                perView: 3
                            },
                            640: {
                                perView: 3
                            }
                        }
                    }).mount();
                }
                return
            })
            return
        })
        .catch((error) => {
            console.error(error)
        })
        .finally(() => {
            disableLoading()
            initCartAction();
            initSecurePopover();
            resolve()
        })
    })

    function handleCartRecommendedFetch(productId, recommendedSection) {
        return new Promise((resolve, reject) => {
            const sectionFetch = `cart-product-recommended`
            fetch(`${window.Shopify.routes.root}recommendations/products?product_id=${productId}&limit=8&section_id=${sectionFetch}&intent=related`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error()
                }
                return res.text()
            })
            .then((data) => {
                recommendedSection.innerHTML = data
                if (recommendedSection.innerHTML.trim().length) {
                    resolve()
                }
            })
            .catch(err => reject(err))
        })
    }

    function enableLoading() {
        document.querySelector('[data-cart-drawer-state="default"]').classList.add('hidden');
        document.querySelector('[data-cart-drawer-state="loading"]').classList.remove('hidden');
    }

    function disableLoading() {
        document.querySelector('[data-cart-drawer-state="default"]').classList.remove('hidden');
        document.querySelector('[data-cart-drawer-state="loading"]').classList.add('hidden');
    }

}

export function initCartAction() {

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

export function initSecurePopover() {

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

export function reloadScript(src) {
    return new Promise((resolve, reject) => {
        let scriptToBeRemoved = document.querySelector('script[src*="'+src+'"]');
        if (!scriptToBeRemoved) {
            reject(new Error(`No script found with src: ${src}`));
            return;
        }
        let script = document.createElement('script');
        script.setAttribute('src', scriptToBeRemoved.getAttribute('src'));
        scriptToBeRemoved.remove();
        document.head.appendChild(script);
        const reloadedScript = document.querySelector('script[src*="'+src+'"]');
        reloadedScript.addEventListener(`load`, () => {
            resolve()
        }, {once:true})
        script.addEventListener('error', () => {
            reject(new Error(`Failed to reload script: ${src}`));
        }, {once: true});
    })
}

export function getScriptContent(src) {
    return new Promise((resolve, reject) => {
        fetch(src)
        .then((response) => {
            if(!response.ok) {
                throw new Error
            }
            return response.text()
        })
        .then((data) => {
            resolve(data)
        })
        .catch((err) => {
            console.error(err)
            reject()
        })
    })
}

export function appendScript(content) {
    let script = document.createElement('script');
    script.innerHTML = content
    document.head.appendChild(script);
}