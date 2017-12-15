# Herman Changelog


## 🎉 1.0.0: 2017-12-15 🎉

*No changes from `v1.0.0-rc.8`. Changes since `v0.5.5`:*

### 🚀 New Features

- Support for remaining SassDoc annotations:
  `@throw`, `@return`, `@output`, `@content`, `@since`, `@deprecated`,
  `@author`, `@todo`, `@type`, `@alias` (and aliased callback), `used-by`
  (`@require` annotation callbacks)
- New `@font`, `@colors`, `@sizes`, and `@ratios` annotations (replace
  `@preview` annotation) --
  [#206](https://github.com/oddbird/sassdoc-theme-herman/issues/206)
- Support for SassDoc [`googleAnalytics`][googleAnalytics] and
  [`trackingCode`][trackingCode] options --
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

- NEW: Support SassDoc [`googleAnalytics`][googleAnalytics] and
  [`trackingCode`][trackingCode] options --
  [#215](https://github.com/oddbird/sassdoc-theme-herman/issues/215)
- CHANGE: Use forked version of CDocParser preserving `///` within comments --
  [#212](https://github.com/oddbird/sassdoc-theme-herman/issues/212)
- BUGFIX: Fix paths to custom assets referenced from `customCSS`.

[googleAnalytics]: http://sassdoc.com/customising-the-view/#google-analytics
[trackingCode]: http://sassdoc.com/customising-the-view/#tracking-code


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
- Add [Sass Utilities](sass-utilities.html) file,
  for help with setting/exporting Sass data
- `herman-add-color` mixin now exports hex, rgba, and hsla colors.
- Simplified font previews don't require size input
- Color, font, ratio, and size previews accept `key` argument,
  in case the JSON key doesn't match the variable name
  (most common for fonts)
- Ratio preview accets `count` argument [`1-10`],
  determining how many instances of the ratio to display
  (default is `6`)
- Size preview accepts `style` argument [`text` | `ruler` | `output-only`],
  determining the type of preview to display
  (default is `text`, see [scale](scale.html) for examples)


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
