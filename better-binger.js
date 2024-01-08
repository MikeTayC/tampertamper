'use strict';

/**
 * name         Better Binger - Main
 * namespace    http://tampermonkey.net/
 * version      2023-12-09
 * description  try to take over the world!
 * author       You
 * match        *://*.aniwave.to/watch/*
 * match        *://*.aniwave.bz/watch/*
 * match        *://*.aniwave.ws/watch/*
 * match        *://*.aniwave.vc/watch/*
 * icon         https://www.google.com/s2/favicons?sz=64&domain=aniwave.to
 * require      file:///Users/miketay/Volumes/Tools/tampertamper/better-binger.js
 * run-at       document-start
 * grant        unsafeWindow
 */

const playerSelect = '#player';
const playButtonSelect = '.play';
const backSelect = 'div.ctrl.forward.prev';
const nextSelect = 'div.ctrl.forward.next';

const BETTER_BINGER = 'BETTER_BINGER';


var iframeWindow;
var Player;

// TODO remove temp
var fullScreenAttempt = 0;
var screenStatus;

// Custom Logger Window
var logCount = 0;
var customLogger;
var enalbeCustomLog = true;

function initCustomLogger() {
    try {
        if (enalbeCustomLog && !customLogger) {
            customLogger = window.open('', 'CustomLogger', 'width=200, height=100');
            customLogger?.document.write('<hr style: 15px #bbb;/><h2>Custom Console Log</h3><hr style: 15px #bbb;/>');
            customLogger?.document.write(`
                <script>  
                    window.addEventListener('message', (event) => {
                        document.body.insertAdjacentHTML('beforeend', event.data);
                    }, false);
                </script>
            `);

            customLogger?.stop();
        }
    } catch (e) {
        // console.error(e);
    }
}

function closeCustomLogger() {
    customLogger?.close();
}

function customLog(log) {
    logCount++;
    if (enalbeCustomLog) {
        initCustomLogger();
        // customLogger?.document.write(`<h5>Log #${logCount} @ ${(new Date()).toISOString()}</h5>`);
        customLogger?.postMessage(`<h5>Log #${logCount} @ ${(new Date()).toISOString()}</h5>`);
        customLogger?.console.log(`Log #${logCount}`);
        if (typeof log === 'object') {
            if (log.message || log.stack) {
                customLogger?.postMessage(`<div style="font-weight:bold;">${log.message}</div><pre style="background-color:#eee;text-wrap:pretty;">${JSON.stringify(log.stack).split("\\n").join("<br>")}</pre> <hr/>`);
            } else {
                customLogger?.postMessage(`<pre style="background-color:#eee;text-wrap:pretty;">${JSON.stringify(log)}</pre> <hr/>`);
            }
            customLogger?.console.dir(log);
        } else {
            customLogger?.postMessage(`<pre style="background-color:#eee;text-wrap:pretty;">${log}</pre> <hr/>`);
            customLogger?.console.log(log);
        }
    }
}


function l(e) {
    // using error so it's easier to filter console logs
    console.error(e);
    try {
        customLog(e);
    } catch (err) {
        console.error(err);
        customLog(err);
    }
}

function getPathTo(elm) {
    try {
        var segs, i, sib;
        var allNodes = document.getElementsByTagName('*');
        for (segs = []; elm && elm.nodeType === 1; elm = elm.parentNode) {
            if (elm.hasAttribute('id')) {
                var uniqueIdCount = 0;
                for (var n = 0; n < allNodes.length; n++) {
                    if (allNodes[n].hasAttribute('id') && allNodes[n].id === elm.id) uniqueIdCount++;
                    if (uniqueIdCount > 1) break;
                };
                if (uniqueIdCount === 1) {
                    segs.unshift('id("' + elm.getAttribute('id') + '")');
                    return `PARENT/${segs.join('/')}`;
                }
                segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
            } else if (elm.hasAttribute('class')) {
                segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]');
            } else {
                for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
                    if (sib.localName === elm.localName) {
                        i++;
                    };
                };
                segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
            };
        };
        return `PARENT/${segs.length ? segs.join(' / ') : null}`;
    } catch (e) {
        l(e);
    }
}


function initConsoleProxy() {
    try {
        // function printer(t) {
        //     document.body.insertAdjacentHTML('beforeend', `<br> ${t}`);
        // }

        const handler = {
            get: function (target, prop, receiver) {
                if (prop.indexOf(['table']) !== -1) {
                    return;
                }
                customLog(`prop ${prop}`);
                customLog('A value has been accessed');
                customLog(`target ${typeof target.error}`)
                if (typeof target[prop] === 'function') {
                    customLog(target[prop].toString());
                }
                if (prop === 'table') {

                }

                return Reflect.get(...arguments);

                // if (prop !== 'log') {
                //     return Reflect.get(...arguments);
                // } else {
                //     return target.error;
                // }
            }
        }

        unsafeWindow.console = new Proxy(unsafeWindow.console, handler);

        unsafeWindow.console.log('this is the log');


        // define a new console
        // var console = (function (oldCons) {
        //     customLog(oldCons);
        //     return {
        //         log: function (text) {
        //             customLogger?.console.log(text);
        //             // Your code
        //             customLog(text);
        //         },
        //         info: function (text) {
        //             customLogger?.console.info(text);
        //             // Your code
        //             customLog(text);
        //         },
        //         warn: function (text) {
        //             customLogger?.console.warn(text);
        //             // Your code
        //             customLog(text);
        //         },
        //         error: function (text) {
        //             customLogger?.console.error(text);
        //             // Your code
        //             customLog(text);
        //         }
        //     };
        // }(unsafeWindow.console));

        // Then redefine the old console
    } catch (e) {
        customLog(e);
    }

    unsafeWindow.console.error('ERROR - THIS IS THE REAL TEST');

}



