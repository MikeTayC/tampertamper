// ==UserScript==
// @name         Better Binger - Main
// @namespace    http://tampermonkey.net/
// @version      2023-12-09
// @description  try to take over the world!
// @author       You
// @match        *://*.aniwave.to/*
// @match        *://*.aniwave.bz/*
// @match        *://*.aniwave.ws/*
// @match        *://*.aniwave.vc/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=aniwave.to
// @run-at       document-idle
// @grant        unsafeWindow
// ==/UserScript==

'use strict';

const playerSelect = '#player';
const jwplayerSelect = '.jw-player';
const playButtonSelect = '.play';
const backSelect = 'div.ctrl.forward.prev';
const nextSelect = 'div.ctrl.forward.next';

const BETTER_BINGER = 'BETTER_BINGER';


function l(e) {
    console.error(e);
}

function waitForElementByMutant(selector, mutantType, mutantValue, options) {
    return new Promise(resolve => {
        var selectorElement = document.querySelector(selector);
        if (selectorElement) {
            const observer = new MutationObserver(mutations => {
                if (mutations.some((mutation) => (mutation.type === mutantType) && mutation.oldValue.indexOf(mutantValue))) {
                    observer.disconnect();
                    resolve(selectorElement);
                }
            });

            observer.observe(selectorElement, options || {
                childList: true,
                subtree: true
            });
        }
    });
}

function waitForPlayer(player, mutantType, mutantValue, options) {
    return new Promise(resolve => {
        if (player) {
            const observer = new MutationObserver(mutations => {
                var mutantRecord = mutations.find((mutation) => {
                    return (mutation.type === mutantType) && (mutation.addedNodes && mutation.addedNodes.length) && (mutation.addedNodes.item(0).tagName === 'IFRAME');
                });

                if (mutantRecord) {
                    observer.disconnect();
                    resolve(mutantRecord.addedNodes.item(0));
                }
            });

            observer.observe(player, options || {
                childList: true,
                subtree: true
            });
        }
    });
}


function clicker(el, options) {
    if (el) {
        var event = new MouseEvent('click', options || {});
        l(el.dispatchEvent(event));
    } else {
        l('no el to click')
    }
}

function requestFullScreen() {
    var jwplayer = document.querySelector(playerSelect);
    if (jwplayer) {
        jwplayer.requestFullscreen().catch((e) => {
            l('In error promise idk');
            l(e);
            l('doc fullscreenelement3');
            l(document.fullscreenElement);

            setTimeout(() => {
                l('trying jwplayer.click');
                clicker(jwplayer);

                var promised2 = jwplayer.requestFullscreen();
                promised2.then((idk2) => {
                    l('in promise22 idk');
                    l(idk2);
                    l('doc fullscreenelement4');
                    l(document.fullscreenElement);
                }).catch((e) => {
                    l('In error promise22 idk');
                    l(e);
                });
            }, 3000);
        });
    }
}

function recordKeyPress(ev) {
    try {
        if (ev && ev.target && ev.target.tagName !== 'INPUT') {
            switch (ev.key) {
                case 'f':
                    if (ev.target.id !== 'player') {
                        if (!document.fullscreenElement) {
                            requestFullScreen();
                        } else {
                            document.exitFullscreen();
                        }
                    }
                    break;
                default:
                    // do nothing
                    break;
            }
        }
    } catch (e) {
        l(e);
    }
}

function playerHotKeyOverwrite(ev) {
    try {
        // if (ev && ev.target && ev.target.tagName !== 'INPUT') {
        if (ev) {
            l(ev.key);
            l(ev);
            l(ev.target)
            l(ev.target.id)

            // switch (ev.key) {
            //     case 'b':
            //         if (ev.target.id === 'player') {
            //             l('clicked b in player');

            //             clicker(document.querySelector(backSelect));
            //         }
            //         break;
            //     case 'n':
            //         if (ev.target.id === 'player') {
            //             l('clicked n in player')
            //             clicker(document.querySelector(nextSelect));
            //         }
            //         break;
            //     default:
            //         // do nothing
            //         break;
            // }
        } else {
            l('no ev for hotkey overwrite')
        }
    } catch (e) {
        l(e);
    }
}

(function () {
    l('testering');
    try {
        window.addEventListener('keydown', recordKeyPress);

        window.addEventListener('message', (event) => {

            if (event?.data?.id === BETTER_BINGER) {
                l('message event listened');
                l(event);
                l(event.data);
            }
        }, false);

        waitForElementByMutant(playButtonSelect, 'attributes', 'opacity: 1;', {
            attributes: true,
            attributeFilter: ['style'],
            attributeOldValue: true
        }).then((elm) => {
            // for good measure delay the click for a bit
            setTimeout(() => {
                clicker(elm);
            }, 500);
        }).catch((e) => {
            l('caught in wait for mutant error');
            l(e);
        });

        var player = document.querySelector(playerSelect);
        waitForPlayer(player, 'childList', 'iframe', {
            subtree: true
        }).then((iframeElement) => {

            iframeElement.addEventListener('load', (event) => {
                if (!document.fullscreenElement) {
                    requestFullScreen();
                }
            });

            window.history.pushState({}, '', window.location);
        });

    } catch (e) {
        l(e);
    }
}());