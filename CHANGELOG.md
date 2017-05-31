# Herman Changelog

## 1.0.0-alpha.3: 2017-05-31

- Use GoogleFonts rather than shipping font files
- Add support for remaining SassDoc annotations:
  `@throw`, `@return`, `@output`, `@content`, `@since`, `@deprecated`, `@author`
- Provide more samples

## 1.0.0-alpha.2: 2017-05-31

- BUGFIX: Show compiled html/css @example even if only one type.

## 1.0.0-alpha.1: 2017-05-29

- Display links on index pages to project home and source,
  when defined in the project `package.json` –
  [#91](https://github.com/oddbird/sassdoc-theme-herman/issues/65)
- Clean up display of parameters and properties –
  [#53](https://github.com/oddbird/sassdoc-theme-herman/issues/53) and
  [#49](https://github.com/oddbird/sassdoc-theme-herman/issues/49) and
  [#55](https://github.com/oddbird/sassdoc-theme-herman/issues/55)
- Display source and compiled code (njk and html; scss and css) side-by-side –
  [#65](https://github.com/oddbird/sassdoc-theme-herman/issues/65)
- Add support for @todo annotation –
  [#18](https://github.com/oddbird/sassdoc-theme-herman/issues/18)
- Add support for @type annotation –
  [#19](https://github.com/oddbird/sassdoc-theme-herman/issues/19)
- Add support for @alias (and aliased callback) annotation –
  [#5](https://github.com/oddbird/sassdoc-theme-herman/issues/5)
- Add support for used-by (@require annotation callbacks).
- Show compiled CSS for `@example scss` annotations –
  [#37](https://github.com/oddbird/sassdoc-theme-herman/issues/37)
- BREAKING: Nest Herman-specific options under `herman` object in sassdoc
  configuration, and Sass-specific options under `herman.sass` object.
- Re-brand with sidebar navigation –
  [#58](https://github.com/oddbird/sassdoc-theme-herman/issues/58) and
  [#69](https://github.com/oddbird/sassdoc-theme-herman/issues/69).
- Add support for rendering documentation from dependency subprojects –
  [#61](https://github.com/oddbird/sassdoc-theme-herman/issues/61).
- BUGFIX: Do not link to internal `@access private` items if `display` option
  is set to `access: ['public']`.
- BUGFIX: Do not error if missing `herman.subprojects` option –
  [#107](https://github.com/oddbird/sassdoc-theme-herman/issues/107).
- BUGFIX: Do not error if missing `herman` options –
  [#108](https://github.com/oddbird/sassdoc-theme-herman/issues/108).

## 0.5.5: 2017-02-22

- Fix @example macro to work with sassdoc v2.2.0. See
  [https://github.com/SassDoc/sassdoc/commit/842847493f9644e50f9e2ce783eacf886ccf69a0][].

## 0.5.4: 2017-01-16

- Render type `html` examples to HTML –
  [#45](https://github.com/oddbird/sassdoc-theme-herman/issues/45).


## 0.5.3: 2016-12-22

- Prevent template render errors when data is missing. Fixes
  [#44](https://github.com/oddbird/sassdoc-theme-herman/issues/44).


## 0.5.2: 2016-12-15

- Change absolute `@see` links to relative paths,
  so we're not assuming a root URL for the styleguide.
- Add `customHead` option to add custom HTML to the <head>.


## 0.5.1: 2016-12-13

- Add optional `show` argument for font-specimen previews —
  `@preview font-specimen; show: regular, bold, bold italic` —
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
