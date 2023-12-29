'use strict';

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
    switch (key) {
        case 'ArrowRight':
            jw.seek(jw.getPosition() + 5);
            break;
        case 'ArrowLeft':
            jw.seek(jw.getPosition() - 5);
            break;
        case 'ArrowUp':
            jw.setVolume(jw.getVolume() + 10);
            break;
        case 'ArrowDown':
            jw.setVolume(jw.getVolume() - 10);
            break;
        case 'v':
            // TODO make config - Set to default volume (in case it's coming from parent window.)
            jw?.setVolume(10);
            break;
        case 'x':
            jw.seek(jw.getPosition() + 90);
            break;
        case '`':
            jw.seek(0);
        case '0':
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
            jw.seek((key / 10) * jw.getDuration());
            break;
        default:
            // do nothing;
            break;
    }
}

function initFullScreen(trigger) {
    try {
        if (trigger) {
            jw.setFullScreen();
        }
    } catch (e) {
        postIt(e.message);
    }
}

function initIframeListeners() {
    window.addEventListener('keydown', (ev) => {
        try {
            if (ev) {
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

                postIt({
                    key: ev.key
                }, '*');
            }
        } catch (e) {
            l(e);
        }
    });

    window.addEventListener('message', (event) => {
        if (event?.data?.id === BETTER_BINGER && jw) {
            event.data.msg = 'MESSAGE TO IFRAME FROM';
            postIt(event.data);
            initHotKeys(event.data.key);
            initFullScreen(event.data.fullscreen);
        }
    }, false);
}

function jwplayerWrapper(callback) {
    asyncInterval(() => {
        if (unsafeWindow?.jwplayer) {
            // Set the global wrapper
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


(function () {
    // This is meaant to trigger on iframes playing video with JWPlayer
    if (window.self !== window.top) {
        initIframeListeners();

        // async interval wrapper that waits for unsafeWindow.jwplayer to exists then executes the callback
        jwplayerWrapper(() => {
            initHotKeys();

            autoSetQuality();

            // postIt({
            //     v: 'getCaptionsList',
            //     getCaptionsList: jw.getCaptionsList()
            // });
        });
    }
}());