# Herman Configuration Options

Nest all Herman-specific options
under `herman` object in [SassDoc config][sdconfig].

[sdconfig]: http://sassdoc.com/configuration/

```yaml
# .sassdocrc
theme: herman
herman:
  extraDocs: [...]
```

```js
// Node API
const sassdoc = require('sassdoc');

sassdoc('./scss', {
  theme: 'herman',
  herman: {
    extraDocs: [...]
  }
});
```

All relative paths are relative to the SassDoc config file or the `cwd`.


## extraDocs

- Type: `Array`
- Default: `[]`

Add files (parsed as Markdown) to your compiled documentation.
Each value in the list should be an `Object`
with keys `path` (relative path to the local file)
and `name` (displayed in the compiled documentation navigation),
or a `String` path
(in which case the filename will be displayed in the navigation).

This is useful for including additional documents,
such as a changelog, quickstart guide,
or instructions for contributing.


## extraLinks

- Type: `Array`
- Default: `[]`

Add external links to your compiled documentation navigation.
Each value in the list should be an `Object` with keys `name` and `url`.

This is useful for linking to additional documentation
for dependencies or other third-party integrations.


## displayColors

- Type: `Array`
- Default: `['hex', 'rgb', 'hsl']`

Configures which color value formats are shown
when using the [`@colors` annotation][color-preview].
Valid options: `hex`, `rgb/rgba`, `hsl/hsla`

[color-preview]: http://oddbird.net/herman/docs/demo_colors.html


## customCSS

- Type: `String`
- Default: `''`

Relative path to a custom CSS file,
which will be included in the `<head>` of rendered
[`@example` annotations][example-docs].

**Notes:**

- If your custom CSS includes webfonts
  which require additional `<script>` or `<style>` tags
  (e.g. an external Google Fonts stylesheet or Adobe Typekit JavaScript),
  you must document those fonts with the `@font` annotation
  (providing the required extra HTML)
  for them to display properly
  within rendered `@example` annotations.
  See our [`@font` documentation][font-docs-webfonts].
- If your custom CSS contains internal links
  referenced with `url(...)`
  (e.g. local fonts or background images),
  Herman will attempt to copy in those assets
  so that they are available
  in your rendered `@example` annotations.
  This means that the paths must either be absolute,
  or relative to the location of the CSS file itself.
  If using Webpack to bundle your Herman `customCSS`,
  this likely means [disabling the `publicPath` setting][extract-text]
  for this CSS file (e.g. `publicPath: ''`),
  or [disabling Webpack's `url()` pre-processing][css-loader] entirely.

[font-docs-webfonts]: http://oddbird.net/herman/docs/demo_fonts.html#displaying-webfonts
[extract-text]: https://github.com/webpack-contrib/extract-text-webpack-plugin#extract
[css-loader]: https://github.com/webpack-contrib/css-loader#url


## customHTML

- Type: `String`
- Default: `''`

Custom HTML string (or relative path to a file containing valid HTML)
to include at the top of the generated `<body>` tag
for all rendered `@example html` and `@example njk` annotations.
See our [`@example` documentation][example-docs].
This is particularly useful for including svg sprite sheets
in example output.

[example-docs]: http://oddbird.net/herman/docs/demo_examples.html


## fontpath

- Type: `String`
- Default: `''`

*Required if using [`@font` annotation][font-docs-local] with local font
files.*

Relative path to a directory containing local font files.
See our [`@font` documentation][font-docs-local].

[font-docs-local]: http://oddbird.net/herman/docs/demo_fonts.html#displaying-local-fonts


## nunjucks

- Type: `Object`
- Default: `{}`

Container for the following [Nunjucks][nunjucks]-related options:

[nunjucks]: https://mozilla.github.io/nunjucks/


### nunjucks.templatepath

- Type: `String`
- Default: `''`

*Either `nunjucks.templatepath` or
[`nunjucks.environment`](#nunjucks-environment) is required if using
[`@example njk` annotation][example-njk].*

Relative path to a directory containing Nunjucks templates.


### nunjucks.environment

- Type: [Nunjucks `Environment` instance][njk-instance]
- Default: `undefined`

[njk-instance]: https://mozilla.github.io/nunjucks/api.html#environment

*Either [`nunjucks.templatepath`](#nunjucks-templatepath) or
`nunjucks.environment` is required if using
[`@example njk` annotation][example-njk].*

[example-njk]: http://oddbird.net/herman/docs/demo_examples.html#compiling-nunjucks


## sass

- Type: `Object`
- Default: `{}`

Container for the following sass-related options:


### sass.jsonfile

- Type: `String`
- Default: `''`

*Required if using [`@font`][font-docs], [`@colors`][color-preview],
[`@ratios`][ratio-preview], or [`@sizes`][size-preview] annotations.*

Relative path to a `sass-json file`
(created with the [`herman-export` mixin][export-mixin]).
The JSON contents will be added under the
`sassjson` key of the sassdoc context,
and used to display colors, fonts, ratios, and sizes.
See [Exporting Styles to JSON][export].

[font-docs]: http://oddbird.net/herman/docs/demo_fonts.html
[ratio-preview]: http://oddbird.net/herman/docs/demo_sizes.html#preview-ratios
[size-preview]: http://oddbird.net/herman/docs/demo_sizes.html#preview-sizes
[export]: http://oddbird.net/herman/docs/api_json-export.html
[export-mixin]: http://oddbird.net/herman/docs/api_json-export.html#mixin--herman-export


### sass.includepaths

- Type: `Array`
- Default: `[]`

Array of paths used to resolve `@import` declarations.
Passed through to [node-sass] when
compiling `@example sass/scss` annotations.
See our [`@example` documentation][example-docs-scss].

[node-sass]: https://github.com/sass/node-sass/#includepaths


### sass.includes

- Type: `Array`
- Default: `[]`

List of files (relative to any [`sass.includepaths`](#sass-includepaths)) to
`@import` for all `@example sass/scss` annotations.
See our [`@example` documentation][example-docs-scss].

This is useful for including any global
Sass configuration and toolkit files
that may be used by any example.
It's best to avoid files with output CSS,
as that output will be displayed in every single Sass example.

[example-docs-scss]: http://oddbird.net/herman/docs/demo_examples.html#compiling-sass-scss
