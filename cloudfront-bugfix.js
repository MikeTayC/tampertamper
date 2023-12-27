// ==UserScript==
// @name         Aniwave - Fixed Cloudfront bug
// @version      2
// @description bugfix forom vpn
// @match        *://*.aniwave.to/*
// @match        *://*.aniwave.bz/*
// @match        *://*.aniwave.ws/*
// @match        *://*.aniwave.vc/*
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
// @run-at       document-start

// ==/UserScript==

(function () {
    'use strict'

    const originalXMLHttpRequest = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (type, url) {
        try {
            // do URL matching here if needed
            if (url.indexOf('ajax/server/list') !== -1) {
                this.addEventListener('load', function () {
                    // match some JSON values on responseText
                    if (this.responseText) {
                        if (this.status == 403) {
                            window.location.reload()
                        }

                    }
                });
            }

        } catch (e) {
            console.error(e)
        }

        originalXMLHttpRequest.apply(this, arguments)

    };
})();