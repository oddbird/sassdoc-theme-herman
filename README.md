Herman [a SassDoc theme]
========================

[![Greenkeeper badge](https://badges.greenkeeper.io/oddbird/sassdoc-theme-herman.svg)](https://greenkeeper.io/)

> “**If it’s not documented, it doesn't exist.**
> Documentation should become the default,
> an integrated part of the development process.”
>
> <cite>—Miriam Suzanne</cite>

At [OddBird][oddbird],
we wanted better tools for documenting
the entire front end of a project –
from brand guidelines to UX patterns and code APIs:

- Documenting the intersection of languages and styles
- Written directly in the code,
  and integrated with code architecture
- Automated for a document that grows and changes
  along with the life of your project

Herman is built as an extension to [SassDoc][sassdoc],
and supports all their core functionality
for font specimens, color palettes, sizes, SVG icons,
compiled languages, Nunjucks/Jinja macros, HTML previews,
and more.


Getting Started
---------------

Install with `npm` or `yarn`,
along with `sassdoc`.

```
yarn add sassdoc sassdoc-theme-herman
```

Set `Herman` as your SassDoc theme
in `.sassdocrc` or other build configuration.
See the [full SassDoc documentation][sassdoc] for details
and core features.

Currently,
all SassDoc/Herman annotations are written as Sass comments
starting with `///` to differentiate documentation
from other developer notes.
More languages will be added over time.

  // This comment will be ignored by Herman
  /// This comment will be rendered in the documentation

Annotation comments can be free-floating,
or attached to a particular Sass/CSS object –
such as a variable, mixin, function, or selector block.

  /// this is a free-floating comment

  /// this comment is attached to the following mixin code-block
  @mixin sample-object { … }

In addition to the core SassDoc annotations,
our `@icons` annotation allows you to
display SVG icons from a given folder,
and we provide a `@preview` command
for displaying color-palettes, font-specimens,
text and spacing sizes, and modular ratios.
We also extend the core `@example` annotation
to display compiled Sass/Nunjucks output
and render sample components.

[Read the full documentation »][docs]

[oddbird]: http://oddbird.net/
[sassdoc]: http://sassdoc.com/
[docs]: http://oddbird.net/herman/docs/
