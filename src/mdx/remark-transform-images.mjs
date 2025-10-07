import { visit } from 'unist-util-visit';

export const remarkTransformImages = () => (tree) => {
  visit(tree, 'image', (node, index, parent) => {
    if (node.url && node.url.startsWith("img['") && node.url.endsWith("']")) {
      // Use new RegExp for easier string escaping
      const re = new RegExp("^img\\['(.+)'\]$");
      const match = node.url.match(re);

      if (!match) return;

      const imageName = match[1];
      const escapedImageName = imageName.replace(/'/g, "'");

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'Image',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'src',
            value: {
              type: 'mdxJsxAttributeValueExpression',
              value: node.url, // Fallback value
              data: {
                estree: {
                  type: 'Program',
                  body: [
                    {
                      type: 'ExpressionStatement',
                      expression: {
                        type: 'MemberExpression',
                        object: { type: 'Identifier', name: 'img' },
                        property: { type: 'Literal', value: imageName, raw: `'${escapedImageName}'` },
                        computed: true,
                        optional: false,
                      },
                    },
                  ],
                  sourceType: 'script',
                },
              },
            },
          },
          { type: 'mdxJsxAttribute', name: 'alt', value: node.alt },
          { type: 'mdxJsxAttribute', name: 'placeholder', value: 'blur' },
        ],
        children: [],
      };
    }
  });
};