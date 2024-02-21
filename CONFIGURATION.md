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

[color-preview]: https://www.oddbird.net/herman/docs/demo_colors

## customCSS

- Type: `String`
- Default: `''`

Relative path to a custom CSS file,
which will be included in the `<head>` of rendered
[`@example`][example-docs] annotations.

If the [`customPreviewCSS` option](#custompreviewcss) is not set, any CSS custom
properties or font-related declarations (e.g. `font-family` or `font-size`)
declared in `html`, `body`, or `:root` -- and all `@font-face` at-rules -- in
this `customCSS` stylesheet will be included in rendered [`@font`][font-docs],
[`@ratios`][ratio-preview], [`@sizes`][size-preview], and
[`@colors`][color-preview] annotations.

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

[font-docs-webfonts]: https://www.oddbird.net/herman/docs/demo_fonts#displaying-cdn-hosted-webfonts
[public-path]: https://github.com/webpack-contrib/mini-css-extract-plugin#publicpath
[css-loader]: https://github.com/webpack-contrib/css-loader#url

## customPreviewCSS

- Type: `String`
- Default: `''`

Relative path to a custom CSS file containing CSS custom properties or
font-related CSS to be included in rendered [`@font`][font-docs],
[`@ratios`][ratio-preview], [`@sizes`][size-preview], and
[`@colors`][color-preview] annotations. Custom properties and font declarations
must be declared on `html`, `body`, or `:root`.

If this option is not set,
the [`customCSS` option](#customcss) will be used instead.

## customSourceMap

- Type: `String` or `false`
- Default: `customCSS + '.map'` if `customCSS` option is defined, otherwise `''`

Relative path to a custom CSS source-map file,
presumably referenced from the file specified in the `customCSS` option.
If `customCSS` is defined, this defaults to the `customCSS` path
with `'.map'` appended.
To opt out of this feature, set `customSourceMap` to `false`.

## customHTML

- Type: `String`
- Default: `''`

Custom HTML string (or relative path to a file containing valid HTML)
to include at the top of the generated `<body>` tag
for all rendered `@example html` and `@example njk` annotations.
See our [`@example` documentation][example-docs].
This is particularly useful for including svg sprite sheets
in example output.

[example-docs]: https://www.oddbird.net/herman/docs/demo_examples

## fontPath

- Type: `String`
- Default: `''`

_Required if using [`@font` annotation][font-docs-local] with local font
files._

Relative path to a directory containing local font files.
See our [`@font` documentation][font-docs-local].

[font-docs-local]: https://www.oddbird.net/herman/docs/demo_fonts#displaying-local-fonts

## nunjucks

- Type: `Object`
- Default: `{}`

Container for the following [Nunjucks][]-related options:

[nunjucks]: https://mozilla.github.io/nunjucks/

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

[njk-instance]: https://mozilla.github.io/nunjucks/api#environment

_Either [`nunjucks.templatePath`](#nunjucks-templatepath) or
`nunjucks.environment` is required if using
[`@example njk` annotation][example-njk]._

[example-njk]: https://www.oddbird.net/herman/docs/demo_examples#compiling-nunjucks

## sass

- Type: `Object`
- Default: `{}`

Container for the following sass-related options:

### sass.implementation

- Type: `String` or Sass implementation instance
- Default: `'sass'`

Determines the Sass implementation (defaults to [`sass`][dart-sass]) to use for
Sass compilation if using [`@example scss` annotation][example-docs-scss]. This
option expects a string that matches the name of an available Dart Sass
implementation (e.g. `sass` or `sass-embedded`), or a Dart Sass instance itself.

[dart-sass]: https://www.npmjs.com/package/sass
[example-docs-scss]: https://www.oddbird.net/herman/docs/demo_examples#compiling-sass-scss
[sass-embedded]: https://www.npmjs.com/package/sass-embedded

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

[font-docs]: https://www.oddbird.net/herman/docs/demo_fonts
[ratio-preview]: https://www.oddbird.net/herman/docs/demo_sizes#preview-ratios
[size-preview]: https://www.oddbird.net/herman/docs/demo_sizes#preview-sizes
[export]: https://www.oddbird.net/herman/docs/api_json-export
[export-mixin]: https://www.oddbird.net/herman/docs/api_json-export#mixin--export

### sass.use

- Type: `Array`
- Default: `[]`

List of files (relative to any
[`sass.sassOptions.loadPaths`](#sass-sassoptions)) to `@use`
for all `@example sass/scss` annotations.
See our [`@example` documentation][example-docs-scss].

Each item in the array can be a string (path to the file)
or an object with `file` and `namespace` keys
(to `@use "<file>" as <namespace>`):

```yaml
# .sassdocrc
herman:
  sass:
    use:
      - 'config/tools'
      - file: 'config/other-tools'
        namespace: 'my-tools'
    sassOptions:
      loadPaths:
        - 'static/sass'
```

This is useful for including any global
Sass configuration and toolkit files
that may be used by any example,
using the [Dart Sass module system][dart-sass-modules].
It's best to avoid files with output CSS,
as that output will be displayed in every single Sass example.

[dart-sass-modules]: https://sass-lang.com/blog/the-module-system-is-launched

### sass.sassOptions

- Type: `Object`
- Default: `{}`

Options (e.g. `importers`, `loadPaths`, or `style`) that are passed
directly through to Dart Sass
when compiling `@example sass/scss` annotations.
See the [Dart Sass documentation][dart-sass-docs] for more info.

By default, `importers` is set to an array
containing the [Node.js package importer][sass-importer],
which supports `pkg:` imports to resolve `@use` and `@import`
for external modules installed via npm or Yarn.
If `sass.sassOptions.importers` is set
(even as an empty array `importers: []`),
it will override the default importer.

[dart-sass-docs]: https://sass-lang.com/documentation/js-api/modules#compileStringAsync
[sass-importer]: https://sass-lang.com/documentation/js-api/classes/nodepackageimporter/
