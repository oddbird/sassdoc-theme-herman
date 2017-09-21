Herman [a SassDoc theme]
========================

[![Greenkeeper badge](https://badges.greenkeeper.io/oddbird/sassdoc-theme-herman.svg)](https://greenkeeper.io/)

> “Documentation should be the default option,
> baked directly into the development process.
> If it’s not documented, it doesn't exist.”
>
> <cite>—Miriam Suzanne</cite>

At [OddBird][oddbird],
we wanted a tool to help us
document the entire front end of a project,
from brand guidelines to UX Elements and code patterns.

Herman is built as an extension to [SassDoc][SassDoc],
still in alpha-development,
with features for documenting and automating
user-experience and code patterns, such as:

- Font specimens
- Color palettes
- SVG icon previews
- Referencing & rendering Nunjucks macros from the Sass docs
- Displaying pre-and-post compilation code samples
- Rendering sample components
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


Rendering `scss` and `nunjucks` examples
----------------------------------------

If you use an `@example` annotation with the `scss` or `njk` languages,
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

In order for this to work for scss, you must include an `includepaths` key in
your sassdoc configuration `herman.sass` option object. It should be an array
of places to look for Sass includes, like
`includepaths: [ path.join(__dirname, 'static/sass') ]`. Further, all of
the Sass examples will have to be complete and valid. This may require
including something like `@import 'config/manifest';` at the top of each. If
you include an `includes` array in your sassdoc configuration `herman.sass`
option object, those files (relative to the `includepaths`) will always be
`@import`-ed for `@example scss`. *Note: Included Sass files should not contain
any CSS output; any output will be displayed along with the @example.*

In order for this to work for nunjucks,
you must also either specify a `templatepath`
(the path where nunjucks will look to import templates),
or a `nunjucksEnv` (a custom nunjucks environment —
this is particularly useful if your macros contain custom filters)
in your sassdoc configuration `herman` option object.

Any html (or html-compiled) examples
will also be rendered in iframes.


Development
-----------

To install the necessary Node dependencies, run ``yarn``.

You can lint the project's JS with ``gulp eslint``
and run the JS unit tests with ``gulp jstest``.
You can lint Sass with ``gulp sasslint``
and run the Sass tests with ``gulp sasstest``.

To compile and minify the static assets —
as well as generate the documentation —
run ``gulp compile``.

Just running ``gulp`` will perform all of the above tasks.

You can start up a local development server with ``gulp serve``.
This will also watch for changes to local files
and automatically perform an appropriate selection of the above tasks
whenever changes are detected to relevant files.

Access the running server at http://localhost:3000.

Refer to the ``gulpfile.js`` source
and [gulp](http://gulpjs.com/) documentation
for more info.
