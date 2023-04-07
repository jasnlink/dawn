(()=>{"use strict";var t,e={581:(t,e,a)=>{function r(){function t(t){var e,a=t.currentTarget,r=parseInt(a.dataset.addCart);(e=a).querySelector('[data-add-state="default"]').classList.add("hidden"),e.querySelector('[data-add-state="loading"]').classList.remove("hidden"),e.disabled=!0;var n={items:[{id:r,quantity:1}]};function i(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];t.querySelector('[data-add-state="loading"]').classList.add("hidden"),e?(t.querySelector('[data-add-state="error"]').classList.remove("hidden"),setTimeout((function(){t.querySelector('[data-add-state="error"]').classList.add("hidden"),t.querySelector('[data-add-state="default"]').classList.remove("hidden"),t.disabled=!1}),500)):(t.querySelector('[data-add-state="success"]').classList.remove("hidden"),setTimeout((function(){t.querySelector('[data-add-state="success"]').classList.add("hidden"),t.querySelector('[data-add-state="default"]').classList.remove("hidden"),t.disabled=!1}),500))}fetch(window.Shopify.routes.root+"cart/add.js",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}).then((function(t){if(!t.ok)throw new Error;return t.json()})).then((function(t){var e,n;fetch(window.Shopify.routes.root+"cart.js").then((function(t){if(!t.ok)throw new Error;return t.json()})).then((function(t){var e,a;e=t.item_count,a="empty",1===e?a="1 item":e>1&&(a=e+" items"),document.querySelectorAll("[data-cart-count]").forEach((function(t){"full"===t.dataset.cartCount?t.innerText=a:"short"===t.dataset.cartCount&&(t.innerText=e)})),function(t){var e=document.querySelector("[data-currency-symbol]").dataset.currencySymbol;if(0===t)e+=t+".00";else if(2===t.toString().length)e+="0."+t;else{var a=t.toString().slice(0,-2),r=t.toString().slice(-2);e+=a+"."+r}e+=" "+window.Shopify.currency.active,document.querySelectorAll("[data-cart-total]").forEach((function(t){t.innerText=e}))}(t.items_subtotal_price)})).catch((function(t){console.error(t)})).finally((function(){})),e=r,n=document.querySelector('[data-info-variant-id="'+e+'"]'),gtag("event","add_to_cart",{currency:n.getAttribute("data-info-currency"),value:n.getAttribute("data-info-variant-price"),items:[{item_id:n.getAttribute("data-info-product-id"),item_name:n.getAttribute("data-info-product-title"),item_brand:n.getAttribute("data-info-product-vendor"),item_category:n.getAttribute("data-info-product-collection"),item_variant:n.getAttribute("data-info-variant-id"),price:n.getAttribute("data-info-variant-price"),quantity:1}]}),i(a)})).catch((function(t){var e,n;e=r,n=document.querySelector('[data-info-variant-id="'+e+'"]'),gtag("event","error_add_cart",{currency:n.getAttribute("data-info-currency"),value:0,items:[{item_id:n.getAttribute("data-info-product-id"),item_name:n.getAttribute("data-info-product-title"),item_brand:n.getAttribute("data-info-product-vendor"),item_category:n.getAttribute("data-info-product-collection"),item_variant:n.getAttribute("data-info-variant-id"),price:n.getAttribute("data-info-variant-price"),quantity:1}]}),i(a,!0),console.error(t)}))}document.querySelectorAll("[data-add-cart]").forEach((function(e){e.addEventListener("click",t)}))}function n(t){document.querySelector('script[src="'+t+'"]').remove();var e=document.createElement("script");e.setAttribute("src",t),document.head.appendChild(e)}a.d(e,{KR:()=>n,Qj:()=>r})}},a={};function r(t){var n=a[t];if(void 0!==n)return n.exports;var i=a[t]={exports:{}};return e[t](i,i.exports,r),i.exports}r.d=(t,e)=>{for(var a in e)r.o(e,a)&&!r.o(t,a)&&Object.defineProperty(t,a,{enumerable:!0,get:e[a]})},r.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),t=r(581),window.addEventListener("DOMContentLoaded",(function(e){!function(){var e=1,a=parseInt(document.querySelector("[data-paginate-max]").dataset.paginateMax),r=document.querySelector("[data-paginate-more]"),n=document.querySelector("[data-paginated-products]");function i(i){n.classList.add("opacity-75"),n.classList.add("select-none"),n.classList.add("pointer-events-none"),r.disabled=!0,r.querySelector('[data-paginate-state="default"]').classList.add("hidden"),r.querySelector('[data-paginate-state="loading"]').classList.remove("hidden");var o="index-collection";fetch(window.Shopify.routes.root+"?sections="+o+"&page="+i).then((function(t){if(!t.ok)throw new Error;return t.json()})).then((function(i){n.insertAdjacentHTML("beforeend",i[o]),function(t){return new Promise((function(e,a){for(var r=document.getElementById("shopify-section-"+t);r.childNodes.length>0;)n.appendChild(r.childNodes[0]);0===r.childNodes.length&&(r.remove(),e())}))}(o).then((function(){n.classList.remove("opacity-75"),n.classList.remove("select-none"),n.classList.remove("pointer-events-none"),r.disabled=!1,r.querySelector('[data-paginate-state="default"]').classList.remove("hidden"),r.querySelector('[data-paginate-state="loading"]').classList.add("hidden"),(0,t.KR)("https://cdn.alireviews.io/box/js/frontend/45/iframe.js?version=5.4.9"),(0,t.Qj)(),e===a&&r.classList.add("hidden")}))})).catch((function(t){console.error(t)}))}i(e),r.addEventListener("click",(function(t){t.preventDefault(),i(++e)}))}()}))})();