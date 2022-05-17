// ==UserScript==
// @name         Business Line Paywall
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  A script to remove the fake paywall in BusinessLine.
// @author       You
// @match        https://www.thehindubusinessline.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=thehindubusinessline.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    setTimeout(() => {
      document.getElementsByClassName("articlepaywall")[0].classList.remove("articlepaywall")
    }, 3000)
    // Your code here...
})();