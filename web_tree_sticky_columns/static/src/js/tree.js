/* Copyright 2019 Onestein
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define('web_o2m_fixed_columns.tree', function (require) {
    "use strict";

    var ListRenderer = require('web.ListRenderer');

    ListRenderer.include({

        _renderHeaderCell: function (node) {
            var res = this._super.apply(this, arguments);
            if (node.attrs.sticky_width && node.attrs.sticky_position) {
                res.css("background-color", "rgb(238,238,238)");
                res.css("position", "sticky");
                res.css("z-index", "999");
                res.css("min-width", node.attrs.sticky_width);
                res.css("max-width", node.attrs.sticky_width);
                res.css("left", node.attrs.sticky_position);
            }
            return res;
        },

        _renderBodyCell: function (record, node, colIndex, options) {
            var res = this._super.apply(this, arguments);
            if (node.attrs.sticky_width && node.attrs.sticky_position) {
                res.css("background-color", "white");
                res.css("position", "sticky");
                res.css("z-index", "999");
                res.css("min-width", node.attrs.sticky_width);
                res.css("max-width", node.attrs.sticky_width);
                res.css("left", node.attrs.sticky_position);
            }
            return res;
        }

    });
});
