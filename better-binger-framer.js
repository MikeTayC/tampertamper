'use strict';

// TODO on catalog search use 'j' to autofilter japan
// TODO autonext into the next the season

// Simple ID so we can easily screen the cross domain talk
const BETTER_BINGER = 'BETTER_BINGER';

// global jwplayer JS object
var jw;

function l(e) {
    console.error(e);
}

function postIt(what, when) {
    if (typeof what === 'string') {
        var s = what;
        what = {
            str: s
        };
    }

    what.id = BETTER_BINGER;
    window.parent.postMessage(what, when || '*');
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
    if (!jw) return;
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
function initFullScreen() {
    try {
        var player = document.querySelector('#player');
        if (player) {
            player.requestFullscreen()
                .then((e) => {
                    postIt('SUCCESS REQUEST FULLSCREEN FROM IFRAME');

                    postIt({
                        fullscreenEnabled: document.fullscreenEnabled,
                        fullscreenElement: document.fullscreenElement,
                        webkitFullscreenElement: document.webkitFullscreenElement,
                        mozFullScreenElement: document.mozFullScreenElement,
                        msFullscreenElement: document.msFullscreenElement,
                        jwgetFullscreen: jw?.getFullscreen(),
                        setFullscreen: jw?.setFullscreen
                    });
                })
                .catch((e) => {


                    postIt(`trying request full screen from iframe: ${e.message}`);
                    postIt({
                        fullscreenEnabled: document.fullscreenEnabled,
                        fullscreenElement: document.fullscreenElement,
                        webkitFullscreenElement: document.webkitFullscreenElement,
                        mozFullScreenElement: document.mozFullScreenElement,
                        msFullscreenElement: document.msFullscreenElement,
                        jwgetFullscreen: jw?.getFullscreen(),
                        setFullscreen: jw?.requestFullscreen
                    });
                });
        }
    } catch (e) {
        postIt(e.message);
    }
}

function initIframeListeners() {
    window.addEventListener('keydown', (ev) => {
        try {
            if (ev) {
                // important - returns keydown scope to parent
                postIt({
                    key: ev.key
                }, '*');

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
        if (event?.data?.id === BETTER_BINGER) {
            event.data.msg = 'MESSAGE TO IFRAME FROM PARENT';
            postIt(event.data);

            // posting the hotkeys presses that occur when the active element isn't on the video player/iframe
            initHotKeys(event.data.key);

            // if data.fullscreen is true, then the requestFullscreen() on the parent window failed, we'll try in the iframe scope as well.
            if (event.data.fullscreen) {
                initFullScreen();
            }
        }
    }, false);
}

function jwplayerWrapper(callback) {
    asyncInterval(() => {
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
    jw?.on('fullscreen', () => {
        // minor bugfix - cursor doesn't disappear on fullscreen change under certain conditions
        document.body.style.cursor = 'none';
    });
}

(function () {
    // This is meaant to trigger on iframes playing video with JWPlayer
    if (window.self !== window.top) {
        // listners to be defined first and have no dependancies 
        initIframeListeners();

        // async interval wrapper that waits for unsafeWindow.jwplayer to exists then executes the callback
        jwplayerWrapper(() => {
            jwListens();
            initHotKeys();
            autoSetQuality();
            initFullScreen();

            postIt({
                key: 'returnScope'
            });
        });
    }
}());