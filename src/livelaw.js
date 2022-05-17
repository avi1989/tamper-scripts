// ==UserScript==
// @name         LiveLaw Judegement
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  A script to remove the Fake paywall in Livelaw
// @author       You
// @match        https://www.livelaw.in/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=livelaw.in
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    document.getElementsByClassName("paywall-content")[0].classList.remove("hide")
    // Your code here...
})();