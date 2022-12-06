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
  // Find all CSS custom properties and font-related declarations in root nodes
  const rules = csstree.findAll(
    csstree.parse(rootNodes),
    (node) =>
      node.type === 'Declaration' &&
      (node.property.startsWith('--') || node.property.startsWith('font-')),
  );
  // Find all @font-face declarations
  const fontFace = csstree
    .findAll(
      csstree.parse(css),
      (node) => node.type === 'Atrule' && node.name === 'font-face',
    )
    .map((decl) => csstree.generate(decl))
    .join('\n');

  return `
${fontFace}
:root {
  ${rules.map((decl) => csstree.generate(decl)).join(';\n  ')};
}
  `.trim();
};
