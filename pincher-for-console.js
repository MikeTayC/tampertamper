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