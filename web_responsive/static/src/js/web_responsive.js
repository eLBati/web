/* Copyright 2018 Tecnativa - Jairo Llopis
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

odoo.define('web_responsive', function (require) {
    'use strict';

    var AppsMenu = require("web.AppsMenu");
    var config = require("web.config");
    var core = require("web.core");
    var Menu = require("web.Menu");

    /**
     * Generate data in a searchable format understandable by fuzzy.js
     *
     * @param {Object} menu In the format returned from ir.ui.menu.load_menus
     * @returns {Array} It contains many sublevel; you should flatten it
     */
    function findNames (menu) {
        if (menu.action && !menu.children.length) {
            var result = {}, key = menu.parent_id[1];
            if (_.isUndefined(key)) {
                key = "";
            } else {
                key += "/";
            }
            result[key + menu.name] = menu;
            return result;
        }
        return menu.children.map(findNames);
    }

    AppsMenu.include({
        events: _.extend({
            "keydown .search-input": "_searchResultsNavigate",
            "click .o-menu-search-result": "_searchResultChosen",
            "shown.bs.dropdown": "_searchFocus",
            "hidden.bs.dropdown": "_searchReset",
        }, AppsMenu.prototype.events),

        /**
         * Rescue some menu data stripped out in original method.
         *
         * @override
         */
        init: function (parent, menuData) {
            this._super.apply(this, arguments);
            // Keep base64 icon for main menus
            for (var n in this._apps) {
                this._apps[n].web_icon_data =
                    menuData.children[n].web_icon_data;
            }
            // Store menu data in a format searchable by fuzzy.js
            this._searchableMenus =_.extend.apply(_,
                _.flatten(menuData.children.map(findNames))
            );
            // Search only after timeout, for fast typers
            this._search_def = $.Deferred();
        },

        /**
         * @override
         */
        start: function () {
            this.$search_container = this.$(".search-container");
            this.$search_input = this.$(".search-input");
            this.$search_results = this.$(".search-results");
            return this._super.apply(this, arguments);
        },

        /**
         * Get all info for a given menu.
         *
         * @param {String} key
         * Full path to requested menu.
         *
         * @returns {Object}
         * Menu definition, plus extra needed keys.
         */
        _menuInfo: function (key) {
            var original = this._searchableMenus[key];
            return _.extend({
                action_id: parseInt(original.action.split(',')[1], 10),
            }, original);
        },

        /**
         * Autofocus on search field on big screens.
         */
        _searchFocus: function () {
            if (!config.device.isMobile) {
                this.$search_input.focus();
            }
        },

        /**
         * Reset search input and results
         */
        _searchReset: function () {
            this.$search_results.empty();
            this.$search_input.val("");
        },

        /**
         * Schedule a search on current menu items.
         */
        _searchMenusSchedule: function () {
            this._search_def.reject();
            this._search_def = $.Deferred();
            setTimeout(this._search_def.resolve.bind(this._search_def), 50);
            this._search_def.done(this._searchMenus.bind(this));
        },

        /**
         * Search among available menu items, and render that search.
         */
        _searchMenus: function () {
            var haystack = this.$search_input.val();
            if (haystack === "") {
                this.$search_container.removeClass("has-results");
                this.$search_results.empty();
                return;
            }
            var results = fuzzy.filter(
                haystack,
                _.keys(this._searchableMenus),
                {
                    pre: "<b>",
                    post: "</b>",
                }
            );
            this.$search_container.toggleClass(
                "has-results",
                Boolean(results.length)
            );
            this.$search_results.html(
                core.qweb.render(
                    "web_responsive.MenuSearchResults",
                    {
                        results: results,
                        widget: this,
                    }
                )
            );
        },

        /**
         * Use chooses a search result, so we navigate to that menu
         *
         * @param {jQuery.Event} event
         */
        _searchResultChosen: function (event) {
            event.preventDefault();
            var $result = $(event.currentTarget),
                text = $result.text(),
                data = $result.data(),
                suffix = ~text.indexOf("/") ? "/" : "";
            // Load the menu view
            this.trigger_up("menu_clicked", {
                action_id: data.actionId,
                id: data.menuId,
                previous_menu_id: data.parentId,
            });
            // Find app that owns the chosen menu
            var app = _.find(this._apps, function (_app) {
                return text.indexOf(_app.name + suffix) === 0;
            });
            // Update navbar menus
            core.bus.trigger("change_menu_section", app.menuID);
        },

        /**
         * Navigate among search results
         *
         * @param {jQuery.Event} event
         */
        _searchResultsNavigate: function (event) {
            // Exit soon when not navigating results
            if (this.$search_results.is(":empty")) {
                // Just in case it is the 1st search
                this._searchMenusSchedule();
                return;
            }
            // Find current results and active element (1st by default)
            var all = this.$search_results.find(".o-menu-search-result"),
                focused = all.filter(".active") || $(all[0]),
                offset = all.index(focused),
                key = event.key;
                // Transform tab presses in arrow presses
            if (key === "Tab") {
                event.preventDefault();
                key = event.shiftKey ? "ArrowUp" : "ArrowDown";
            }
            switch (key) {
            // Pressing enter is the same as clicking on the active element
            case "Enter":
                focused.click();
                break;
            // Navigate up or down
            case "ArrowUp":
                offset--;
                break;
            case "ArrowDown":
                offset++;
                break;
            // Other keys trigger a search
            default:
                this._searchMenusSchedule();
                return;
            }
            // Switch active element
            focused.removeClass("active");
            $(all[offset]).addClass("active");
        },
    });

    Menu.include({
        events: _.extend({
            // Clicking a hamburger menu item should close the hamburger
            "click .o_menu_sections [role=menuitem]": "_hideMobileSubmenus",
            // Opening any dropdown in the navbar should hide the hamburger
            "show.bs.dropdown .o_menu_systray, .o_menu_apps":
                "_hideMobileSubmenus",
        }, Menu.prototype.events),

        /**
         * @override
         */
        start: function () {
            this.$menu_toggle = this.$(".o-menu-toggle");
            return this._super.apply(this, arguments);
        },

        /**
         * Hide menus for current app if you're in mobile
         */
        _hideMobileSubmenus: function () {
            if (
                this.$menu_toggle.is(":visible") &&
                this.$section_placeholder.is(":visible")
            ) {
                this.$section_placeholder.collapse("hide");
            }
        },
    });
});
