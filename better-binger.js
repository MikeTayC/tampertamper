// ==UserScript==
// @name         Better Binger - powered by jwplayer (aniwave)
// @namespace    http://tampermonkey.net/
// @version      2023-12-09
// @description  try to take over the world!
// @author       You
// @match        *://*.aniwave.to/*
// @match        *://*.aniwave.bz/*
// @match        *://*.aniwave.ws/*
// @match        *://*.aniwave.vc/*
// @match        *://*.vidplay.online/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js

// @icon         https://www.google.com/s2/favicons?sz=64&domain=aniwave.to
// @run-at       document-idle
// @grant        unsafeWindow
// ==/UserScript==
/* global jQuery, $ */
this.$ = this.jQuery = jQuery.noConflict(true);

function waitForInitialAutoStart(selector, options) {
    return new Promise(resolve => {
        var selectorElement = document.querySelector(selector);
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === "attributes") {
                    if (mutation.oldValue === 'opacity: 1;') {
                        observer.disconnect();
                        resolve(selectorElement);
                    }
                }
            }
        });
        observer.observe(selectorElement, options || {
            childList: true,
            subtree: true
        });
    });
}

function waitForElm(selector, options) {
    return new Promise(resolve => {

        var selectorElement = document.querySelector(selector);
        // if (selectorElement) {
        //     l('did not use mutant')
        //     return resolve(selectorElement);
        // }

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === "attributes") {

                    l('attr name')
                    l(mutation.attributeName)
                    l('attr old value')
                    l(mutation.oldValue)
                }
            }

            if (selectorElement) {
                l('mutant found')
                // observer.disconnect();
                resolve(selectorElement);
            }
        });

        l('mutant observe begin')
        observer.observe(selectorElement, options || {
            childList: true,
            subtree: true
        });
    });
}


function waitForElementByMutant(selector, mutantType, mutantValue, options) {
    return new Promise(resolve => {
        var selectorElement = document.querySelector(selector);
        if (selectorElement) {
            const observer = new MutationObserver(mutations => {
                for (const mutation of mutations) {
                    if (mutation.type === mutantType) {
                        if (mutation.oldValue.indexOf(mutantValue) > -1) {
                            observer.disconnect();
                            resolve(selectorElement);
                        }
                    }
                }
            });
            observer.observe(selectorElement, options || {
                childList: true,
                subtree: true
            });
        }
    });
}


function waitForPlayer(selector, mutantType, mutantValue, options) {
    return new Promise(resolve => {
        var selectorElement = document.querySelector(selector);
        if (selectorElement) {
            const observer = new MutationObserver(mutations => {
                for (const mutation of mutations) {
                    if (mutation.type === mutantType) {
                        if (mutation.addedNodes && mutation.addedNodes.length) {
                            var nodeElement = mutation.addedNodes.item(0);
                            if (nodeElement.tagName === 'IFRAME') {
                                observer.disconnect();
                                resolve(nodeElement);


                            }
                        }
                    }
                }
            });

            observer.observe(selectorElement, options || {
                childList: true,
                subtree: true
            });
        }
    });
}

function waitForJWPlayer(iframeElement, mutantType, mutantValue, options) {
    return new Promise(resolve => {
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                l(mutation)
                if (mutation.type === mutantType) {
                    if (mutation.addedNodes && mutation.addedNodes.length) {
                        l(mutation.addedNodes);
                        var nodeElement = mutation.addedNodes.item(0);
                        //  observer.disconnect();
                        // resolve(nodeElement);
                    }
                }
            }
        });

        l('observe iframe')
        l(iframeElement)
        observer.observe(iframeElement, options || {
            childList: true,
            subtree: true
        });
    });
}


function l(s) {
    console.error(s);
}

(function () {


    'use strict';

    var doc = document;

    const playerSelect = '#player';
    const jwplayerSelect = '.jw-player';
    const playButtonSelect = '.play';

    l('testering')

    try {
        waitForElementByMutant(playButtonSelect, 'attributes', 'opacity: 1;', {
            attributes: true,
            attributeFilter: ['style'],
            attributeOldValue: true
        }).then((elm) => {
            $(elm).trigger('click');
        }).catch((e) => {
            l('caught in wait for mutant error');
            l(e);
        });

        waitForPlayer(playerSelect, 'childList', 'iframe', {
            childList: true,
            subtree: true
        }).then((iframeElement) => {
            $(iframeElement).on("load", function (event) {
                var jwplayer = document.querySelector(playerSelect);
                if (jwplayer) {
                    jwplayer.click()
                    var promised = jwplayer.requestFullscreen();
                    promised.then((idk) => {
                        l('in promise idk')
                        l(idk);
                    }).catch((e) => {
                        l('In error promise idk')
                        l(e);

                        var promised2 = $(playerSelect)[0].requestFullscreen();
                        promised2.then((idk2) => {
                            l('in promise22 idk')
                            l(idk2);
                        }).catch((e) => {
                            l('In error promise22 idk')
                            l(e);
                        });
                    });
                }
            });

            window.history.pushState({}, '', window.location);
            l('this test')


            // waitForJWPlayer(iframeElement.contentWindow.document.body, 'childList', '.jwplayer', {
            //     childList: true,
            //     subtree: true
            // }).then((jwplayer) => {

            // });


        });



        // waitForElm(playerSelect).then((elm) => {

        //     l(elm)
        // });


    } catch (e) {
        l(e);
    }


    // Your code here...
})();