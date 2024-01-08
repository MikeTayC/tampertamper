/* eslint-disable */
// https://stackoverflow.com/questions/9454125/javascript-request-fullscreen-is-unreliable 
// Move your fullscreen check into its own function
function isFullScreen() {
    return Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    );
}

// Make DoFullScreen() reusable by passing the element as a parameter
function DoFullScreen(el) {
    // Use a guard clause to exit out of the function immediately
    if (isFullScreen()) return false;
    // Set a default value for your element parameter
    if (el === undefined) el = document.documentElement;
    // Test for the existence of document.fullscreenEnabled instead of requestFullscreen()
    if (document.fullscreenEnabled) {
        el.requestFullscreen();
    } else if (document.webkitFullscreenEnabled) {
        el.webkitRequestFullscreen();
    } else if (document.mozFullScreenEnabled) {
        el.mozRequestFullScreen();
    } else if (document.msFullscreenEnabled) {
        el.msRequestFullscreen();
    }
}

(function () {
    const btnFullscreenContent = document.querySelector(".request-fullscreen-content");
    const el = document.querySelector(".fullscreen-content");
    // Request the .fullscreen-content element go into fullscreen mode
    btnFullscreenContent.addEventListener("click", function () {
        DoFullScreen(el)
    }, false);

    const btnFullscreenDocument = document.querySelector(".request-fullscreen-document");
    // Request the document.documentElement go into fullscreen mode by not passing element
    btnFullscreenDocument.addEventListener("click", function () {
        requestFullscreen()
    }, false);
})();