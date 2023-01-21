import Glide from "@glidejs/glide";
import { initAddCartAction } from "./main";

window.addEventListener('DOMContentLoaded', (event) => {
    new Glide('.glide').mount();
    initAddCartAction();
});