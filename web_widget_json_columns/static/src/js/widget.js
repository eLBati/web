odoo.define('web.web_widget_json_columns', function(require) {
    "use strict";

    let field_registry = require('web.field_registry');
    let basic_fields = require('web.basic_fields');

    let JsonColumnsWidget = basic_fields.DebouncedField.extend({
        supportedFieldTypes: ['char'],

        _renderReadonly: function () {
            // INFO: renders the grid in a readonly state.
            this._loadJson();
        },

        _loadJson: function () {
            let json_value;

            try {
                // INFO: an empty json is defaulted if no json is passed to the widget.
                json_value = JSON.parse(this.value !== '' ? this.value : '[{"":""}]');
            } catch (e) {
                alert(e);
                return;
            }

            this.$el.html(_Json2Table(
                json_value, this.attrs.options && this.attrs.options.col_width
            ));
        },

    });

    function _Json2Table(obj_for_table, col_width) {

        let div = $(`<div class="table-bordered">`);
        let table = $('<table class="">').appendTo(div);
        let tbody = $('<tbody>').appendTo(table);
        let tbody_tr = $('<tr>').appendTo(tbody);

        $.each(obj_for_table, function(json_key, json_value) {
            tbody_tr.append(`<td style="min-width:${col_width ? col_width : 'auto'};">${json_value}</td>`)
        });

        return div;
    }

    function _Table2Json(el) {

        let heads = [];
        let cols = [];
        let data = {};

        el.find('th').each(function(i, v) {
            heads[i] = $(this).text().trim();
            data[heads[i]] = [];
        });

        let rows = el.find('tbody > tr');

        rows.each(function(i, v) {
            cols = $(v).find('td');
            cols.each(function (i, v) {
                data[heads[i]].push(isNaN(v.textContent) ? v.textContent : Number(v.textContent));
            });
        });

        return data;
    }

    field_registry.add('json_columns', JsonColumnsWidget);

    return JsonColumnsWidget;
});
