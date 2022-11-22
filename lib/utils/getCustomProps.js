'use strict';

const csstree = require('css-tree');

module.exports = (css) => {
  // Find all root (html, body, :root) nodes
  const rootNodes = csstree
    .findAll(
      csstree.parse(css),
      (node) =>
        node.type === 'Rule' &&
        node.prelude.children.some((sel) =>
          sel.children.some((child) =>
            ['html', 'root', 'body'].includes(child.name),
          ),
        ),
    )
    .map((decl) => csstree.generate(decl))
    .join('\n');
  // Find all CSS custom properties declared in root nodes
  const customProps = csstree.findAll(
    csstree.parse(rootNodes),
    (node) => node.type === 'Declaration' && node.property.startsWith('--'),
  );
  return `
[data-herman-preview="colors"] {
  ${customProps.map((decl) => csstree.generate(decl)).join(';\n  ')};
}
  `.trim();
};
