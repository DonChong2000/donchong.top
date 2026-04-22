# Markdown for Agents

donchong.top returns a markdown version of any page when an agent requests it.

## Usage

Send an `Accept: text/markdown` header on any page URL:

```
curl -H "Accept: text/markdown" https://donchong.top/
curl -H "Accept: text/markdown" https://donchong.top/me
curl -H "Accept: text/markdown" https://donchong.top/projects/this-site
```

The response uses `Content-Type: text/markdown; charset=utf-8` and
includes an `x-markdown-tokens` header with an approximate token count.
Requests without `Accept: text/markdown` continue to receive HTML.

## Scope

Works for all content pages under the site root. Paths that already
serve non-HTML content (`/sitemap.xml`, `/robots.txt`,
`/.well-known/*`, `/api/*`) are not affected.

## Discovery

- Sitemap: <https://donchong.top/sitemap.xml>
- robots.txt: <https://donchong.top/robots.txt>
- This skill index: <https://donchong.top/.well-known/agent-skills/index.json>
