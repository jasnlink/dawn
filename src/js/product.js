import Glide from "@glidejs/glide";
import { initAddCartAction } from "./lib";

window.addEventListener('DOMContentLoaded', (event) => {
    new Glide('.glide').mount();
    initAddCartAction();
    initProductRecommended();
});

function initProductRecommended() {

    const productRecommendationsSection = document.querySelector('[data-recommended-content]');
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
                throw new Error();
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