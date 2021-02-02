{
    "name": "One2many: sticky columns",
    "summary": """
        Allow to fix some o2m columns and scroll the others.
        """,
    "description": "Set 'sticky_width' and 'sticky_position' attributes of tree fields. "
                   "Typically: 'sticky_width=\"100px\" sticky_position=\"0px\"' for "
                   "the first field, 'sticky_width=\"100px\" sticky_position=\"100px\"' for the second, and so on",
    "version": "12.0.1.0.0",
    "author": "TAKOBI",
    "category": "web",
    "website": "https://takobi.online",
    "installable": True,
    "depends": [
        "web",
    ],
    "data": [
        "views/assets.xml",
    ],
}
