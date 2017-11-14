# Herman Configuration Options

Nest all Herman-specific options
under `herman` object in SassDoc config.

```yaml
theme: herman
herman:
  displayColors: <...>
```

All relative paths are relative to the SassDoc config file or the `cwd`.


## displayColors

- Type: `Array`
- Default: `['hex', 'rgb', 'hsl']`

Configures which color value formats are shown
when using the [`@preview color-palette` annotation][color-preview].

[color-preview]: http://oddbird.net/herman/docs/demo_colors.html


## extraDocs

- Type: `Array`
- Default: `[]`

Add files (parsed as Markdown) to your compiled documentation.
Each value in the list should be an `Object`
with keys `path` (relative path to the local file)
and `name` (displayed in the compiled documentation navigation),
or a `String` path
(in which case the filename will be displayed in the navigation).


### extraLinks

- Type: `Array`
- Default: `[]`

Add external links to your compiled documentation navigation.
Each value in the list should be an `Object` with keys `name` and `url`.


## customCSS

- Type: `String`
- Default: `''`

Relative path to a custom CSS file,
which will be included in the `<head>` of rendered
[`@example` annotations][example-annotation].

[example-annotation]: http://oddbird.net/herman/docs/demo_examples.html


## customHTML

- Type: `String`
- Default: `''`

Custom HTML (or relative path to a file)
to include at the top of the generated `<body>` tag
for all rendered `@example html` and `@example njk` annotations.
See our [`@example` documentation][example-docs].

[example-docs]: http://oddbird.net/herman/docs/demo_examples.html


## fontpath

- Type: `String`
- Default: `''`

*Required if using `@font` annotation with local font files.*

Relative path to a directory containing local font files.


## templatepath

- Type: `String`
- Default: `''`

*Either `templatepath` or [`nunjucksEnv`](#nunjucksenv)
is required if using [`@example njk` annotation][example-njk].*

Relative path to a directory containing Nunjucks templates.


## nunjucksEnv

- Type: [Nunjucks `Environment` instance][njk-instance]
- Default: `undefined`

[njk-instance]: https://mozilla.github.io/nunjucks/api.html#environment

*Either `templatepath` or [`nunjucksEnv`](#nunjucksenv)
is required if using [`@example njk` annotation][example-njk].*

[example-njk]: http://oddbird.net/herman/docs/demo_examples.html#compiling-nunjucks


## sass

- Type: `Object`
- Default: `{}`

Container for the following sass-related options:

### sass.jsonfile

- Type: `String`
- Default: `''`

*Required if using `@font` or `@preview` annotations.*

Relative path to a `sass-json file`
(created with the [`herman-export` mixin][export-mixin]).
The JSON contents will be added under the
`sassjson` key of the sassdoc context,
and used to display colors, fonts, ratios, and sizes.

[export-mixin]: http://oddbird.net/herman/docs/api_json-export.html#mixin--herman-export

### sass.includepaths

- Type: `Array`
- Default: `[]`

Array of paths used to attempt to resolve `@import` declarations.
Passed through to [node-sass] when
compiling `@example sass/scss` annotations.
See our [`@example` documentation][example-docs-scss].

[node-sass]: https://github.com/sass/node-sass/#includepaths

### sass.includes

- Type: `Array`
- Default: `[]`

List of files (relative to any `includepaths`) to `@import`
for all `@example sass/scss` annotations.
See our [`@example` documentation][example-docs-scss].

[example-docs-scss]: http://oddbird.net/herman/docs/demo_examples.html#compiling-sass-scss
