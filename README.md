# [Herman][herman] [a [SassDoc][sassdoc] theme]

[![CircleCI](https://circleci.com/gh/oddbird/sassdoc-theme-herman.svg?style=svg)](https://circleci.com/gh/oddbird/sassdoc-theme-herman)
[![Coverage Status](https://coveralls.io/repos/github/oddbird/sassdoc-theme-herman/badge.svg)](https://coveralls.io/github/oddbird/sassdoc-theme-herman)
[![Greenkeeper badge](https://badges.greenkeeper.io/oddbird/sassdoc-theme-herman.svg)](https://greenkeeper.io/)

> "**If it's not documented, it doesn't exist.**
> Documentation should become the default,
> an integrated part of the development process."
>
> <cite>---Miriam Suzanne</cite>

At [OddBird][oddbird],
we wanted better tools for documenting
the entire front end of a project --
from brand guidelines to UX patterns and code APIs:

- Documenting the intersection of languages and styles
- Written directly in the code,
  and integrated with code architecture
- Automated for a document that grows and changes
  along with the life of your project

Herman is built as an extension to [SassDoc][sassdoc],
and supports all their core functionality
with additional support for
[font specimens][font-docs], [color palettes][color-preview],
[sizes and ratios][size-preview], [SVG icons][icon-docs],
[compiled languages][example-docs], Nunjucks/Jinja macros, HTML previews,
and more.

[font-docs]: http://oddbird.net/herman/docs/demo_fonts.html
[color-preview]: http://oddbird.net/herman/docs/demo_colors.html
[size-preview]: http://oddbird.net/herman/docs/demo_sizes.html
[icon-docs]: http://oddbird.net/herman/docs/demo_icons.html
[example-docs]: http://oddbird.net/herman/docs/demo_examples.html


## Getting Started

```bash
npm install sassdoc sassdoc-theme-herman
```

See the [SassDoc documentation](http://sassdoc.com/getting-started/)
to install SassDoc and run it via various build tools.
Specify `herman` as the theme
in your SassDoc options:

```bash
sassdoc <src> --theme herman
```


### SassDoc Comments

Currently,
all SassDoc/Herman annotations are written as Sass comments
starting with `///` to differentiate documentation
from other developer comments (`//`).

```scss
// This comment will be ignored by Herman
/// This comment will be rendered in the documentation
```

Annotation comments can be free-floating,
or attached to a particular Sass/CSS object --
such as a variable, mixin, function, or selector block.

```scss
/// this is a free-floating comment

/// this comment is attached to the following mixin code-block
@mixin sample-object { … }
```


### Herman Annotations

In addition to the core SassDoc annotations,
our [`@icons` annotation][icon-docs] allows you to
display SVG icons from a given folder,
and we extend the core [`@example` annotation][example-docs]
to display compiled Sass/Nunjucks output
and render sample components.
We also provide a [`@font` annotation][font-docs]
for displaying font-specimens,
and `@colors`, `@sizes`, and `@ratios` annotations
for displaying [color-palettes][color-preview],
[text and spacing sizes, and modular ratios][size-preview].

[herman]: http://oddbird.net/herman/
[oddbird]: http://oddbird.net/
[sassdoc]: http://sassdoc.com/

[See the full documentation for details »][docs]

[docs]: http://oddbird.net/herman/docs/CONFIGURATION.html


## SassDoc Extras

Herman uses a number of SassDoc Extras:

- [Description](http://sassdoc.com/extra-tools/#description-description-descriptionpath)
- [Display](http://sassdoc.com/extra-tools/#display-toggle-display)
- [GroupName](http://sassdoc.com/extra-tools/#groups-aliases-groupname)
- [ShortcutIcon](http://sassdoc.com/extra-tools/#shortcut-icon-shortcuticon)
- [Sort](http://sassdoc.com/extra-tools/#sort-sort)
- [ResolveVariables](http://sassdoc.com/extra-tools/#resolved-variables-resolvevariables)
