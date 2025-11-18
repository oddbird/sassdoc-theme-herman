# Herman Changelog

## 7.0.0: 2025-11-18

- 💥 BREAKING: Drop support for Node < 20
- 🏠 INTERNAL: Upgrade dependencies

## 6.0.2: 2024-11-08

- 🐛 BUGFIX: Address Sass deprecation warnings --
  [#443](https://github.com/oddbird/sassdoc-theme-herman/issues/443) &
  [#449](https://github.com/oddbird/sassdoc-theme-herman/issues/449)
- 🏠 INTERNAL: Upgrade dependencies

## 6.0.1: 2024-04-22

- 🐛 BUGFIX: Do not overwrite `ctx.emit` method --
  [#423](https://github.com/oddbird/sassdoc-theme-herman/issues/423)
- 🏠 INTERNAL: Upgrade dependencies

## 6.0.0: 2024-03-01

### 🚀 New Features

- Add `sass.implementation` option (`string` or Dart Sass instance) to specify
  the Dart Sass implementation to use for `@example scss` annotations. (default:
  `sass`).
- Use faster Dart Sass
  [`AsyncCompiler` API](https://sass-lang.com/documentation/js-api/classes/asynccompiler/)
  for `@example scss` annotations.
- Add `exports.sass` in `package.json` for simpler `pkg:` imports.

### 💥 Breaking Changes

- Require Dart Sass `^1.71.0` for `@example scss` annotations, using the new
  [Node.js package importer](https://sass-lang.com/documentation/js-api/classes/nodepackageimporter/) in `sass.sassOptions.importers` by default.
- Remove custom Sass importer that supported `~` imports for external modules.
  Replace `~` with `pkg:` to use the newer Dart Sass Node.js package importer.
- Remove `sass.importers` option (use `sass.sassOptions.importers` instead).
- Remove deprecated `sass.includes` option (use `sass.use` instead).
- Drop support for Node < 18

### 🏠 Internal

- Use [`sass-embedded`](https://www.npmjs.com/package/sass-embedded)
  instead of [`sass`](https://www.npmjs.com/package/sass) internally
- Replace "Source Sans Pro" font with "Source Sans 3"
- Upgrade to Yarn v4 (without PnP)
- Add Dependabot for dependency updates going forward
- Upgrade dependencies

## 5.0.1: 2022-12-14

- 🏠 INTERNAL: Upgrade dependencies

## 5.0.0: 2022-12-14

_No changes from `v5.0.0-beta.7`. Changes since `v4.0.2`:_

### 🚀 New Features

- Color previews are now rendered in an `<iframe>` which allows them to make use
  of user-supplied CSS custom properties (and a limited subset of Herman
  styles). Custom properties are made available via the new `customPreviewCSS`
  or existing `customCSS` options. To be included, custom properties must be
  declared on `html`, `body`, or `:root`.
- Length keywords in `@sizes {ruler}` maps now display as a border
- Allow `utilities.add()` to merge data, instead of override
- `utilities.each-value()` will pass each _value_ of a map through a given
  function (this is the previous behavior of passing args to `add()`)
- `utilities.each-key()` will pass each _key_ of a map through a given function
- Add `customSourceMap` option (default: `customCSS` option + `.map`) to allow
  copying source-map file along with `customCSS` file
- Font-map variant keys can be comma-separated --
  [#338](https://github.com/oddbird/sassdoc-theme-herman/issues/338)
- Add support for non-standard CSS font-weight names --
  [#250](https://github.com/oddbird/sassdoc-theme-herman/issues/250)

### 💥 Breaking Changes

- Font, ratio, size, and color previews are now rendered without user-provided
  stylesheets (to avoid style conflicts). CSS custom properties and font-related
  CSS are made available via the new (🚀) `customPreviewCSS` or existing
  `customCSS` options. To be included, declarations must be declared on `html`,
  `body`, or `:root` in the stylesheet set via `customPreviewCSS` or `customCSS`
  settings. (All `@font-face` at-rules are included.)
- Require Dart Sass (`^1.45.0`) for `@example scss` annotations, using the
  updated [Dart Sass JavaScript
  API](https://sass-lang.com/documentation/js-api/). The `sass.implementation`
  option is removed, along with support for `node-sass`.
- Rename `sass.importer` option to `sass.importers`, matching the [Dart Sass
  option](https://sass-lang.com/documentation/js-api/interfaces/Options#importers).
- Remove `sass.includePaths` and `sass.outputStyle` options. These are replaced
  with a new `sass.sassOptions` option, which accepts any options that Dart Sass
  accepts (e.g. `loadPaths` or `style`). See the [Dart Sass
  documentation](https://sass-lang.com/documentation/js-api/modules#compileStringAsync)
  for more details.
- `utilities.add()`
  no longer supports map-compilation functions and arguments,
  since there are two reasonable approaches.
  Maps that need to be compiled for Herman
  must now be compiled before they are added.
  That can still be done using either:
  - 🚀 NEW: `utilities.each-value()` will pass each _value_ of a map
    through a given function
    (this is the previous behavior of passing args to `add()`)
  - 🚀 NEW: `utilities.each-key()` will pass each _key_ of a map
    through a given function
- Disable all `autofill` annotations for comments that Herman treats as "prose"
  (i.e. separated from documented code by one or more newlines).
- Drop support for Node < 14

### 🐛 Bug Fixes

- Switch from [tinycolor](https://github.com/bgrins/TinyColor) to
  [colorjs.io](https://github.com/LeaVerou/color.js) for color conversions, to
  fix bug displaying colors that use hue angle notation.

### 📝 Documentation

- Add samples for `@use '~/sassdoc-theme-herman/scss/utilities';`

### 🏠 Internal

- Replace [Bluebird](https://github.com/petkaantonov/bluebird/) dependency with
  native promises.
- Replace CircleCI, Codecov, and AppVeyor with GitHub Actions
- Include source-maps with Herman JS & CSS assets
- Remove documentation static-site from repository and npm package
- Limit size of NPM package
- Upgrade dependencies

## 5.0.0-beta.7: 2022-12-07

- 💥 BREAKING: Rename `customPropertiesCSS` option to `customPreviewCSS`
- 🐛 BUGFIX: Add missing font-related CSS (e.g. `font-family`, `font-size`,
  `@font-face`) to color, font, ratio, and size previews. To be included,
  declarations must be declared on `html`, `body`, or `:root` in the stylesheet
  set via `customPreviewCSS` or `customCSS` settings. (All `@font-face` at-rules
  are included.)
- 🏠 INTERNAL: Upgrade dependencies

## 5.0.0-beta.6: 2022-11-23

- 🐛 BUGFIX: Add missing CSS custom properties for font, ratio, and size
  previews

## 5.0.0-beta.5: 2022-11-22

- 💥 BREAKING: Require Dart Sass (`^1.45.0`) for `@example scss` annotations,
  using the updated [Dart Sass JavaScript
  API](https://sass-lang.com/documentation/js-api/). The `sass.implementation`
  option is removed, along with support for `node-sass`.
- 💥 BREAKING: Rename `sass.importer` option to `sass.importers`, matching the
  [Dart Sass
  option](https://sass-lang.com/documentation/js-api/interfaces/Options#importers).
- 💥 BREAKING: Remove `sass.includePaths` and `sass.outputStyle` options. These
  are replaced with a new `sass.sassOptions` option, which accepts any options
  that Dart Sass accepts (e.g. `loadPaths` or `style`). See the [Dart Sass
  documentation](https://sass-lang.com/documentation/js-api/modules#compileStringAsync)
  for more details.
- 💥 BREAKING: Font, ratio, size, and color previews are now rendered without
  user-provided stylesheets (to avoid style conflicts). CSS custom properties
  are made available via the new (🚀) `customPropertiesCSS` or existing
  `customCSS` options. To be included, custom properties must be declared on
  `html`, `body`, or `:root`.
- 🏠 INTERNAL: Replace [Bluebird](https://github.com/petkaantonov/bluebird/)
  dependency with native promises.
- 🏠 INTERNAL: Upgrade dependencies

## 5.0.0-beta.4: 2022-11-11

- 🐛 BUGFIX: Add missing styles for color previews

## 5.0.0-beta.3: 2022-11-07

- 🚀 NEW: Color previews are now rendered in an `<iframe>` which allows them to
  make use of user-supplied `customCSS` and a limited subset of Herman styles.
- 🐛 BUGFIX: Switch from [tinycolor](https://github.com/bgrins/TinyColor) to
  [colorjs.io](https://github.com/LeaVerou/color.js) for color conversions, to
  fix bug displaying colors that use hue angle notation.
- 🏠 INTERNAL: Remove documentation from npm package
- 🏠 INTERNAL: Upgrade dependencies
- 🏠 INTERNAL: Replace CircleCI, Codecov, and AppVeyor with GitHub Actions

## 5.0.0-beta.2: 2022-08-24

- 🐛 BUGFIX: Add border color/style for length keywords in `@sizes {ruler}` maps
- 🏠 INTERNAL: Upgrade dependencies

## 5.0.0-beta.1: 2022-08-19

- 🚀 NEW: Length keywords in `@sizes {ruler}` maps will display as a border
- 🏠 INTERNAL: Upgrade dependencies

## 5.0.0-beta.0: 2022-08-12

- 💥 BREAKING: Disable all `autofill` annotations for comments
  that Herman treats as "prose" (i.e. separated from documented code
  by one or more newlines).
- 💥 BREAKING: Drop support for Node < 14
- 💥 BREAKING: `utilities.add()`
  no longer supports map-compilation functions and arguments,
  since there are two reasonable approaches.
  Maps that need to be compiled for Herman
  must now be compiled before they are added.
  That can still be done using either:
  - 🚀 NEW: `utilities.each-value()` will pass each _value_ of a map
    through a given function
    (this is the previous behavior of passing args to `add()`)
  - 🚀 NEW: `utilities.each-key()` will pass each _key_ of a map
    through a given function
- 🚀 NEW: Allow `utilities.add()` to merge data, instead of override
- 🚀 NEW: Add `customSourceMap` option (default: `customCSS` option + `.map`)
  to allow copying source-map file along with `customCSS` file
- 🚀 NEW: Font-map variant keys can be comma-separated --
  [#338](https://github.com/oddbird/sassdoc-theme-herman/issues/338)
- 🚀 NEW: Add support for non-standard CSS font-weight names --
  [#250](https://github.com/oddbird/sassdoc-theme-herman/issues/250)
- 🏠 INTERNAL: Include source-maps with Herman JS & CSS assets
- 🏠 INTERNAL: Upgrade dependencies
- 🏠 INTERNAL: Remove documentation static-site from repository
- 🏠 INTERNAL: Limit size of NPM package
- 📝 DOCS: Add samples for `@use '~/sassdoc-theme-herman/scss/utilities';`

## 4.0.2: 2021-05-07

- 🐛 BUGFIX: Fix build error on package install

## 4.0.1: 2021-05-07

- 🐛 BUGFIX: Pin [cheerio](https://github.com/cheeriojs/cheerio) dependency to
  fix breaking change
- 🏠 INTERNAL: Upgrade dependencies

## 4.0.0: 2021-01-04

- No changes from v4.0.0-rc.1

## 4.0.0-rc.1: 2021-01-04

- 💥 BREAKING: Drop support for Node < 10
- 💥 BREAKING: Switch to Dart Sass throughout, and use as default
  `sass.implementation` option
- 💥 BREAKING: Convert Herman-specific options to camelCase (`fontPath`,
  `nunjucks.templatePath`, `sass.jsonFile`, `sass.includePaths`,
  `sass.outputStyle`)
- 💥 BREAKING: Herman no longer automatically optimizes SVG icons using SVGO
- 💥 BREAKING: Remove `herman-` prefix from Sass JSON utilities:
  - `herman-add()` => `add()`
  - `herman-export()` => `export()`
  - `herman-map-compile()` => `compile()`
- 🚀 NEW: Add support for using [namespaced Sass
  modules](https://sass-lang.com/documentation/at-rules/use#choosing-a-namespace)
  in `@example scss` annotations with
  [`sass.use`](https://www.oddbird.net/herman/docs/configuration#sass-use)
  option
- 🚀 NEW: Default Sass importer (used by `@example scss`) now supports `~`
  imports of external modules in [Yarn](https://yarnpkg.com/) PnP environments
- 🚀 NEW: Allow using custom Sass importer with `@example scss` via
  new `sass.importer` option
- 📝 DOCS: Fix broken links in Changelog
- 🏠 INTERNAL: Upgrade dependencies:
  - Switch to [Yarn 2](https://yarnpkg.com/)
  - Remove `gulp-imagemin` and `svgo` --
    [343](https://github.com/oddbird/sassdoc-theme-herman/issues/343)
  - Replace `through2` with Node's native `readable-stream`

## 3.2.0: 2020-06-16

- 🐛 BUGFIX: Use iframes to properly render size-related previews (all `@font`,
  `@ratios`, and `@sizes` previews are now each rendered in an `<iframe>`,
  receiving user-supplied `customCSS` and a limited subset of Herman styles) --
  [#339](https://github.com/oddbird/sassdoc-theme-herman/issues/339)
- 🏠 INTERNAL: Upgrade dependencies

## 3.1.0: 2020-04-24

- 🚀 NEW: Add `sass.implementation` (default: `node-sass`) and `sass.use`
  (default: `[]`) options to support Dart Sass --
  [#342](https://github.com/oddbird/sassdoc-theme-herman/issues/342) and
  [#341](https://github.com/oddbird/sassdoc-theme-herman/issues/341)
- 🏠 INTERNAL: Use Dart Sass to compile Herman styles
- 🏠 INTERNAL: Upgrade dependencies

## 3.0.2: 2019-01-09

- 🐛 BUGFIX: Allow local system fonts without `formats` --
  [#336](https://github.com/oddbird/sassdoc-theme-herman/issues/336)

## 3.0.1: 2019-01-07

- 🐛 BUGFIX: Improve error message when reading external files --
  [#311](https://github.com/oddbird/sassdoc-theme-herman/issues/311)
- 🏠 INTERNAL: Remove `node-sass` from `peerDependencies`
- 🏠 INTERNAL: Upgrade dependencies

## 3.0.0: 2018-04-09

- 💥 BREAKING: Move `node-sass` to `peerDependencies`
- 🐛 BUGFIX: Do not require `node-sass` if `@example scss` is not used
- 🏠 INTERNAL: Upgrade dev dependencies

## 2.1.0: 2018-04-02

- 🚀 NEW: Add `sass.outputStyle` option (default: `expanded`) --
  [#263](https://github.com/oddbird/sassdoc-theme-herman/issues/263)
- 🐛 BUGFIX: Escape backslashes in `herman-export` string values
- 🐛 BUGFIX: Fix bug if annotations try to access missing `env.herman` --
  [#273](https://github.com/oddbird/sassdoc-theme-herman/issues/273)
- 🐛 BUGFIX: Fix bug displaying tabs in `<code>` blocks --
  [#271](https://github.com/oddbird/sassdoc-theme-herman/issues/271)
- 🐛 BUGFIX: Fix bugs in `customCSS` URL re-writing --
  [#265](https://github.com/oddbird/sassdoc-theme-herman/issues/265),
  [#266](https://github.com/oddbird/sassdoc-theme-herman/issues/266)
- 🏠 INTERNAL: Run tests on Windows --
  [#270](https://github.com/oddbird/sassdoc-theme-herman/issues/270)
- 🏠 INTERNAL: Upgrade dependencies

## 2.0.0: 2018-01-31

- 🚀 NEW: Add support for CSS `@font-face` `local()` src in font previews --
  [#173](https://github.com/oddbird/sassdoc-theme-herman/issues/173)
- 🚀 NEW: Add support for embedded data-URI (`data:...`) font previews --
  [#197](https://github.com/oddbird/sassdoc-theme-herman/issues/197)
- 💥 BREAKING: Remove `@font` annotation "formats" option (`{woff, woff2}`) --
  replaced by `formats` key in font Sass map
- 💥 BREAKING: Ignore `@font` Sass map top-level `svgid` option --
  replaced by variant-specific nested `svgid` option
- 🐛 BUGFIX: `@font` previews for local/embedded fonts now sort `@font-face`
  src according to [fontsquirrel generated syntax](https://www.fontsquirrel.com/tools/webfont-generator)
- 🏠 INTERNAL: Use [forked version of scss-comment-parser](https://github.com/jgerigmeyer/scss-comment-parser/tree/fix-semicolon)
  allowing semicolons in documented variable values (e.g. data-URIs) --
  [#254](https://github.com/oddbird/sassdoc-theme-herman/issues/254)

## 1.1.0: 2018-01-17

- 🚀 NEW: Extend SassDoc [groups](http://sassdoc.com/configuration/#groups)
  setting to allow nesting groups in named categories --
  [#228](https://github.com/oddbird/sassdoc-theme-herman/issues/228)
- 🐛 BUGFIX: Fix `herman-export` including incorrectly escaped quotes
  (especially when compiled with Ruby Sass) --
  [#236](https://github.com/oddbird/sassdoc-theme-herman/issues/236)
- 🏠 INTERNAL: Remove deprecated dev-dependency `gulp-util`
- 🏠 INTERNAL: Upgrade dependencies

## 1.0.1: 2018-01-03

- 📝 DOCS: Document Herman-specific styles and patterns.
- 🐛 BUGFIX: Open links within iframe in parent context
  (`<base target="_parent">`).

## 🎉 1.0.0: 2017-12-15 🎉

_No changes from `v1.0.0-rc.8`. Changes since `v0.5.5`:_

### 🚀 New Features

- Support for remaining SassDoc annotations:
  `@throw`, `@return`, `@output`, `@content`, `@since`, `@deprecated`,
  `@author`, `@todo`, `@type`, `@alias` (and aliased callback), `used-by`
  (`@require` annotation callbacks)
- New `@font`, `@colors`, `@sizes`, and `@ratios` annotations (replace
  `@preview` annotation) --
  [#206](https://github.com/oddbird/sassdoc-theme-herman/issues/206)
- Support for SassDoc [`googleAnalytics`][googleanalytics] and
  [`trackingCode`][trackingcode] options --
  [#215](https://github.com/oddbird/sassdoc-theme-herman/issues/215)
- Site-wide search --
  [#28](https://github.com/oddbird/sassdoc-theme-herman/issues/28)
- `extraDocs` option: adds additional files (parsed as Markdown) --
  [#117](https://github.com/oddbird/sassdoc-theme-herman/issues/117)
- `extraLinks` option: adds external links to sidebar nav --
  [#175](https://github.com/oddbird/sassdoc-theme-herman/issues/175)
- `displayColors` option: customizes color formats displayed with `@colors`
  annotation
- `customHTML` option: HTML to include in rendered `@example` annotations
  (replaces `minifiedIcons` option)
- Support "prose" SassDoc comments, that aren't attached to a Sass block
  (parsed as Markdown)
- Sass: `herman-export` mixin -- JSON-export functionality is now built-in
  Sass-json-export integration should continue to work as expected
- Sass: `herman-add($key, $map, $args…)` function -- adds maps directly to
  `$herman`, with optional function/args to compile raw map values

### 💥 Breaking Changes

- Require Node >= 6.0.0
- Remove `@preview` annotation (replaced by new `@font`, `@colors`, `@sizes`,
  and `@ratios` annotations) --
  [#206](https://github.com/oddbird/sassdoc-theme-herman/issues/206)
- Remove `@macro` annotation (replaced by `@example njk`) --
  [#182](https://github.com/oddbird/sassdoc-theme-herman/issues/182)
- `@icons` annotation now only requires path to a folder of SVG icons: relative
  to the project directory, no longer relative to the `templatepath` option --
  [#47](https://github.com/oddbird/sassdoc-theme-herman/issues/47)
- Herman-specific options are now nested under top-level `herman` object in
  SassDoc configuration
- Remove `minifiedIcons` option (replaced with new `customHTML` option)
- Remove `customHead` option (replaced by multiline `@font` annotation)
- Sass-specific options are now nested under `herman.sass` object
- Remove top-level `templatepath` and `nunjucksEnv` options -- now nested
  under new `nunjucks` options object: `nunjucks.templatepath` and
  `nunjucks.environment`
- `customCSS` is only included in rendered `@example` annotation iframes
- Group navigation is now ordered according to config `groups` order --
  [#150](https://github.com/oddbird/sassdoc-theme-herman/issues/150)
- Preserve the original order of SassDoc comments, rather than grouping by type
- Sass: `$herman` export map structure is now organized by type, in nested
  maps: `colors`, `sizes`, `ratios`, and `fonts`
- Sass: `herman-add` mixin now requires an initial `$type` argument,
  in order to assign the given data to the proper nested data-type map
- Sass: Rename `$json` to `$herman` for clearer name-spacing
- Sass: `_herman-inspect`, and `_herman-str-replace` are now considered private
  functions
- Sass: `herman-map-compile` always returns inspected (json-ready) values,
  and now accepts function args
- Sass: Remove `herman-add-colors`/`-sizes`/`-ratios`/`-font` from utils

### 🐛 Bug Fixes

- Return correct promise from theme function (fixes early resolution)
- `UsedBy` list is aware of `display.alias` to unlink hidden aliases
- Do not link to internal `@access private` items if `display` option
  is set to `access: ['public']`
- Fix assets referenced with relative urls in client-provided
  `customCSS` for `@example` annotations --
  [#174](https://github.com/oddbird/sassdoc-theme-herman/issues/174)
- Fix blocks with multi-line selectors and custom `@name` annotations --
  [#140](https://github.com/oddbird/sassdoc-theme-herman/pull/140)
- Fix broken internal links --
  [#106](https://github.com/oddbird/sassdoc-theme-herman/issues/106)
- Do not break layout on fonts with single-item stack --
  [#172](https://github.com/oddbird/sassdoc-theme-herman/issues/172)

### 💅 Polish

- Add attribution/link to Herman/OddBird in nav footer (hidden if
  `display.watermark` is set to `false`) --
  [#154](https://github.com/oddbird/sassdoc-theme-herman/issues/154)
- Replace [marked](https://github.com/chjj/marked) with
  [markdown-it](https://github.com/markdown-it/markdown-it) for Markdown
  parsing with quote beautification --
  [#119](https://github.com/oddbird/sassdoc-theme-herman/issues/119)
- Add "widont" text transformations with
  [typogr](https://github.com/ekalinin/typogr.js)
- Pretty-print compiled HTML/Nunjucks with
  [html prettyprinter](https://github.com/maxogden/commonjs-html-prettyprinter)
- Add Herman logo for default favicon --
  [#155](https://github.com/oddbird/sassdoc-theme-herman/issues/155)
- Group identical colors in `@colors` color-palette --
  [#123](https://github.com/oddbird/sassdoc-theme-herman/issues/123)
- Display `@example` source and compiled code (njk and html; scss and css)
  side-by-side --
  [#65](https://github.com/oddbird/sassdoc-theme-herman/issues/65),
  [#37](https://github.com/oddbird/sassdoc-theme-herman/issues/37)
- Display links on index pages to project home and source,
  when defined in the project `package.json` --
  [#91](https://github.com/oddbird/sassdoc-theme-herman/issues/65)
- Clean up display of parameters and properties --
  [#53](https://github.com/oddbird/sassdoc-theme-herman/issues/53),
  [#49](https://github.com/oddbird/sassdoc-theme-herman/issues/49),
  [#55](https://github.com/oddbird/sassdoc-theme-herman/issues/55)
- Re-brand with sidebar navigation --
  [#58](https://github.com/oddbird/sassdoc-theme-herman/issues/58),
  [#69](https://github.com/oddbird/sassdoc-theme-herman/issues/69)
- Various branding and style improvements

### 🏠 Internal

- Use [forked version of CDocParser](https://github.com/jgerigmeyer/CDocParser/tree/preserve-nested-comments)
  preserving `///` within comments --
  [#212](https://github.com/oddbird/sassdoc-theme-herman/issues/212)
- Use `installJinjaCompat` for default Nunjucks environment
- Bundle static assets with Webpack; precompile JS with Babel --
  [#205](https://github.com/oddbird/sassdoc-theme-herman/issues/205)
- Do not minify compiled HTML assets --
  [#186](https://github.com/oddbird/sassdoc-theme-herman/issues/186)
- Move documentation to `docs/` and include in repo
- Flesh out Herman documentation
- Use GoogleFonts rather than shipping font files
- Add 100% test coverage
- Update dependencies

## 1.0.0-rc.8: 2017-12-14

- CHANGE: Use `installJinjaCompat` for default Nunjucks environment.
- BUGFIX: Fix prettyPrint for compiled HTML/Nunjucks.

## 1.0.0-rc.7: 2017-12-12

- NEW: Support SassDoc [`googleAnalytics`][googleanalytics] and
  [`trackingCode`][trackingcode] options --
  [#215](https://github.com/oddbird/sassdoc-theme-herman/issues/215)
- CHANGE: Use forked version of CDocParser preserving `///` within comments --
  [#212](https://github.com/oddbird/sassdoc-theme-herman/issues/212)
- BUGFIX: Fix paths to custom assets referenced from `customCSS`.

[googleanalytics]: http://sassdoc.com/customising-the-view/#google-analytics
[trackingcode]: http://sassdoc.com/customising-the-view/#tracking-code

## 1.0.0-rc.6: 2017-12-04

- BUGFIX: Fix search result page links.

## 1.0.0-rc.5: 2017-12-04

- BUGFIX: Fix fetching site-search JSON file.

## 1.0.0-rc.4: 2017-12-04

- BUGFIX: Fix broken site-search action attribute.
- CHANGE: Hide Herman watermark if SassDoc `display.watermark` is `false`.

## 1.0.0-rc.3: 2017-11-30

- BUGFIX: Correct for overzealous npm-ignoring (fixes missing scss utilities).

## 1.0.0-rc.2: 2017-11-30

- NEW: Add site-wide search --
  [#28](https://github.com/oddbird/sassdoc-theme-herman/issues/28)
- CHANGE: Bundle static assets with Webpack; precompile JS with Babel --
  [#205](https://github.com/oddbird/sassdoc-theme-herman/issues/205)
- BREAKING: Remove `@preview` annotation, split it into distinct `@colors`,
  `@sizes`, `@ratios` annotations. `@colors`, `@ratios`, and `@sizes`
  annotations accept optional one-word key argument instead of
  semicolon-separated `key:value` arguments. `@sizes` still accepts `style`
  argument, now in curly-brackets (`{...}`). `count` argument removed from
  `@ratios` annotation --
  [#206](https://github.com/oddbird/sassdoc-theme-herman/issues/206)
- CHANGE: `@font` annotation accepts font name (first argument) without
  being wrapped in `'` or `"`.

## 1.0.0-rc.1: 2017-11-24

- NEW: Add additional files (parsed as Markdown) with `extraDocs` option --
  [#117](https://github.com/oddbird/sassdoc-theme-herman/issues/117)
- CHANGE: JSON-export functionality is now built in
  using the `herman-export` mixin.
  Sass-json-export integration should continue to work as expected.
- Updated dependencies.
- BREAKING: Remove `subprojects` option; replace with `extraLinks` option --
  [#175](https://github.com/oddbird/sassdoc-theme-herman/issues/175)
- BREAKING: Removed `@macro` annotation; use `@example njk` instead --
  [#182](https://github.com/oddbird/sassdoc-theme-herman/issues/182)
- CHANGE: HTML assets are no longer minified --
  [#186](https://github.com/oddbird/sassdoc-theme-herman/issues/186)
- CHANGE: Replace [marked](https://github.com/chjj/marked) with
  [markdown-it](https://github.com/markdown-it/markdown-it) for Markdown
  parsing with quote beautification --
  [#119](https://github.com/oddbird/sassdoc-theme-herman/issues/119)
- NEW: Add "widont" text transformations with
  [typogr](https://github.com/ekalinin/typogr.js).
- BUGFIX: Ensure consistent ordering of `extraDocs`.
- BREAKING: `@icons` annotation only requires path to a folder of SVG icons --
  [#47](https://github.com/oddbird/sassdoc-theme-herman/issues/47)
- BREAKING: Replace `minifiedIcons` option with `customHTML` option
  (only included in rendered `@example` annotations).
- BREAKING: Nest `templatepath` and `nunjucksEnv` options under new `nunjucks`
  options object: `nunjucks.templatepath` and `nunjucks.environment`.
- NEW: Add attribution/link to Herman/OddBird in nav footer --
  [#154](https://github.com/oddbird/sassdoc-theme-herman/issues/154)
- CHANGE: Use Herman logo for favicon. --
  [#155](https://github.com/oddbird/sassdoc-theme-herman/issues/155)

## 1.0.0-alpha.15: 2017-10-30

- BUGFIX: Do not error if local file (referenced from `customCSS`) is not found
- BUGFIX: Do not output duplicate custom `@font` HTML in `@example` iframe

## 1.0.0-alpha.14: 2017-10-27

- BREAKING: Remove `accoutrement-add` as a public utility,
  since Sass 3.5+ modular sytems will make it unusable.
- Updated dependencies.
- BUGFIX: Fix broken internal links --
  [#106](https://github.com/oddbird/sassdoc-theme-herman/issues/106)
- BREAKING: Group navigation is ordered according to config `groups` order --
  [#150](https://github.com/oddbird/sassdoc-theme-herman/issues/150)
- BUGFIX: Do not error if `sass` config option is `undefined`.
- BUGFIX: Do not break layout on fonts with single-item stack --
  [#172](https://github.com/oddbird/sassdoc-theme-herman/issues/172)
- BREAKING: `@preview font-specimen` is replaced by new `@font` annotation.
- BREAKING: Removed `customHead` option; replaced by multiline `@font`
  annotation.
- BUGFIX: Fix assets referenced with relative urls in client-provided
  `customCSS` for `@example` annotations --
  [#174](https://github.com/oddbird/sassdoc-theme-herman/issues/174)

## 1.0.0-alpha.13: 2017-09-25

- BREAKING: `$herman` export map structure is now organized by type,
  in nested maps: `colors`, `sizes`, `ratios`, and `fonts`.
- BREAKING: `herman-add` mixin now requires an initial `$type` argument,
  in order to assign the given data to the proper nested data-type map.

## 1.0.0-alpha.12: 2017-09-18

- BUGFIX: Typo from updating to latest accoutrement-scale
- BUGFIX: Improved internal logic for `herman-map-compile` mixin

## 1.0.0-alpha.11: 2017-09-18

- BUGFIX: Do not error on prose blocks without `item.context.name`

## 1.0.0-alpha.10: 2017-09-14

- BREAKING: Rename `$json` to `$herman` for clearer name-spacing
- BREAKING: `_herman-inspect`, and `_herman-str-replace`
  are now considered private functions
- BREAKING: `herman-map-compile` always returns inspected (json-ready) values,
  and now accepts function args
- BREAKING: Remove `herman-add-colors`/`-sizes`/`-ratios`/`-font` from utils
- BREAKING: Require Node >= 6.0.0
- NEW: Use `herman-add($key, $map, $args…)` to add maps directly to `$herman`,
  with optional function/args to compile raw map values
- NEW: Use `accoutrement-add($type, $key, $map)` to automate compilation
  of accoutrement (color, ratio, size, font) maps,
  while adding to both `$herman` and the appropriate accoutrement global
  (`$colors`, `$ratios`, `$sizes`, `$fonts`).
- NEW: `displayColors` option (type: `Array`, default: `['hex', 'rgb', 'hsl']`)
- CHANGE: Group identical colors in color-palette --
  [#123](https://github.com/oddbird/sassdoc-theme-herman/issues/123)
- BUGFIX: Fix blocks with multi-line selectors and custom @name annotations --
  [#140](https://github.com/oddbird/sassdoc-theme-herman/pull/140)
- DOCS: Move to `docs/` and include in repo.

## 1.0.0-alpha.9: 2017-06-29

- BUGFIX: Remove non-standard html markup on prose blocks

## 1.0.0-alpha.8: 2017-06-28

- BUGFIX: Remove un-used font files from distribution
- Render sassdoc comments that aren't attached to a Sass block as Markdown
  prose.
- Preserve the original order of sassdoc comments rather than grouping by type.

## 1.0.0-alpha.7: 2017-06-16

- BUGFIX: Render icon previews in iframes.
- BUGFIX: Adjusted styles for navigation and text.
- BUGFIX: Added styles for blockquotes.
- BREAKING: `minifiedIcons` option and the first argument to the `@icons`
  annotation are both paths relative to the project directory, no longer
  relative to the `templatepath` option.

## 1.0.0-alpha.6: 2017-06-14

- BREAKING: Render examples in iframes and only include custom CSS
  in those iframes, for better isolation.

## 1.0.0-alpha.5: 2017-06-08

- BUGFIX: Style cleanup for code-blocks, examples, and properties
- BUGFIX: UsedBy list is aware of `display.alias` to unlink hidden aliases

## 1.0.0-alpha.4: 2017-06-02

- BREAKING: Move `customHead` option into `herman` options object.
- BUGFIX: Return correct promise from theme function (fixes early resolution).

## 1.0.0-alpha.3: 2017-05-31

- Use GoogleFonts rather than shipping font files
- Add support for remaining SassDoc annotations:
  `@throw`, `@return`, `@output`, `@content`, `@since`, `@deprecated`, `@author`
- Provide more samples

## 1.0.0-alpha.2: 2017-05-31

- BUGFIX: Show compiled html/css @example even if only one type.

## 1.0.0-alpha.1: 2017-05-29

- Display links on index pages to project home and source,
  when defined in the project `package.json` --
  [#91](https://github.com/oddbird/sassdoc-theme-herman/issues/65)
- Clean up display of parameters and properties --
  [#53](https://github.com/oddbird/sassdoc-theme-herman/issues/53) and
  [#49](https://github.com/oddbird/sassdoc-theme-herman/issues/49) and
  [#55](https://github.com/oddbird/sassdoc-theme-herman/issues/55)
- Display source and compiled code (njk and html; scss and css) side-by-side --
  [#65](https://github.com/oddbird/sassdoc-theme-herman/issues/65)
- Add support for @todo annotation --
  [#18](https://github.com/oddbird/sassdoc-theme-herman/issues/18)
- Add support for @type annotation --
  [#19](https://github.com/oddbird/sassdoc-theme-herman/issues/19)
- Add support for @alias (and aliased callback) annotation --
  [#5](https://github.com/oddbird/sassdoc-theme-herman/issues/5)
- Add support for used-by (@require annotation callbacks).
- Show compiled CSS for `@example scss` annotations --
  [#37](https://github.com/oddbird/sassdoc-theme-herman/issues/37)
- BREAKING: Nest Herman-specific options under `herman` object in sassdoc
  configuration, and Sass-specific options under `herman.sass` object.
- Re-brand with sidebar navigation --
  [#58](https://github.com/oddbird/sassdoc-theme-herman/issues/58) and
  [#69](https://github.com/oddbird/sassdoc-theme-herman/issues/69).
- Add support for rendering documentation from dependency subprojects --
  [#61](https://github.com/oddbird/sassdoc-theme-herman/issues/61).
- BUGFIX: Do not link to internal `@access private` items if `display` option
  is set to `access: ['public']`.
- BUGFIX: Do not error if missing `herman.subprojects` option --
  [#107](https://github.com/oddbird/sassdoc-theme-herman/issues/107).
- BUGFIX: Do not error if missing `herman` options --
  [#108](https://github.com/oddbird/sassdoc-theme-herman/issues/108).

## 0.5.5: 2017-02-22

- Fix @example macro to work with sassdoc v2.2.0. See
  <https://github.com/SassDoc/sassdoc/commit/842847493f9644e50f9e2ce783eacf886ccf69a0>.

## 0.5.4: 2017-01-16

- Render type `html` examples to HTML --
  [#45](https://github.com/oddbird/sassdoc-theme-herman/issues/45).

## 0.5.3: 2016-12-22

- Prevent template render errors when data is missing. Fixes
  [#44](https://github.com/oddbird/sassdoc-theme-herman/issues/44).

## 0.5.2: 2016-12-15

- Change absolute `@see` links to relative paths,
  so we're not assuming a root URL for the styleguide.
- Add `customHead` option to add custom HTML to the `<head>`.

## 0.5.1: 2016-12-13

- Add optional `show` argument for font-specimen previews --
  `@preview font-specimen; show: regular, bold, bold italic` --
  allowing you to override what variants are displayed
  in the specimen.

## 0.5.0: 2016-12-09

- Add table output for `@property` annotation,
  similar to `@parameter` table output.
- Standardize `data-sassdoc-display='<annotation>'`
  for annotation display blocks
  (previously a mix of `data-sassdoc` values),
  and `data-sassdoc-table'<annotation>'` for tables
  (previously `data-sassdoc='<annotation>-table'`).

## 0.4.0: 2016-11-08

- Inject preview data directly into HTML,
  so that previews don't have to be styled locally
- Add [Sass Utilities](https://www.oddbird.net/herman/docs/api_json-export)
  file, for help with setting/exporting Sass data
- `herman-add-color` mixin now exports hex, rgba, and hsla colors.
- Simplified font previews don't require size input
- Color, font, ratio, and size previews accept `key` argument,
  in case the JSON key doesn't match the variable name
  (most common for fonts)
- Ratio preview accets `count` argument [`1-10`],
  determining how many instances of the ratio to display
  (default is `6`)
- Size preview accepts `style` argument [`text` | `ruler` | `output-only`],
  determining the type of preview to display (default is `text`, see
  [scale](https://www.oddbird.net/herman/docs/demo_sizes) for examples)

## 0.3.2: 2016-09-29

- Mark imported `minifiedIcons` file as `|safe`.

## 0.3.1: 2016-09-14

- Added `nunjucksEnv` option to use a custom nunjucks environment.
- Added `jinja` syntax highlighting for `@example njk` code blocks.

## 0.3.0: 2016-08-17

- Added rendering of @example annotations using the njk (nunjucks) language.
- Removed rendering of macro examples using `macroname_data`.

## 0.2.1: 2015-12-23

- Updated dependencies.

## 0.2.0: 2015-12-17

- Add `@icons` annotation.
- Add `@preview` annotation for color palettes and font specimens.
- Add syntax highlighting of code blocks.

## 0.1.0: 2015-11-25

- Initial release. `@macro` annotation and basic infrastructure.
