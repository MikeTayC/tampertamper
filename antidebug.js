// ==UserScript==
// @name         Anti Anti-debugger
// @namespace    https://greasyfork.org/en/users/670188-hacker09?sort=daily_installs
// @version      2
// @description  Stops most anti debugging implementations by JavaScript obfuscaters, and stops the console logs from being automatically cleared.
// @author       hacker09
// @match        https://aniwave.to/*
// @match      https://www*.9anime.*/*
// @match      https://www*.aniwave.*/*
// @match      https://netmovies.to/*
// @match      https://guccihide.com/*
// @match      https://rabbitstream.net/*
// @match      https://sbface.com/*
// @match      https://filemoon.sx/*
// @match      https://9anime.*/*
// @match      https://aniwave.*/*
// @match      https://*.9anime.*/*
// @match      https://*.aniwave.*/*
// @match      https://9anime.id/*
// @match      https://vidstream.pro/*
// @match      https://vidstreamz.online/*
// @match      https://vizcloud.online/*
// @match      https://vizcloud2.online/*
// @match      https://vizcloud.*/*
// @match      https://vizcloud.store/*
// @match      https://blob:vizcloud.store/*
// @match      https://mcloud.to/*
// @match      https://mcloud2.to/*
// @match      https://storage.googleapis.com/*
// @match      https://movies7.to/*
// @match      https://*.mp4upload.com:*/*
// @match      https://*.mp4upload.com*/*
// @grant        unsafeWindow
// @run-at       document-start
// @downloadURL https://update.greasyfork.org/scripts/440060/Anti%20Anti-debugger.user.js
// @updateURL https://update.greasyfork.org/scripts/440060/Anti%20Anti-debugger.meta.js
// ==/UserScript==

(function () {
    'use strict'
    var interval = setInterval(function () { //Creates a new interval function
        unsafeWindow.console.clear = () => {}; //Stops the console logs from being cleared
    }, 0); //Finishes the set interval function


    const originalXMLHttpRequest = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (type, url) {

        try {
            // do URL matching here if needed
            if (url.indexOf('ajax/server/list') !== -1) {
                this.addEventListener('load', function () {
                    console.error('LOAD EVENT - start')

                    // match some JSON values on responseText
                    if (this.responseText) {
                        console.error(this.status == 403);

                        if (this.status == 403) {
                            console.error('Window Reoload');
                            window.location.reload()
                        }

                        console.error('LOAD EVENT - THIS IS THE END')
                    }
                });
            }

        } catch (e) {
            console.error(e)
        }

        originalXMLHttpRequest.apply(this, arguments)

    };

    window.onload = function () //When the page finishes loading
    { //Starts the onload function
        clearInterval(interval); //Breaks the timer that stops the console log from being cleared every 0 secs
    }; //Finishes the onload function

    if (location.href.match(/vidstream.pro|mcloud.to/) === null) //Check the iframe url
    { //Starts the if condition
        var _constructor = unsafeWindow.Function.prototype.constructor;
        unsafeWindow.Function.prototype.constructor = function () { //Hook Function.prototype.constructor

            var fnContent = arguments[0];
            if (fnContent) {
                console.error(fnContent);
                var obsfacated = `"deb" + "u" + (r(541) + "r")`
                if (fnContent.includes(obsfacated)) { //An anti-debugger is attempting to stop debugging
                    console.error('fnContent Included the debugger obs')

                    var caller = Function.prototype.constructor.caller; // Non-standard hack to get the function caller
                    var callerContent = caller.toString();
                        console.error(callerContent);
                        if (callerContent.includes(obsfacated)) {

                            console.error('callerContent Included the debugger obs')

                            // callerContent = callerContent.replace(/\bdebugger\b/gi, '');

                            // eval('caller = ' + callerContent); //Replace the function
                    }                    
                    // return (function () {});

                }
            }

            return _constructor.apply(this, arguments); //Execute the normal function constructor if nothing unusual is going on
        };
    } //Finishes the if condition
})();