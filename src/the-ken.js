// ==UserScript==
// @name         The Ken (Free)
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  A script to remove the Paywall in The Ken
// @author       You
// @match        https://the-ken.com/story/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=the-ken.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var paywall = document.getElementById("paywall")
    paywall.parentElement.removeChild(paywall)
    // Your code here...
})();