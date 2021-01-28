odoo.define('web.web_widget_json_columns', function(require) {
    "use strict";

    let field_registry = require('web.field_registry');
    let basic_fields = require('web.basic_fields');

    let JsonColumnsWidget = basic_fields.DebouncedField.extend({
        supportedFieldTypes: ['char'],

        init: function () {
            this._super.apply(this, arguments);
            // INFO: this._value is used to store json parsed everytime something in the grid has been changed.
            this._value = false;
            // INFO: this._focused_cell contains the last cell got focused.
            this._focused_cell = false;
        },

        getFocusableElement: function () {
            // INFO: if a _focused_cell was set then focus that otherwise focus just the first editable cell.
            return this._focused_cell ? this._focused_cell : (this.$el && this.$el.find('td[contenteditable=true]').first());
        },

        activate: function () {
            // INFO: when widget got active then focus cell.
            if (this.isFocusable()) {
                this.getFocusableElement().focus().click();
                return true;
            }
            return false;
        },

        _renderReadonly: function () {
            // INFO: renders the grid in a readonly state.
            this._loadJson(false);
        },

        _renderEdit: function() {
            let self = this;

            // INFO: renders the grid in an editable state.
            this._loadJson(true);

            this.$el.find('td').on('input', function() {
                // INFO: when user updates the grid then reparse html to a json and make the field dirty.
                self._value = JSON.stringify(_Table2Json(self.$el));
                self._isDirty = true;
            }).on('click', function(){
                // INFO: 'this' is the cell just got focused.
                self._focused_cell = $(this);
            });
        },

        _getValue: function () {
            return this._value;
        },

        _onKeydown: function (ev) {
            // INFO: ENTER key is used to switch to the next cell. CTRL + arrows are used to navigate thru cells.
            switch (ev.which) {
                case $.ui.keyCode.ENTER:
                    if (ev.ctrlKey && this._focused_cell) {
                        let new_cell = this._focused_cell.next();
                        this._focused_cell = new_cell.length && new_cell || this._focused_cell;
                        this._focused_cell.focus().click();
                    }
                    ev.preventDefault();
                    break;
                case $.ui.keyCode.LEFT:
                    if (ev.ctrlKey && this._focused_cell) {
                        let new_cell = this._focused_cell.prev();
                        this._focused_cell = new_cell.length && new_cell || this._focused_cell;
                        this._focused_cell.focus().click();
                    }
                    ev.preventDefault();
                    break;
                case $.ui.keyCode.RIGHT:
                    if (ev.ctrlKey && this._focused_cell) {
                        let new_cell = this._focused_cell.next();
                        this._focused_cell = new_cell.length && new_cell || this._focused_cell;
                        this._focused_cell.focus().click();
                    }
                    ev.preventDefault();
                    break;
                case $.ui.keyCode.UP:
                    if (ev.ctrlKey && this._focused_cell) {
                        let new_cell = this._focused_cell.closest('tr').prev().find('td:eq(' + this._focused_cell.index() + ')');
                        this._focused_cell = new_cell.length && new_cell || this._focused_cell;
                        this._focused_cell.focus().click();
                    }
                    ev.preventDefault();
                    break;
                case $.ui.keyCode.DOWN:
                    if (ev.ctrlKey && this._focused_cell) {
                        let new_cell = this._focused_cell.closest('tr').next().find('td:eq(' + this._focused_cell.index() + ')');
                        this._focused_cell = new_cell.length && new_cell || this._focused_cell;
                        this._focused_cell.focus().click();
                    }
                    ev.preventDefault();
                    break;
            }
            this._super.apply(this, arguments);
        },

        _loadJson: function (editable) {
            let json_value;

            // INFO: at the moment only horizontal grid is computed.
            if (this.attrs.options && this.attrs.options.direction && this.attrs.options.direction === 'horizontal') {
                try {
                    // INFO: an empty json is defaulted if no json is passed to the widget.
                    json_value = JSON.parse(this.value !== '' ? this.value : '[{"":""}]');
                } catch (e) {
                    alert(e);
                    return;
                }
            }
            else {
                // INFO: If not an horizontal grid then show an error.
                alert('At the moment, FieldJsonGrid computes only horizontal grid!');
                return;
            }

            // INFO: builds widget HTML (optional height, if present, is passed too).
            this.$el.html(_Json2Table(json_value, editable, this.attrs.options && this.attrs.options.height));
        },

    });

    function _Json2Table(obj_for_table, editable, height) {

        let div = $(`<div class="table-bordered" style="height:${height ? height : 'auto'};overflow:auto;">`)
        let table = $('<table class="table table-striped table-hover table-sm">').appendTo(div);
        let ncol = 0;
        let thead = $(`<thead class="thead-${ editable ? 'dark' : 'light' }">`).appendTo(table);
        let thead_tr = $('<tr>').appendTo(thead);
        let tbody = $('<tbody>').appendTo(table);
        let tbody_tr;

        $.each(obj_for_table, function(json_key, json_value) {
            thead_tr.append(`<th contenteditable=false>${json_key}</th>`)

            if (ncol > 0)
                tbody_tr = tbody.find('tr').first();

            $.each(json_value, function(k, v) {

                if (!ncol)
                    tbody_tr = $('<tr>').appendTo(tbody);

                tbody_tr.append(`<td contenteditable=${editable}>${v}</td>`);

                if (ncol > 0)
                    tbody_tr = tbody_tr.next();
            });

            ncol++;
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
