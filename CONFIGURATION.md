# Herman Configuration Options

Nest all Herman-specific options
under `herman` object in [SassDoc config][sdconfig].

[sdconfig]: http://sassdoc.com/configuration/

```yaml
# .sassdocrc
theme: herman
herman:
  extraDocs:
    - './my-file.md'
```

```js
// Node API
const sassdoc = require('sassdoc');

sassdoc('./scss', {
  theme: 'herman',
  herman: {
    extraDocs: ['./my-file.md'],
  },
});
```

All relative paths are relative to the SassDoc config file or the `cwd`.

## SassDoc: groups

- Type: `Object`
- Default: `{ undefined: 'General' }`

Groups are a SassDoc configuration option,
not nested inside the Herman block --
though we provide some extra functionality
on top of the [SassDoc configuration][groups].
In addition to naming groups,
we allow you to order them and create
one level of sub-grouping:

```yaml
# .sassdocrc
groups:
  # all items will be listed in the order given...
  api-config: Configuration
  api-json: Exporting Styles to JSON

  # nested objects will create named subgroups...
  Public API:
    api-colors: Color Palettes
    api-fonts: Font Specimens
    api-scale: Ratios & Sizes
  Design Tokens:
    config-colors: _Colors
    config-fonts: _Fonts
```

[groups]: http://sassdoc.com/configuration/#groups

## extraDocs

- Type: `Array`
- Default: `[]`

Add files (parsed as Markdown) to your compiled documentation.
Each value in the list should be an `Object`
with keys `path` (relative path to the local file)
and optionally `name` (displayed in the compiled documentation navigation --
defaults to the filename),
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

[color-preview]: https://www.oddbird.net/herman/docs/demo_colors.html

## customCSS

- Type: `String`
- Default: `''`

Relative path to a custom CSS file,
which will be included in the `<head>` of rendered
[`@font`][font-docs], [`@ratios`][ratio-preview],
[`@sizes`][size-preview], or [`@example`][example-docs] annotations.
The Herman font, size, and ratio previews
are built on semantic HTML (tables & paragraphs),
so it's possible for project CSS
to impact the design of those previews.

**Notes:**

- If your custom CSS includes webfonts
  which require additional `<script>` or `<style>` tags
  (e.g. an external Google Fonts stylesheet or Adobe Typekit JavaScript),
  you must document those fonts with the `@font` annotation
  (providing the required extra HTML)
  for them to display properly
  within rendered annotations.
  See our [`@font` documentation][font-docs-webfonts].
