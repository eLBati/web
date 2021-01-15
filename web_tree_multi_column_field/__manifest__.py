# Copyright 2021 Lorenzo Battistini @ TAKOBI
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Multi column field in tree view",
    "summary": "Based on a textual field (JSON), display field content exploding it in "
               "multiple columns",
    "description": "Add a char field to your list view, setting "
                   "widget=\"multi_column_field\" and filling the field with JSON list"
                   ", like ['val1', 'val2']",
    "version": "12.0.1.0.0",
    "development_status": "Beta",
    "category": "Hidden",
    "website": "https://github.com/OCA/web",
    "author": "TAKOBI, Odoo Community Association (OCA)",
    "maintainers": ["eLBati", "robyf70"],
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "web",
    ],
    "data": [
        "views/assets.xml",
    ],
    "demo": [
    ],
    "qweb": [
    ]
}
