Herman [a SassDoc theme]
========================

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
npm install sassdoc-theme-herman
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
	/// @group test
	[data-mymacro] {}

will render the `mymacro` macro from the file `macros.j2`
(which happens to use the `[data-mymacro]` attribute).

In order for this to work,
you must also specify a `templatepath` in your `sassdoc` options
(the path where nunjucks will look to import templates).


Releases
--------

### 0.3.0: 2016-??-??

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
