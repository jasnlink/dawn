import Glide from "@glidejs/glide";
import { initAddCartAction } from "./lib";

window.addEventListener('DOMContentLoaded', (event) => {
    new Glide('.glide').mount();
    initAddCartAction();
});