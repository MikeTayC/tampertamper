// ==UserScript==
// @name         Disable pinch zoom
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==


(function () {
    try {
        function stopThePinching(ev) {
            if (ev) {
                switch (ev.code) {
                    case 'MetaLeft':
                    case 'NumpadSubtract':
                    case 'NumpadAdd':
                        ev.preventDefault();
                        break;
                    default:
                        // do nothing
                        break;
                }
            }
        }
        window.addEventListener("keydown", stopThePinching);
        window.addEventListener("keyup", stopThePinching);
    } catch (e) {
        console.error(e);
    }
})();