function getPlayer() {
    Player = Player ?? document.querySelector(playerSelect);
    return Player;
}

function getIframeWindow() {
    iframeWindow = iframeWindow ?? (unsafeWindow?.document ?? document).querySelector('#player > iframe')?.contentWindow;
    return iframeWindow;
}

function focusOn(el) {
    try {
        // return false;
        if (el) {
            l(`PARENT/ document.activeElement BEFORE (focus ${el.tagName} ${el.id || el.className})  - ${getPathTo(document.activeElement)}`);
            el.tabIndex = -1;
            el.focus();
            l(`PARENT/ document.activeElement AFTER (focus ${el.tagName} ${el.id || el.className})  - ${getPathTo(document.activeElement)}`);
        } else {
            l('no el to focus');
        }
    } catch (e) {
        l(e);
    }
}

function gesture(el, options) {
    try {
        if (el) {
            l(`document.activeElement BEFORE (gesture ${el.tagName} ${el.id || el.className})  - ${getPathTo(document.activeElement)}`);

            var mousedown = new MouseEvent('mousedown', options || {});
            el.dispatchEvent(mousedown);

            var mousedup = new MouseEvent('mouseup', options || {});
            el.dispatchEvent(mousedup);

            l(`document.activeElement AFTER (gesture ${el.tagName} ${el.id || el.className})  - ${getPathTo(document.activeElement)}`);
        } else {
            l('no el to gesture');
        }
    } catch (e) {
        l(e);
    }
}

function clicker(el, options) {
    try {
        if (el) {
            l(`document.activeElement BEFORE (clicker ${el.tagName} ${el.id || el.className})  - ${getPathTo(document.activeElement)}`);

            var event = new MouseEvent('click', options || {});
            el.dispatchEvent(event);

            l(`document.activeElement after (clicker ${el.tagName} ${el.id || el.className})  - ${getPathTo(document.activeElement)}`);
        } else {
            l('no el to click');
        }
    } catch (e) {
        l(e);
    }
}

function postToJW(what, when) {
    try {
        if (getIframeWindow()) {
            if (typeof what === 'string') {
                var s = what;
                what = {
                    str: s
                }
            }

            what.id = BETTER_BINGER;
            l(JSON.stringify(what));
            getIframeWindow().postMessage(what, when || '*');
        }
    } catch (e) {
        l(e);
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
            var h1 = document.querySelector("#w-info h1")?.innerHTML;
            var b = document.querySelectorAll('#w-episodes ul .active > b');
            var sp = document.querySelectorAll('#w-episodes ul .active > span');
            l({
                b: 'b',
                bb: b
            });
            l({
                sp: 'sp',
                spsp: sp
            });
            l(`${h1} - Ep. ${b.length > 0 ? b[b.length - 1]?.innerHTML : 'n/a'} - ${sp.length > 1 ? sp[sp.length - 1]?.innerHTML : 'n/a'}`);

            setTimeout(() => {
                // query for the selector again in case the default auto play worked
                clicker(document.querySelector(playButtonSelect));
            }, 1000);
        }).catch((e) => {
            l('caught in wait for mutant error');
            l(e);
        });
    } catch (e) {
        l(e);
    }
}

