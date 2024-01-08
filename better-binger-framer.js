'use strict';

/**
 * name         Better Binger - Iframe Handler
 * namespace    http://tampermonkey.net/
 * version      2023-12-09
 * description  try to take over the world!
 * author       You
 * match        *://*.vidplay.online/*
 * icon         https://www.google.com/s2/favicons?sz=64&domain=aniwave.to
 * require      file:////Users/miketay/Volumes/Tools/tampertamper/better-binger-framer.js
 * run-at       document-idle
 * grant        unsafeWindow
 */

// TODO on catalog search use 'j' to autofilter japan
// TODO autonext into the next the season
// TODO hotkey for playback rate dec/inc (h/j) 
// TODO iframetester script to increase height/width
// TODO tamper script that adds a hotkey to reset the activeleement scope 
// TODO keydown skip actions if meta/control/command are down
// TODO On continue watching - on hover, if X is pressed then remove from history
// TODO try document.querySelectorAll(".jw-wrapper .jw-controls .jw-button-container .jw-icon-fullscreen")[1].click()

// Simple ID so we can easily screen the cross domain talk
const BETTER_BINGER = 'BETTER_BINGER';

// global jwplayer JS object
var jw;

// TODO remove temp
var fullScreenAttempt = 0;

var logCount = 0;
var customIframeLogger;
var enalbeCustomLog = false;

function initCustomLogger() {
    try {
        if (enalbeCustomLog && !customIframeLogger) {
            customIframeLogger = window.open('', 'IframeLogger', 'width=200, height=100');
            customIframeLogger?.document.write('<hr style: 15px #bbb;/><h2>IFRAME Console Log</h3><hr style: 15px #bbb;/>');
            customIframeLogger?.document.write(`
                <script>
                    window.addEventListener('message', (event) => {
                        document.body.insertAdjacentHTML('beforeend', event.data);
                    }, false);
                </script>
            `);

            customIframeLogger.stop();
        }
    } catch (e) {
        // console.error(e);
    }
}

function closeCustomLogger() {
    customIframeLogger.close();
}

function customLog(log) {
    logCount++;
    if (enalbeCustomLog) {
        initCustomLogger();
        // customIframeLogger?.document.write(`<h5>Log #${logCount} @ ${(new Date()).toISOString()}</h5>`);
        customIframeLogger.postMessage(`<h5>Log #${logCount} @ ${(new Date()).toISOString()}</h5>`);
        customIframeLogger.console.log(`Log #${logCount}`);
        if (typeof log === 'object') {
            if (log.message || log.stack) {
                customIframeLogger?.postMessage(`<div style="font-weight:bold;">${log.message}</div><pre style="background-color:#eee;text-wrap:pretty;">${JSON.stringify(log.stack).split("\\n").join("<br>")}</pre> <hr/>`);
            } else {
                customIframeLogger?.postMessage(`<pre style="background-color:#eee;text-wrap:pretty;">${JSON.stringify(log)}</pre> <hr/>`);
            }
            customIframeLogger?.console.dir(log);
        } else {
            customIframeLogger?.postMessage(`<pre style="background-color:#eee;text-wrap:pretty;">${log}</pre> <hr/>`);
            customIframeLogger?.console.log(log);
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


function postIt(what, when) {
    if (typeof what === 'string') {
        var s = what;
        what = {
            str: s
        };
    }


    what.id = BETTER_BINGER;
    try {
        // what.fullScreenStatusCheck = `IFRAMEPARENT - parent doc fullscreenElement ${unsafeWindow?.parent?.document?.fullscreenElement}`;
    } catch (e) {
        l(e);
    }
    window.parent.postMessage(what, when || '*');
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
                    return `IFRAME/${segs.join('/')}`;
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
            }
        }
        return `IFRAMESCRIPT/${segs.length ? segs.join(' / ') : null}`;
    } catch (e) {
        l(e);
    }
}

function focusOn(el) {
    try {
        return false;
        if (el) {
            l(`IFRAME/ document.activeElement BEFORE (focus ${el.tagName} ${el.id || el.className})  - ${getPathTo(document.activeElement)}`);
            el.tabIndex = -1;
            el.focus();
            l(`IFRAME/ document.activeElement AFTER (focus ${el.tagName} ${el.id || el.className})  - ${getPathTo(document.activeElement)}`);
        } else {
            l('no el to gesture');
        }
    } catch (e) {
        l(e);
    }
}


