// ==UserScript==
// @name         Better Binger - Iframe Handler
// @namespace    http://tampermonkey.net/
// @version      2023-12-09
// @description  try to take over the world!
// @author       You
// @match        *://*.vidplay.online/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=aniwave.to
// @run-at       document-idle
// @grant        unsafeWindow
// ==/UserScript==

'use strict';

const BETTER_BINGER = 'BETTER_BINGER';

function l(e) {
    console.error(e);
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

(function () {

    l('player');


    l(window.frameElement);
    l(window.frames)

    l(document.querySelector('iframe'));

    waitForPlayer(player, 'childList', 'iframe', {
        childList: true,
        subtree: true
    }).then((iframeElement) => {

        iframeElement.addEventListener('load', (event) => {
            l('from framer in ventlistner for iframe lement load')
            l(event)
        });
    });


    if (window && window.parent) {
        window.addEventListener('keydown', (ev) => {
            try {
                if (ev) {
                    switch (ev.key) {
                        default:
                            // do nothing
                            window.parent.postMessage({
                                id: BETTER_BINGER,
                                key: ev.key
                            }, '*');
                            break;
                    }
                }
            } catch (e) {
                console.error(e);
            }
        });


    }
}());