export function initAddCartAction() {

    const addCartActionElementList = document.querySelectorAll('[data-add-cart]');

    addCartActionElementList.forEach((element) => {
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
                value: itemInfoElement.getAttribute('data-info-variant-price'),
                items: [
                    {
                        item_id: itemInfoElement.getAttribute('data-info-product-id'),
                        item_name: itemInfoElement.getAttribute('data-info-product-title'),
                        item_brand: itemInfoElement.getAttribute('data-info-product-vendor'),
                        item_category: itemInfoElement.getAttribute('data-info-product-collection'),
                        item_variant: itemInfoElement.getAttribute('data-info-variant-id'),
                        price: itemInfoElement.getAttribute('data-info-variant-price'),
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
                        price: itemInfoElement.getAttribute('data-info-variant-price'),
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

export function reloadScript(src) {
    document.querySelector('script[src="'+src+'"]').remove();
    let script = document.createElement('script');
    script.setAttribute('src', src);
    document.head.appendChild(script);
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