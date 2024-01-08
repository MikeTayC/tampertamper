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
        if (!customLogger) {
            customLogger = window.open('', 'CustomLogger', 'width=200, height=100');
            customLogger?.document.write('<hr style: 15px #bbb;/><h2>Custom Console Log</h3><hr style: 15px #bbb;/>');
            customLogger?.document.write(`
                <script>
                    window.addEventListener('message', (event) => {

                        console.log(event.data)
                        console.log(JSON.stringify(event));
                        document.body.insertAdjacentHTML('beforeend', event.data);
                    }, false);


                </script>
            `);

        }
    } catch (e) {
        // console.error(e);
    }
}

function customLog(log) {
    logCount++;
    if (enalbeCustomLog) {
        initCustomLogger();
        customLogger.postMessage(`Log #${logCount}`);
        customLogger?.document.write(`<h5>Log #${logCount} @ ${(new Date()).toISOString()}</h5>`);
        customLogger.console.log(`Log #${logCount}`);
        if (typeof log === 'object') {
            customLogger?.document.write(`<pre style="background-color:#eee;text-wrap:pretty;">${typeof log}</pre> <hr/>`);
            customLogger.console.dir(log);
        } else {
            customLogger?.document.write(`<pre style="background-color:#eee;text-wrap:pretty;">${log}</pre> <hr/>`);
            customLogger?.document.write(`<script>window.parent.focus()</script>`);
            customLogger?.console.log(log);
        }
    }
}


function l(e) {
    // using error so it's easier to filter console logs
    console.error(e);
    try {
        // customLog(e);
    } catch (err) {
        console.error(err);
        // customLog(err);
    }
}

function initConsoleProxy() {
    try {
        // function printer(t) {
        //     document.body.insertAdjacentHTML('beforeend', `<br> ${t}`);
        // }

        const handler = {
            get: function (target, prop, receiver) {
                // if (prop.indexOf(['table', 'warn', 'log']) !== -1) {
                //     return;
                // }
                customLog(`prop ${prop}`);
                customLog('A value has been accessed');
                customLog(`target ${typeof target.error}`)
                if (typeof target[prop] === 'function') {
                    customLog(target[prop].toString());
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
}




(function () {
    l('Better Console');
    try {
        initConsoleProxy();
    } catch (e) {
        l(e);
    }
}());