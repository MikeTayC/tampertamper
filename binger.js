// ==UserScript==
// @name         (MODIFIED v2) AniWave Bingewatcher+
// @namespace    https://greasyfork.org/en/users/10118-drhouse
// @version      6.3
// @description  Auto-fullscreen, skip intros, jump to next episode, 9anime on Vidstream and MyCloud videos (Auto-1080p in configuration panel)
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
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require      https://greasyfork.org/scripts/439099-monkeyconfig-modern-reloaded/code/MonkeyConfig%20Modern%20Reloaded.js?version=1012538
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @require      https://greasyfork.org/scripts/451088-utils-library/code/Utils%20-%20Library.js?version=1097324
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_notification
// @grant        window.onurlchange
// @author       drhouse
// @license      CC-BY-NC-SA-4.0
// @icon         https://www.google.com/s2/favicons?domain=9anime.to
// @downloadURL https://update.greasyfork.org/scripts/401339/%289anime%29%20AniWave%20Bingewatcher%2B.user.js
// @updateURL https://update.greasyfork.org/scripts/401339/%289anime%29%20AniWave%20Bingewatcher%2B.meta.js
// ==/UserScript==
/* global jQuery, $ */
this.$ = this.jQuery = jQuery.noConflict(true);

var intervalCounter = 0;

function keyLogger(ev) {
    if (ev) {
        var code = ev.code || ev.originalEvent.code;
        switch (code) {
            case 'MetaLeft':
            case 'NumpadSubtract':
            case 'NumpadAdd':
                //do nothing
                break;
            default:
                console.error(`EVENT: ${code}`);
                if (event.originalEvent.code) {
                    console.error('This was a body trigger event from jquery');
                    console.log(ev)
                }
                break;
        }
    }
}

$(window).on("load", function () {
    try {
        window.addEventListener("keydown", keyLogger);
        window.addEventListener("keyup", keyLogger);
        window.addEventListener("keypress", keyLogger);
        $("body").keypress(keyLogger);

    } catch (e) {
        console.error(e);
    }


    var cfg = new MonkeyConfig({
        title: "Configure",
        menuCommand: true,
        params: {
            "Automatic Highest Quality": {
                type: "checkbox",
                default: true,
            },
            Skip_Anime_Intro_Key: {
                type: "text",
                default: "v",
            },
            "Skip Anime Intro Time": {
                type: "number",
                default: "89",
            },
            Next_Episode_Key: {
                type: "text",
                default: "n",
            },
            Skip_Company_ID_Key: {
                type: "text",
                default: "q",
            },
            "Skip Company ID Time": {
                type: "number",
                default: "10",
            },
            "Automatic Skip Company ID": {
                type: "checkbox",
                default: false,
            }
        },
        // onSave: setOptions
    });

    function openFullscreen(elem) {
        console.error("openFullscreen hit");

        if (elem) {
            console.error("openFullscreen - elem exists");
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                /* Firefox */
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                /* Chrome, Safari and Opera */
                elem.webkitRequestFullscreen();

                console.error("webkitRequestFullscreen");
            } else if (elem.msRequestFullscreen) {
                /* IE / Edge */
                elem.msRequestFullscreen();
            }
        }
    }

    var time = 1000;

    var player = $('#player');

    var player = document.getElementById('#player');
    console.error('is it working')
    if (player) {
        console.log('is it working 2')

        setTimeout(function () {
    
            if (player) {
                var rfs = player.requestFullscreen || player.webkitRequestFullScreen || player.mozRequestFullScreen || player.msRequestFullscreen;
                // rfs.call(player);
                console.error('rfs start');
                console.error(player.requestFullscreen);
                console.error(player.webkitRequestFullScreen);
                console.error(player.mozRequestFullScreen);
                console.error(player.msRequestFullscreen);
                console.error('rfs end');
               
            }

        

            // If the player element exists and supports fullscreen mode
            if (player && player.requestFullscreen && !window.location.href.includes("movies7")) {
                console.error('waitForElementToDisplay -  player AND player.requestFullscreen')
                // Activate fullscreen mode on page load
                player.requestFullscreen();
                $(player).focus();

            }
        }, 1000);

        var newYearCountdown = setInterval(function () {
            var player = $("video").get(0);
            console.error("newYearCountdown - player actual");
            console.error(player);

            if (player) {
                var duration = player.duration;
                var current = player.currentTime;

                console.error(player.duration)
                console.error(player.currentTime)

                $("body").keypress(function (event) {
                    var key = event.keyCode ? event.keyCode : event.which;

                    var x = String.fromCharCode(key);

                    console.error("keypress");
                    console.error(x);

                    console.error(key);


                    if (x == cfg.get("Skip_Anime_Intro_Key")) {
                        // V key skip 89s
                        player.currentTime =
                            current +
                            Number(cfg.get("Skip Anime Intro Time"));
                        console.error("keeypress V");
                    }
                    if (x == cfg.get("Next_Episode_Key")) {
                        // N key skip end
                        player.currentTime = player.duration;
                        console.error("keeypress N");
                    }
                });
            }
        }, 1000);
    } else {
        var waitedTooLong = setTimeout(function () {
            waitForElementToDisplay(selector, time);
        }, time);
    }


    if (intervalCounter > 20) {
        clearInterval(newYearCountdown)
        clearTimeout(waitedTooLong);
        console.error('clearing the interval')
    }
    intervalCounter++



    const runOnURLChange = () => {
        window.addEventListener("urlchange", (info) => {
            utils.waitForElement("#player").then(function () {

                console.error('urlchange - waiting for #player')


                setTimeout(function () {
                    var video = $("#player").get(0);

                    console.error('urlchange - settimeout - video')
                    console.error(video)
                    var player = $("#player")[0];

                    console.error('settimeout - player')
                    console.error(player)

                    $("body").click();

                    if (player && player.requestFullscreen && !window.location.href.includes("movies7")) {
                        console.error('urlchange - settimeout - player and requestFullScreen')
                        player.requestFullscreen();
                        $(player).focus();
                    }
                }, 1000);
            });
        });
    };
});
