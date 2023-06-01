import Glide from "@glidejs/glide";
import { initAddCartAction } from "./lib";
import { reloadScript } from "./lib";

window.addEventListener('DOMContentLoaded', (event) => {
    new Glide('.glide').mount();
    initAddCartAction();
    initProductRecommended();
    initVariantSelector();
});

function initVariantSelector() {

    let selectionState = {}
    document.querySelectorAll('[data-selector-option-group-index]').forEach(element => {
        let targetOptionIndex = parseInt(element.dataset.selectorOptionGroupIndex)
        selectionState[targetOptionIndex] = {
            value: null
        }
    })
    document.querySelectorAll('[data-selector-element-type]').forEach(selectorElement => {
        let selectorType = selectorElement.dataset.selectorElementType
        if(selectorType === 'button') {
            document.querySelectorAll('[data-selector-element-type="button"] [data-selector-default]').forEach(element => handleSelection(element))
            let selectorActionElementList = document.querySelectorAll('[data-selector-action]');
            selectorActionElementList.forEach(element => {
                element.addEventListener('click', event => {
                    event.preventDefault();
                    handleSelection(event.currentTarget);
                })
            })
        } else if(selectorType === 'dropdown') {
            document.querySelectorAll('[data-selector-element-type="dropdown"] [data-selector-default]').forEach(element => handleSelection(element))
            selectorElement.addEventListener('change', event => {
                event.preventDefault();
                let selectedOption = event.target.options[event.target.options.selectedIndex]
                handleSelection(selectedOption);
            })
        }
    })

    function handleSelection(element) {
        let targetOptionIndex = parseInt(element.dataset.selectorAction)

        if(selectionState[targetOptionIndex]['value']) {
            document.querySelectorAll('[data-selector-option-group-index="'+targetOptionIndex+'"] [data-selector-option-value="'+selectionState[targetOptionIndex]['value']+'"]')
            .forEach((optionElement) => {
                optionElement.classList.remove('bg-black')
                optionElement.classList.remove('text-white')
                optionElement.classList.add('bg-white')
                optionElement.classList.add('text-black')
            })
        }
        selectionState[targetOptionIndex]['value'] = element.dataset.selectorOptionValue
        document.querySelectorAll('[data-selector-option-group-index="'+targetOptionIndex+'"] [data-selector-option-value="'+selectionState[targetOptionIndex]['value']+'"]')
        .forEach((optionElement) => {
            let optionGroupElement = optionElement.closest('[data-selector-element-type]')
            if(optionGroupElement.dataset.selectorElementType === 'dropdown') {
                optionGroupElement.selectedIndex = parseInt(optionElement.dataset.selectorOptionIndex)
            }
            optionElement.classList.remove('bg-white')
            optionElement.classList.remove('text-black')
            optionElement.classList.add('bg-black')
            optionElement.classList.add('text-white')
        })
        searchVariantList()
    }

    function searchVariantList() {
        let search = ''
        Object.keys(selectionState).forEach((key) => {
            search += '[data-selector-variant-option-'+key+'="'+selectionState[key]['value']+'"]'
        })
        let foundElement = document.querySelector(search)
        if(foundElement) {
            document.querySelectorAll('[data-add-cart]').forEach(element => {
                element.dataset.addCart = foundElement.dataset.selectorVariantId
                element.disabled = false
            })
            document.querySelectorAll('[data-product-display-price]').forEach(element => {
                element.textContent = foundElement.dataset.selectorVariantPrice
            })
            if(foundElement.dataset.selectorVariantComparePrice) {
                document.querySelectorAll('[data-product-display-compare-save-price]').forEach(element => {
                    element.classList.remove('hidden')
                })
                document.querySelectorAll('[data-product-compare-price]').forEach(element => {
                    element.classList.remove('hidden')
                    element.textContent = foundElement.dataset.selectorVariantComparePrice
                })
                document.querySelectorAll('[data-product-compare-save-price]').forEach(element => {
                    element.classList.remove('hidden')
                    element.textContent = foundElement.dataset.selectorVariantCompareSavePrice
                })
            } else {
                document.querySelectorAll('[data-product-compare-price]').forEach(element => {
                    element.classList.add('hidden')
                })
                document.querySelectorAll('[data-product-display-compare-save-price]').forEach(element => {
                    element.classList.add('hidden')
                })
            }
        } else {
            document.querySelectorAll('[data-add-cart]').forEach(element => {
                element.dataset.addCart = null
                element.disabled = true
            })
        }
    }

}

function initProductRecommended() {

    const productRecommendationsSection = document.querySelector('[data-recommended-state="default"]');
    const observer = new IntersectionObserver(handleIntersection, {rootMargin: '0px 0px 200px 0px'});

    observer.observe(productRecommendationsSection);

    function handleIntersection(entries, observer) {

        if (!entries[0].isIntersecting) return;

        observer.unobserve(productRecommendationsSection);

        enableLoading()

        const url = productRecommendationsSection.dataset.url;

        fetch(url)
        .then((res) => {
            if(!res.ok) {
                console.log('error')
                throw new Error;
            }
            return res.text()
        })
        .then((data) => {
            productRecommendationsSection.innerHTML = data
        })
        .catch((error) => {
            console.error(error)
        })
        .finally(() => {
            disableLoading();
            initAddCartAction();
            reloadScript('alireviews.min.js')
            new Glide('.glide-recommended', {
                type: 'carousel',
                startAt: 0,
                perView: 4,
                gap: 48,
                breakpoints: {
                    1536: {
                        perView: 3
                    },
                    1024: {
                        perView: 2
                    },
                    640: {
                        perView: 1
                    }
                }
            }).mount();
        })

        function enableLoading() {
            document.querySelector('[data-recommended-state="default"]').classList.add('hidden');
            document.querySelector('[data-recommended-state="loading"]').classList.remove('hidden');
        }

        function disableLoading() {
            document.querySelector('[data-recommended-state="default"]').classList.remove('hidden');
            document.querySelector('[data-recommended-state="loading"]').classList.add('hidden');
        }

    }

}