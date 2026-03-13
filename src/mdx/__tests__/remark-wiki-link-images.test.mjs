const mockMetadata = jest.fn();
const mockToBuffer = jest.fn();

jest.mock('sharp', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    metadata: mockMetadata,
    clone() {
      return {
        resize() {
          return { png() { return { toBuffer: mockToBuffer }; } };
        },
      };
    },
  })),
}));

jest.mock('unist-util-visit', () => {
  function visit(tree, type, visitor) {
    function walk(node) {
      if (!node.children) return;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type === type) {
          const result = visitor(child, i, node);
          if (Array.isArray(result)) {
            i = result[1] - 1;
          }
        }
        walk(child);
      }
    }
    walk(tree);
  }
  visit.SKIP = 'skip';
  return { visit, SKIP: 'skip', CONTINUE: true, EXIT: false };
});

import { remarkWikiLinkImages } from '../remark-wiki-link-images.mjs';

// --- helpers ---------------------------------------------------------------

function makeTree(textValue) {
  return {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', value: textValue }],
      },
    ],
  };
}

const fakeFile = { path: '/src/app/hobbies/factorio/page.mdx', history: [] };

function getImageNode(tree) {
  return tree.children[0].children[0];
}

function getAttr(node, name) {
  return node.attributes.find((a) => a.name === name)?.value;
}

function setupSharpMock(width = 1920, height = 1080) {
  mockMetadata.mockResolvedValue({ width, height });
  mockToBuffer.mockResolvedValue(Buffer.from('fakepng'));
}

// --- tests -----------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  setupSharpMock();
});

describe('remarkWikiLinkImages', () => {
  test('converts ![[path]] to Image node with correct src and alt', async () => {
    const tree = makeTree('![[photo.png]]');
    await remarkWikiLinkImages()(tree, fakeFile);

    const node = getImageNode(tree);
    expect(node.type).toBe('mdxJsxFlowElement');
    expect(node.name).toBe('Image');
    expect(getAttr(node, 'src')).toBe('/images/hobbies/factorio/photo.png');
    expect(getAttr(node, 'alt')).toBe('photo.png');
  });

  test('URI-encodes filenames with spaces', async () => {
    const tree = makeTree('![[Screenshot 2025-10-27 215558.png]]');
    await remarkWikiLinkImages()(tree, fakeFile);

    const node = getImageNode(tree);
    expect(getAttr(node, 'src')).toBe(
      '/images/hobbies/factorio/Screenshot%202025-10-27%20215558.png',
    );
  });

  test('injects width, height, blurDataURL, and placeholder', async () => {
    const tree = makeTree('![[photo.png]]');
    await remarkWikiLinkImages()(tree, fakeFile);

    const node = getImageNode(tree);
    expect(getAttr(node, 'width')).toBe('1920');
    expect(getAttr(node, 'height')).toBe('1080');
    expect(getAttr(node, 'blurDataURL')).toMatch(/^data:image\/png;base64,/);
    expect(getAttr(node, 'placeholder')).toBe('blur');
  });

  test('gracefully handles metadata failure — no width/height/blur', async () => {
    mockMetadata.mockRejectedValue(new Error('file not found'));

    const tree = makeTree('![[missing.png]]');
    await remarkWikiLinkImages()(tree, fakeFile);

    const node = getImageNode(tree);
    expect(node.name).toBe('Image');
    expect(getAttr(node, 'src')).toBe('/images/hobbies/factorio/missing.png');
    expect(getAttr(node, 'alt')).toBe('missing.png');
    expect(getAttr(node, 'width')).toBeUndefined();
    expect(getAttr(node, 'height')).toBeUndefined();
    expect(getAttr(node, 'blurDataURL')).toBeUndefined();
  });
});