const asyncInterval = async (callback, ms, triesLeft = 5) => {
    return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
            if (await callback()) {
                resolve();
                clearInterval(interval);
            } else if (triesLeft <= 1) {
                reject();
                clearInterval(interval);
            }
            triesLeft--;
        }, ms);
    });
};

function initHotKeys(key) {
    // jwplayer must be initialized for these to work
    jw = jw || unsafeWindow?.jwplayer();
    if (!jw) return postIt('No jw initHotKeys');
    switch (key) {
        case 'ArrowRight':
            // Right/Left arrows to skip time even if the active element isn't on the player/iframe
            jw.seek(jw.getPosition() + 5);
            break;
        case 'ArrowLeft':
            jw.seek(jw.getPosition() - 5);
            break;
        case 'ArrowUp':
            // TODO figure out best way to stop scroll while volume changes
            jw.setVolume(jw.getVolume() + 10);
            break;
        case 'ArrowDown':
            jw.setVolume(jw.getVolume() - 10);
            break;
        case 'v':
            // TODO make config - Set to default volume (in case it's coming from parent window.)
            jw.setVolume(10);
            break;
        case 'x':
            // bigger skip (useful when intro/outro autoskip fail)
            jw.seek(jw.getPosition() + 90);
            break;
        case '`':
            jw.seek(0);
            break;
        case '0':
            // Overwrites the default hotkey to skip to the end of the video (using key "`" to get to start of video instead)
            jw.seek(jw.getDuration() - 1);
            break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            // fallthrough - Transfering hotkeys 1 to 9 so they still work when active element is not on player/iframe
            jw.seek((key / 10) * jw.getDuration());
            break;
        default:
            // do nothing;
            break;
    }
}

/**
 * This will function as the final fallback in case all other attmepts to get to full screen fail.
 * 
 * the Element.requestFullscreen() can be unreliable due to permissions anc cross-origina scripting 
 * prevention. It seems to be intermittent, so if the auto full screen still fails, then simply try
 * refreshing the page.
 */
function initFullScreen(scope) {
    try {
        fullScreenAttempt++;
        // no need to try to set full screen if it is already
        if (!jw?.getFullscreen()) {
            var player = document.querySelector('#player');
            if (player) {
                // requestFullscreen is more likely to work after user gesture - simulating using jwplayers display click event (may cause video to pause/play)
                player.requestFullscreen()
                    .then((e) => {
                        postIt(`Fullscreeen SUCESSS From IFRAME; Attempt #${fullScreenAttempt}; Scope: ${scope}`);
                    })
                    .catch((e) => {
                        postIt(`Fullscreeen ERROR From IFRAME: ${e.message}; Attempt #${fullScreenAttempt}; Scope: ${scope}`);
                    });
            } else {
                // TODO we can remove when done with dev
                l(`Fullscreeen NO PLAYER From IFRAME; Attempt #${fullScreenAttempt};  Scope: ${scope}`);
            }
        } else {
            // TODO we can remove when done with dev
            l(`Fullscreeen ALREADY From IFRAME; Attempt #${fullScreenAttempt};  Scope:L ${scope}`);
        }
    } catch (e) {
        postIt(`Fullscreeen GENERAL ERROR From IFRAME; Attempt ${fullScreenAttempt}; Scope: ${scope}; Msg: ${e.message}`);
    }
}