// TODO remove mutantType - not needed
function promisePlayer(player, mutantType, options) {
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

function initFullScreen(scope) {
    fullScreenAttempt++;
    if (!document.fullscreenElement) {
        var player = getPlayer();
        if (player) {
            focusOn(getIframeWindow());

            // if (!isInFullScreen) {
            //     if (player.requestFullscreen) {
            //         player.requestFullscreen();
            //     } else if (player.mozRequestFullScreen) {
            //         player.mozRequestFullScreen();
            //         alert("Mozilla entering fullscreen!");
            //     } else if (player.webkitRequestFullScreen) {
            //         player.webkitRequestFullScreen();
            //         alert("Webkit entering fullscreen!");
            //     }
            // }


            player.requestFullscreen().then(() => {
                l(`Fullscreen SUCESSS From PARENT ; Attempt #${fullScreenAttempt}`);
            }).catch(
                (e) => {
                    l(`Fullscreen ERROR From PARENT: ${e.message}; Attempt #${fullScreenAttempt}`);
                    // will make a full screen attempt
                    // postToJW({ 
                    //     fullscreen: true
                    // });
                }
            );
        } else {
            // TODO we can remove when done with dev
            l(`Fullscreen NO PLAYER From PARENT; Attempt #${fullScreenAttempt}`);
        }
    } else {
        // TODO we can remove when done with dev
        l(`Fullscreen ALREADY From PARENT; Attempt #${fullScreenAttempt}`);
    }
}

function hotKeyPress(ev) {
    try {
        // Don't rewrite hotkeys or send to iframe if the active element is an input
        if (ev && ev.target && ev.target.tagName !== 'INPUT' && !(ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey)) {
            switch (ev.key) {
                case 'f':
                    try {
                        // exit/enter fullscreen even if the target isn't not in iframe player
                        if (ev.target.id !== 'player') {
                            if (!document.fullscreenElement) {
                                initFullScreen('KeyF');
                            } else {
                                l('Exiting Full Screen');
                                document.exitFullscreen();
                            }
                        }
                    } catch (e) {
                        l(`ERROR ${ev.key} : PARENT SCOPE KEY PRESS; target tag: ${ev.target.tagName}; target id ${ev.target.id}`);
                    }
                    break;

                case 'i':
                    try {
                        clicker(document.querySelector('#controls .ctrl.check.auto-skip'));
                    } catch (e) {
                        l(e);
                    }
                    break;

                case '\\':
                    l(`it's an \\`);

                    window.location.href = '/home';
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
                    l(`${ev.key} : PARENT SCOPE KEY PRESS; target tag: ${ev.target.tagName}; target id ${ev.target.id}`);
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

function checkScreen() {
    screenStatus = !!document.fullscreenElement;
    l(`Parent BOOL Status fullscreenElement: ${screenStatus}`);

    var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) || (document.mozFullScreen || document.webkitIsFullScreen);
    l(`Parent Status isInFullScreen: ${isInFullScreen}`);

    l(`Parent  Status document.mozFullScreen: ${document.mozFullScreen}`);

    l(`Parent Status document.webkitIsFullScreen: ${document.webkitIsFullScreen}`);

    l(`Parent  Status document.webkitFullScreenKeyboardInputAllowed: ${document.webkitFullScreenKeyboardInputAllowed}`);
    l(`Parent  Status document.webkitRequestFullScreen: ${document.webkitRequestFullScreen}`);

}

function initBetterListeners() {
    try {
        window.addEventListener('keydown', hotKeyPress);
        window.addEventListener('message', (event) => {
            if (event?.data?.id === BETTER_BINGER) {
                event.data.sourced = 'IFRAME';
                l(JSON.stringify(event.data));
                switch (event.data.key) {
                    case 'n':
                        clicker(document.querySelector(nextSelect));
                        break;
                    case 'b':
                        clicker(document.querySelector(backSelect));
                        break;

                    case 'i':
                        clicker(document.querySelector('#controls .ctrl.check.auto-skip'));
                        break;
                    case 'initFullScreen':
                        if (!document.fullscreenElement) {
                            initFullScreen('from iframe postMessage');
                        }
                    case 'f':
                        if (!document.fullscreenElement) {
                            initFullScreen('from iframe postMessage');
                        } else {
                            document.exitFullscreen();
                        }
                        break;
                    default:
                        // do nothing;

                        break;
                }
            }
        }, false);

        document.addEventListener('fullscreenchange', () => {
            try {
                l({
                    fullscreenEvent: 'fullscreenchange',
                    documentActiveID: document.activeElement?.id,
                    documentActiveTag: document.activeElement?.tagName,
                    documentActiveClassName: document.activeElement?.className,
                    activeXpath: getPathTo(document.activeElement)
                });

                checkScreen();
                focusOn(getIframeWindow());
            } catch (e) {
                l(e);
            }
        });

        document.addEventListener('fullscreenerror', () => {
            try {
                l({
                    fullscreenEvent: 'fullscreenerror',
                    documentActiveID: document.activeElement?.id,
                    documentActiveTag: document.activeElement?.tagName,
                    documentActiveClassName: document.activeElement?.className,
                    activeXpath: getPathTo(document.activeElement)
                });

                checkScreen();

                focusOn(getIframeWindow());
            } catch (e) {
                l(e);
            }
        });
    } catch (e) {
        l(e);
    }
}

function waitForPlayer(scope) {
    try {
        var player = getPlayer();
        promisePlayer(player, 'childList', {
            childList: true,
            subtree: true
        }).then((iframeElement) => {
            iframeElement.addEventListener('load', () => {
                if (!document.fullscreenElement) {
                    initFullScreen(scope);
                }
                // Reset to known iframe
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
                            if (!document.fullscreenElement) {
                                waitForPlayer('ajax');
                            }
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
    l(`Better Binger Main - ${window.location.href}`);
    try {
        // initConsoleProxy();
        initCustomLogger();

        // needs to be set early at start of document 
        initBetterListeners();

        // needs to be run after document/window load
        window.addEventListener('load', () => {
            waitForPlayButton();
            waitForPlayer('Main Window Load');
            watchForAjax();
        });


        window.addEventListener("beforeunload", (event) => {
            l({
                eventType: 'onbeforreload',
                event: event
            });

            // closeCustomLogger();
        });
    } catch (e) {
        l(e);
    }
}());