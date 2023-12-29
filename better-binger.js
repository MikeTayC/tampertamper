'use strict';

const playerSelect = '#player';
const playButtonSelect = '.play';
const backSelect = 'div.ctrl.forward.prev';
const nextSelect = 'div.ctrl.forward.next';

const BETTER_BINGER = 'BETTER_BINGER';

var iframeWindow;

function l(e) {
    // using error so it's easier to filter console logs
    console.error(e);
}

function clicker(el, options) {
    if (el) {
        var event = new MouseEvent('click', options || {});
        el.dispatchEvent(event);
    } else {
        l('no el to click');
    }
}

function postToJW(what, when) {
    if (iframeWindow) {
        if (typeof what === 'string') {
            var s = what;
            what = {
                str: s
            }
        }

        what.id = BETTER_BINGER;
        iframeWindow.postMessage(what, when || '*');
    }
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

function waitForPlayButton() {
    try {
        waitForElementByMutant(playButtonSelect, 'attributes', 'opacity: 1;', {
            attributes: true,
            attributeFilter: ['style'],
            attributeOldValue: true
        }).then(() => {
            // for good measure delay the click for a bit
            setTimeout(() => {
                // query for the selector again in case the default auto play worked
                clicker(document.querySelector(playButtonSelect));
            }, 500);
        }).catch((e) => {
            l('caught in wait for mutant error');
            l(e);
        });
    } catch (e) {
        l(e);
    }
}

function promisePlayer(player, mutantType, mutantValue, options) {
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

function requestFullScreen() {
    var player = document.querySelector(playerSelect);
    if (player) {
        player.requestFullscreen().catch(
            () => postToJW({
                fullscreen: true
            })
        );
    }
}

function hotKeyPress(ev) {
    try {
        if (ev && ev.target && ev.target.tagName !== 'INPUT') {
            switch (ev.key) {
                case 'f':
                    // exit/enter fullscreen even if the target isn't not in iframe player
                    if (ev.target.id !== 'player') {
                        if (!document.fullscreenElement) {
                            requestFullScreen();
                        } else {
                            document.exitFullscreen();
                        }
                    } else {
                        l(ev.target.id);
                    }
                    break;

                case 'v':
                case 'x':
                case 'ArrowRight':
                case 'ArrowLeft':
                case 'ArrowUp':
                case 'ArrowDown':
                case '`':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                case '0':
                    // send these to jwplayer iframe so the hotkeys still work
                    postToJW({
                        key: ev.key
                    });
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

function initBetterListeners() {
    try {
        window.addEventListener('keydown', hotKeyPress);
        window.addEventListener('message', (event) => {
            if (event?.data?.id === BETTER_BINGER) {
                l(JSON.stringify(event.data));
                switch (event.data.key) {
                    case 'n':
                        clicker(document.querySelector(nextSelect));
                        break;
                    case 'b':
                        clicker(document.querySelector(backSelect));
                        break;
                    default:
                        // do nothing;
                        break;
                }
            }
        }, false);
    } catch (e) {
        l(e);
    }
}

function waitForPlayer() {
    try {
        var player = document.querySelector(playerSelect);
        promisePlayer(player, 'childList', 'iframe', {
            childList: true,
            subtree: true
        }).then((iframeElement) => {
            iframeElement.addEventListener('load', () => {
                if (!document.fullscreenElement) {
                    requestFullScreen();
                }

                iframeWindow = iframeElement.contentWindow;
            });

            // Save the page history (useful for when dev tools redirection happens)
            window.history.pushState({}, '', window.location);
        });
    } catch (e) {
        l(e);
    }
}

function watchForAjax() {
    const originalXMLHttpRequest = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (type, url) {
        try {
            // do URL matching here if needed
            if (url.indexOf('ajax/server/list') !== -1) {
                this.addEventListener('load', function () {
                    // match some JSON values on responseText
                    switch (this.status) {
                        case 200:
                            waitForPlayer();
                            break;
                        case 403:
                            window.location.reload();
                            break;
                        default:
                            // do nothing
                            break;
                    }
                });
            }
        } catch (e) {
            l(e);
        }

        originalXMLHttpRequest.apply(this, arguments);
    };
}

(function () {
    l('Better Binger - Main');
    try {
        // needs to be set early at start of document 
        initBetterListeners();
        watchForAjax();
        // needs to be run after document/window load
        window.addEventListener('load', () => {
            waitForPlayButton();
            waitForPlayer();
        });
    } catch (e) {
        l(e);
    }
}());