function initIframeListeners() {
    window.addEventListener('keydown', (ev) => {
        try {
            if (ev && !(ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey)) {
                // important - returns keydown scope to parent
                postIt({
                    key: ev.key,
                    msg: `${ev.key} : IFRAME SCOPE KEY DOWN; target path ${getPathTo(ev.target)}` // TODO remove
                });

                // Hotkey overwrites
                switch (ev.key) {
                    case '`':
                        // use ` as hotkey to restart video (in addition to 0 key)
                        jw.seek(0);
                        break;
                    case '0':
                        jw.seek(jw.getDuration() - 1);
                        break;
                    case 'v':
                        // TODO make config - Set to default volume
                        jw.setVolume(10);
                        break;

                    case 'x':
                        jw.seek(jw.getPosition() + 90);
                        break;
                    case 'p':

                        postIt({
                            key: 'position',
                            v: jw.getPosition()
                        });

                        postIt({
                            key: 'getDuration',
                            v: jw.getDuration()
                        });
                        postIt({
                            key: 'getAbsolutePosition',
                            v: jw.getAbsolutePosition()
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
    });

    window.addEventListener('message', (event) => {
        try {
            if (event?.data?.id === BETTER_BINGER) {
                event.data.msg = 'MESSAGE TO IFRAME FROM PARENT';
                postIt(event.data);

                // posting the hotkeys presses that occur when the active element isn't on the video player/iframe
                initHotKeys(event.data.key);

                // if data.fullscreen is true, then the requestFullscreen() on the parent window failed, we'll try in the iframe scope as well.
                // if (event.data.fullscreen) {
                //     initFullScreen('postMessage');
                // }
            }
        } catch (e) {
            postIt(`iframe message listner: ${e.message}`);
        }
    }, false);
}

function jwplayerWrapper(callback) {
    return asyncInterval(() => {
        if (unsafeWindow?.jwplayer) {
            // Set the global jw player
            jw = unsafeWindow.jwplayer();
            callback();
            return true;
        }
        return false;
    }, 1000);
}

/**
 * Auto Set the quality control to highest possible(index 0: auto, 1: highest);
 */
function autoSetQuality() {
    // TODO MAKE CONFIG WRAPPER
    if (jw?.getCurrentQuality() !== 1) {
        jw.setCurrentQuality(1);
    }
}


function jwListens() {
    jw?.once('time', (ev) => {
        try {
            postIt({
                key: 'initFullScreen',
                type: ev,
                msg: 'First JW Time event'
            });

            focusOn(document.querySelector('#player'))
        } catch (e) {
            // do nada
            l(e)
        }
    });

    jw?.once('bufferChange', (ev) => {
        try {
            postIt({
                key: 'bufferChange',
                type: ev,
                msg: 'First JW bufferChange event'
            });
        } catch (e) {
            // do nada
            l(e)
        }
    });

    jw.on('firstFrame', (ev) => {
        try {
            postIt({
                key: 'firstFrame',
                type: ev,
                msg: 'on JW firstFrame '
            });
        } catch (e) {
            // do nada
            l(e)
        }
    });

    jw?.on('playAttemptFailed', (ev) => {
        try {
            postIt({
                key: 'playAttemptFailed',
                type: ev,
                msg: 'on JW playAttemptFailed event'
            });
        } catch (e) {
            // do nada
            l(e)
        }
    });

    jw?.on('error', (ev) => {
        try {
            postIt({
                key: 'error',
                type: ev,
                msg: 'on JW error event'
            });
        } catch (e) {
            // do nada
            l(e)
        }
    });

    jw?.on('complete', (ev) => {
        try {
            postIt({
                key: 'complete',
                type: ev,
                msg: 'on JW complete event'
            });
        } catch (e) {
            // do nada
            l(e)
        }
    });
    jw?.on('nextClick', (ev) => {
        try {
            postIt({
                key: 'nextClick',
                type: ev,
                msg: 'on JW nextClick event'
            });
        } catch (e) {
            // do nada
            l(e)
        }
    });

    jw?.on('playlistComplete', (ev) => {
        try {
            postIt({
                key: 'playlistComplete',
                type: ev,
                msg: 'on JW playlistComplete event'
            });
        } catch (e) {
            // do nada
            l(e)
        }
    });

    jw?.on('beforeComplete', (ev) => {
        try {
            postIt({
                key: 'beforeComplete',
                type: ev,
                msg: 'on JW beforeComplete event'
            });
        } catch (e) {
            // do nada
            l(e)
        }
    });
}


(function () {
    // This is meaant to trigger on iframes playing video with JWPlayer
    if (window.self !== window.top) {
        initCustomLogger()
        // listners to be defined first and have no dependancies 
        initIframeListeners();

        // async interval wrapper that waits for unsafeWindow.jwplayer to exists then executes the callback
        jwplayerWrapper(() => {
            jwListens();
            autoSetQuality();
            focusOn(document.querySelector('#player'));
        }).then(() => {
            focusOn(document.querySelector('#player'));
        }).catch((e) => {
            focusOn(document.querySelector('#player'));
        });
    }
}());