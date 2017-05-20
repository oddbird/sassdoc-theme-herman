Herman [a SassDoc theme]
========================

[![Greenkeeper badge](https://badges.greenkeeper.io/oddbird/sassdoc-theme-herman.svg)](https://greenkeeper.io/)

At [OddBird][oddbird],
we wanted to a tool to help us
document the entire front end of a project,
from brand guidelines to UX Elements and code patterns.
Herman is our odd [SassDoc][SassDoc] theme,
still in alpha-development,
with a number of extra features for documenting
user-experience and code patterns:

- Font specimens
- Color palettes
- SVG icon previews
- Referencing & rendering Jinja/Nunjucks macros from the Sass docs
- more on the way!

[oddbird]: http://oddbird.net/
[SassDoc]: http://sassdoc.com/


Getting Started
---------------

```
yarn add sassdoc-theme-herman
```

See the [SassDoc documentation](http://sassdoc.com/getting-started/)
for how to install SassDoc and run it via various build tools.

Herman is a theme for SassDoc,
so you'll want to specify `herman`
as the theme in your `sassdoc` options.


Rendering `nunjucks` examples
-----------------------------

If you use an `@example` annotation with the `njk` language,
Herman will display both the source code of the example
and its rendered output.

This makes it possible to show examples of markup patterns
that make use of styles in your Sass.

For example, this:

	// Test Macro
	// ----------
	// This is a test.
	/// @example njk - Basic usage:
	///  {% import 'macros.j2' as macros %}
	///  {{ macros.mymacro(1, 2) }}
	[data-mymacro] {}

will render the `mymacro` macro from the file `macros.j2`
(which happens to use the `[data-mymacro]` attribute).

In order for this to work,
you must also either specify a `templatepath`
(the path where nunjucks will look to import templates),
or a `nunjucksEnv` (a custom nunjucks environment —
this is particularly useful if your macros contain custom filters)
in your `sassdoc` options.


Development
-----------

To install the necessary Node dependencies, run ``yarn``.

You can lint the project's JS with ``gulp eslint``
and run the JS unit tests with ``gulp jstest``
(or ``yarn test``).
You can lint Sass with
``gulp sasslint``.

To compile and minify the static assets —
as well as generate the documentation —
run ``gulp compile``.

Just running ``gulp`` will perform all of the above tasks.

You can start up a local development server with ``gulp develop``.
This will also watch for changes to local files
and automatically perform an appropriate selection of the above tasks
whenever changes are detected to relevant files.

Access the running server at http://localhost:3000.

Refer to the ``gulpfile.js`` source
and [gulp](http://gulpjs.com/) documentation
for more info.


Releases
--------

### 0.5.5: 2017-02-22

- Fix @example macro to work with sassdoc v2.2.0. See
  [https://github.com/SassDoc/sassdoc/commit/842847493f9644e50f9e2ce783eacf886ccf69a0][].

### 0.5.4: 2017-01-16

- Render type `html` examples to HTML. Closes
  [#45](https://github.com/oddbird/sassdoc-theme-herman/issues/45).


### 0.5.3: 2016-12-22

- Prevent template render errors when data is missing. Fixes
  [#44](https://github.com/oddbird/sassdoc-theme-herman/issues/44).


### 0.5.2: 2016-12-15

- Change absolute `@see` links to relative paths,
  so we're not assuming a root URL for the styleguide.
- Add `customHead` option to add custom HTML to the <head>.


### 0.5.1: 2016-12-13

- Add optional `show` argument for font-specimen previews —
  `@preview font-specimen; show: regular, bold, bold italic` —
  allowing you to override what variants are displayed
  in the specimen.


### 0.5.0: 2016-12-09

- Add table output for `@property` annotation,
  similar to `@parameter` table output.
- Standardize `data-sassdoc-display='<annotation>'`
  for annotation display blocks
  (previously a mix of `data-sassdoc` values),
  and `data-sassdoc-table'<annotation>'` for tables
  (previously `data-sassdoc='<annotation>-table'`).


### 0.4.0: 2016-11-08

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

### 0.3.2: 2016-09-29

- Mark imported `minifiedIcons` file as `|safe`.

### 0.3.1: 2016-09-14

- Added `nunjucksEnv` option to use a custom nunjucks environment.
- Added `jinja` syntax highlighting for `@example njk` code blocks.

### 0.3.0: 2016-08-17

- Added rendering of @example annotations using the njk (nunjucks) language.
- Removed rendering of macro examples using `macroname_data`.

### 0.2.1: 2015-12-23

- Updated dependencies.

### 0.2.0: 2015-12-17

- Add `@icons` annotation.
- Add `@preview` annotation for color palettes and font specimens.
- Add syntax highlighting of code blocks.

### 0.1.0: 2015-11-25

- Initial release. `@macro` annotation and basic infrastructure.
