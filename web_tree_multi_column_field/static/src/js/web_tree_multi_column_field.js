odoo.define('web_tree_multi_column_field.multi_column_field', function (require) {
    'use strict';

    var ListRenderer = require('web.ListRenderer');
    var BasicModel = require('web.BasicModel');

    ListRenderer.include({

        _get_max_row_size: function (fields_list) {
            var size = 1;
            for (var i = 0; i < fields_list.length; i++) {
                if (fields_list[i].length > size) {
                    size = fields_list[i].length;
                }
            }
            return size;
        },

        _parse_json_rows: function (field_name) {
            var fields_list = [];
            var dataLength = this.state.data.length;
            for (var i = 0; i < dataLength; i++) {
                var json_content = this.state.data[i]["data"][field_name];
                // json_content in the form "['val1', 'val2']"
                fields_list.push(JSON.parse(json_content));
            }
            var max_row_size = this._get_max_row_size(fields_list);
            for (var k = 1; k <= max_row_size; k++) {
                this.columns.push({
                    tag: "string",
                    children: [],
                    attrs: {
                        modifiers: {readonly: true},
                        name: "widget_multi_column_"+k,
                        string: "col"+k
                    }
                });
                this.state.fields["widget_multi_column_"+k] = {
                    change_default: false,
                    company_dependent: false,
                    depends: [],
                    manual: false,
                    readonly: true,
                    required: false,
                    searchable: false,
                    sortable: false,
                    store: false,
                    string: "col"+k,
                    translate: false,
                    trim: false,
                    type: "char"
                };
                this.state.fieldsInfo.list["widget_multi_column_"+k] = {
                    "Widget": this.state.fieldsInfo.list[field_name].Widget,
                    "fieldDependencies": {},
                    "modifiers": {},
                    "options": {},
                    "name": "widget_multi_column_"+k
                }
            }
            for (var i = 0; i < dataLength; i++) {
                var current_row = fields_list[i];
                if (current_row.length < max_row_size) {
                    current_row.fill("", current_row.length - 1);
                }
                for (var j = 0; j < current_row.length; j++) {
                    this.state.data[i]["data"]["widget_multi_column_"+(j+1)] = current_row[j];
                }
            }
        },

        init: function (parent, state, params) {
            var res = this._super(parent, state, params);
            for (var i = 0; i < this.columns.length; i++) {
                var column = this.columns[i];
                if ('attrs' in column) {
                    if ('widget' in column['attrs']) {
                        if (column['attrs']['widget'] == 'multi_column_field') {
                            this._parse_json_rows(column['attrs']['name']);
                        }
                    }
                }
            }
            return res;
        },
    });

    BasicModel.include({
        _parseServerData: function (fieldNames, element, data) {
            for (var i = 0; i < fieldNames.length; i++) {
                var fieldName = fieldNames[i];
                if (fieldName.startsWith("widget_multi_column_")) {
                    // New fields do not come from server: load empty fields
                    element.data[fieldName] = false;
                    element.fields[fieldName] = {
                        change_default: false,
                        company_dependent: false,
                        depends: [],
                        manual: false,
                        readonly: true,
                        required: false,
                        searchable: false,
                        sortable: false,
                        store: false,
                        string: fieldName,
                        translate: false,
                        trim: false,
                        type: "char"
                    };
                    data[fieldName] = false;
                }
            }
            return this._super(fieldNames, element, data);
        }
    });

});
