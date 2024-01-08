'use strict';

const watch = '/user/watch-list';
const continued = '/user/continue-watching';

// TODO hotkey that redirects to the last watched video - may need an ajax and dom read

function l(e) {
    // using error so it's easier to filter console logs
    if (typeof e === 'object') {
        if (!e.message) {
            console.error(JSON.stringify(e));
        }
    }
    console.error(e);

    // alert(e);
}

(function () {
    try {
        window.addEventListener('keydown', (ev) => {
            try {
                // new hotkeys for easier navigation of catalog
                if (ev && !(ev.target?.tagName === 'INPUT')) {
                    switch (ev.key) {
                        case 'w':
                            if (window.location.href.indexOf(watch) === -1) {
                                window.location.assign(watch);
                            }
                            break;
                        case 'c':
                            if (window.location.href.indexOf(continued) === -1) {
                                window.location.assign(continued);
                            }
                            break;
                        case '`':
                        case 'l':

                            if (window.location.href.indexOf(continued) !== -1) {
                                var ani = document.querySelector('#list-items')?.firstElementChild?.querySelector('a');
                                if (ani) {
                                    ani?.focus();
                                    ani?.click();
                                }
                            } else {
                                window.location.assign(`${continued}?first=true`);
                            }
                            break;
                        case '\\':
                            window.location.href = '/home';
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
    } catch (e) {
        l(e);
    }

    if (window.location.href.indexOf(continued) !== -1) {
        var query = window.location.search?.split('?');
        if (query.length) {
            var params = query[1]?.split('&');
            if (params && params.indexOf('first=true') !== -1) {
                l('it was actually found')
                var ani = document.querySelector('#list-items')?.firstElementChild?.querySelector('a');
                if (ani) {
                    ani?.focus();
                    ani?.click();
                }
            }
        }
    }
}());