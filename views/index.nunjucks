<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>Your SassDoc Theme</title>
        <link rel="stylesheet" href="assets/css/main.css" />

        {##
         # Feel free to add more meta or stylesheets. It's up to you.
         #}
    </head>

    <body>

    {##
     # You can access any variable you set in your configuration file from the `view` object.
     # Basically your configuration file is passed to the view as the `view` object.
     #}
    {{ view.test_variable }}

    {##
     # Data comes with a `byGroupAndType` key which contains the data tree
     # with groups as first level (default group is named `undefined`),
     # types as second level (`function`, `variable` or `mixin`), items as third level.
     # So: `groups > types > items`.
     #
        data.byGroupAndType = {
            'undefined': {
                'function': [ ... ],
                'mixin': [ ... ],
                'variable': [ ... ],
            }
        }
     #
     # For extra informations about the `data` interface, be sure to have a look at the wiki:
     # https://github.com/SassDoc/sassdoc/wiki/SassDoc-Data-Interface
     #}

    {##
     # Groups usually have quite unfriendly names, hence `undefined`. Fortunately, they can be aliased
     # from the configuration file of the theme. Then, SassDoc processes it to generate a `groups` object.
     # In this object, each group name is mapped to either an alias if specified in the configuration file
     # or the same group name. For instance:
     #
        groups = {
            'undefined': 'My Awesome Default Group',
        }
     #
     # To retrieve the alias of a group, use `groups[group_name]`. In this case, `groups['undefined']` will
     # return `My Awesome Default Group`.
     #}

    {##
     # To display our items, we need to:
     # 1. Loop over `data.byGroupAndType` groups
     # 2. Loop over types mapped to each group
     # 3. Loop over items mapped to each type
     #}

    {# 1. Loop over the groups in `data.byGroupAndType` #}
    {% for group_name, group in data.byGroupAndType %}
    <section>
        {# Retrieve group alias if any (else group name) #}
        <h1>{{ groups[group_name] }}</h1>

        {# 2. Loop over the types in the current group #}
        {% for type, items in group %}

        {# If items to be displayed in type #}
        {% if items.length > 0 %}
        <section>
            <h2>{{ type }}</h2>

            {# 3. Loop over the items in the current type #}
            {% for item in items %}

            {# At this point it is up to you to display whatever you want from your items. #}
            <h3>{{ item.context.name }}</h3>

            {% endfor %}
        </section>
        {% endif %}

        {% endfor %}

    </section>
    {% endfor %}

    {##
     # If your theme needs some JavaScript, feel free to create a JS file in `assets/js/` folder
     # and include it as follow:
     #
        <script src="assets/js/main.js"></script>
     #
     #}

    </body>
</html>