- If your custom CSS contains internal links
  referenced with `url(...)`
  (e.g. local fonts or background images),
  Herman will attempt to copy in those assets
  so that they are available
  in your rendered annotations.
  This means that the paths must either be absolute,
  or relative to the location of the CSS file itself.
  If using Webpack to bundle your Herman `customCSS`,
  this likely means [disabling the `publicPath` setting][public-path]
  for this CSS file (e.g. `publicPath: ''`),
  or [disabling Webpack's `url()` pre-processing][css-loader] entirely.

[font-docs-webfonts]: https://www.oddbird.net/herman/docs/demo_fonts.html#displaying-cdn-hosted-webfonts
[public-path]: https://github.com/webpack-contrib/mini-css-extract-plugin#publicpath
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

[example-docs]: https://www.oddbird.net/herman/docs/demo_examples.html

## fontPath

- Type: `String`
- Default: `''`

_Required if using [`@font` annotation][font-docs-local] with local font
files._

Relative path to a directory containing local font files.
See our [`@font` documentation][font-docs-local].

[font-docs-local]: https://www.oddbird.net/herman/docs/demo_fonts.html#displaying-local-fonts

## nunjucks

- Type: `Object`
- Default: `{}`

Container for the following [Nunjucks][]-related options:

[Nunjucks]: https://mozilla.github.io/nunjucks/

### nunjucks.templatePath

- Type: `String`
- Default: `''`

_Either `nunjucks.templatePath` or
[`nunjucks.environment`](#nunjucks-environment) is required if using
[`@example njk` annotation][example-njk]._

Relative path to a directory containing Nunjucks templates.

### nunjucks.environment

- Type: [Nunjucks `Environment` instance][njk-instance]
- Default: `undefined`

[njk-instance]: https://mozilla.github.io/nunjucks/api.html#environment

_Either [`nunjucks.templatePath`](#nunjucks-templatePath) or
`nunjucks.environment` is required if using
[`@example njk` annotation][example-njk]._

[example-njk]: https://www.oddbird.net/herman/docs/demo_examples.html#compiling-nunjucks

## sass

- Type: `Object`
- Default: `{}`

Container for the following sass-related options:

### sass.jsonFile

- Type: `String`
- Default: `''`

_Required if using [`@font`][font-docs], [`@colors`][color-preview],
[`@ratios`][ratio-preview], or [`@sizes`][size-preview] annotations._

Relative path to a `sass-json file`
(created with the [`export` mixin][export-mixin]).
The JSON contents will be added under the
`sassjson` key of the sassdoc context,
and used to display colors, fonts, ratios, and sizes.
See [Exporting Styles to JSON][export].

[font-docs]: https://www.oddbird.net/herman/docs/demo_fonts.html
[ratio-preview]: https://www.oddbird.net/herman/docs/demo_sizes.html#preview-ratios
[size-preview]: https://www.oddbird.net/herman/docs/demo_sizes.html#preview-sizes
[export]: https://www.oddbird.net/herman/docs/api_json-export.html
[export-mixin]: https://www.oddbird.net/herman/docs/api_json-export.html#mixin--export

### sass.implementation

- Type: Sass implementation instance
- Default: Dart Sass instance

Determines the Sass implementation (defaults to [Dart Sass][dart-sass]) to use
for Sass compilation if using [`@example scss` annotation][example-docs-scss]. This
option expects an implementation providing a `renderSync` method with the [same
signature][] as Dart Sass, and support for the [Sass module system][].

[dart-sass]: https://sass-lang.com/dart-sass
[same signature]: https://sass-lang.com/documentation/js-api#rendersync
[Sass module system]: https://sass-lang.com/blog/the-module-system-is-launched

### sass.importer

- Type: `Array` || `Function`
- Default: [Custom Herman Sass importer][sass-importer]

Function (or array of functions)
used to resolve `@use` and `@import` file paths.
Passed through to Sass [importer] when
compiling `@example sass/scss` annotations.
See our [`@example` documentation][example-docs-scss].

[sass-importer]: https://github.com/oddbird/sassdoc-theme-herman/blob/master/lib/utils/sassImporter.js
[importer]: https://sass-lang.com/documentation/js-api#importer

### sass.includePaths

- Type: `Array`
- Default: `[]`

Array of load paths used to resolve `@use` and `@import` declarations.
Passed through to Sass [includePaths] when
compiling `@example sass/scss` annotations.
See our [`@example` documentation][example-docs-scss].

[includepaths]: https://sass-lang.com/documentation/js-api#includepaths

### sass.includes

- Type: `Array`
- Default: `[]`

List of files (relative to any [`sass.includePaths`](#sass-includepaths)) to
`@import` for all `@example sass/scss` annotations.
See our [`@example` documentation][example-docs-scss].

This is useful for including any global
Sass configuration and toolkit files
that may be used by any example.
It's best to avoid files with output CSS,
as that output will be displayed in every single Sass example.

[example-docs-scss]: https://www.oddbird.net/herman/docs/demo_examples.html#compiling-sass-scss

### sass.use

- Type: `Array`
- Default: `[]`

List of files (relative to any [`sass.includePaths`](#sass-includepaths)) to
`@use` for all `@example sass/scss` annotations.
See our [`@example` documentation][example-docs-scss].

Each item in the array can be a string (path to the file)
or an object with `file` and `namespace` keys
(to `@use "<file>" as <namespace>`):

```yaml
# .sassdocrc
herman:
  sass:
    includePaths:
      - 'static/sass'
    use:
      - 'config/tools'
      - file: 'config/other-tools'
        namespace: 'my-tools'
```

This is useful for including any global
Sass configuration and toolkit files
that may be used by any example,
using the [Dart Sass module system][dart-sass-modules].
It's best to avoid files with output CSS,
as that output will be displayed in every single Sass example.

[dart-sass-modules]: https://sass-lang.com/blog/the-module-system-is-launched

### sass.outputStyle

- Type: `String`
- Default: `'expanded'`

Determines the output format of the final CSS
of compiled `@example sass/scss` annotations.
Passed through to Sass [outputStyle] option.
Accepts `'expanded'` or `'compressed'`.
See our [`@example` documentation][example-docs-scss].

[outputstyle]: https://sass-lang.com/documentation/js-api#outputstyle
