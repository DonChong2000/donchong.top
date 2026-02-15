import { comparePages, type TagPage } from '@/lib/tags';

function makePage(overrides: Partial<TagPage> = {}): TagPage {
  return {
    url: '/example',
    title: 'Untitled',
    tags: [],
    ...overrides,
  };
}

describe('comparePages', () => {
  it('sorts by priority descending', () => {
    const higherPriorityPage = makePage({ title: 'Higher', priority: 10 });
    const lowerPriorityPage = makePage({ title: 'Lower', priority: 1 });

    expect(comparePages(higherPriorityPage, lowerPriorityPage)).toBeLessThan(0);
    expect(comparePages(lowerPriorityPage, higherPriorityPage)).toBeGreaterThan(0);
  });

  it('sorts by title ascending when priorities are equal', () => {
    const a = makePage({ title: 'Alpha', priority: 5 });
    const b = makePage({ title: 'Beta', priority: 5 });

    expect(comparePages(a, b)).toBeLessThan(0);
    expect(comparePages(b, a)).toBeGreaterThan(0);
  });

  it('treats missing priority as 0', () => {
    const a = makePage({ title: 'Alpha' });
    const b = makePage({ title: 'Beta', priority: 0 });
    const c = makePage({ title: 'Charlie' });

    const sorted = [c, b, a].sort(comparePages);
    expect(sorted.map((p) => `${p.priority ?? 0}:${p.title}`)).toEqual([
      '0:Alpha',
      '0:Beta',
      '0:Charlie',
    ]);
  });

  it('supports decimal priorities', () => {
    const a = makePage({ title: 'Alpha', priority: 1.2 });
    const b = makePage({ title: 'Beta', priority: 1.1 });

    expect(comparePages(a, b)).toBeLessThan(0);
    expect(comparePages(b, a)).toBeGreaterThan(0);
  });

  it('falls back to title when decimal priorities are equal', () => {
    const a = makePage({ title: 'Alpha', priority: 1.5 });
    const b = makePage({ title: 'Beta', priority: 1.5 });

    expect(comparePages(a, b)).toBeLessThan(0);
    expect(comparePages(b, a)).toBeGreaterThan(0);
  });

  it('returns 0 when priority and title are the same', () => {
    const a = makePage({ url: '/a', title: 'Same', priority: 2 });
    const b = makePage({ url: '/b', title: 'Same', priority: 2 });

    expect(comparePages(a, b)).toBe(0);
  });
});
