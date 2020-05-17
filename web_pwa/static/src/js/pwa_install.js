odoo.define('web_pwa.systray.install', function (require) {
"use strict";

var core = require('web.core');
var session = require('web.session');
var SystrayMenu = require('web.SystrayMenu');
var Widget = require('web.Widget');
var QWeb = core.qweb;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/service-worker.js')
        .then(function (reg) {
          console.log('Service worker registered.', reg);
        });
  });
}

var deferredInstallPrompt = null;

var PwaInstall = Widget.extend({
    name: 'pwa_install',
    template:'web_pwa.systray.install',
    events: {
    },
    start: function () {
        window.addEventListener('beforeinstallprompt', this.saveBeforeInstallPromptEvent);
        this.el.addEventListener('click', this.installPWA);
        return this._super.apply(this, arguments);
    },
    saveBeforeInstallPromptEvent: function(evt) {
        deferredInstallPrompt = evt;
        this.el.removeAttribute('hidden');
    },
    installPWA: function (evt) {
        deferredInstallPrompt.prompt();
        // Hide the install button, it can't be called twice.
        this.el.setAttribute('hidden', true);
        // Log user response to prompt.
        deferredInstallPrompt.userChoice
            .then(function (choice) {
              if (choice.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt', choice);
              } else {
                console.log('User dismissed the A2HS prompt', choice);
              }
              deferredInstallPrompt = null;
            });
    },
});

SystrayMenu.Items.push(PwaInstall);

return PwaInstall;

});
