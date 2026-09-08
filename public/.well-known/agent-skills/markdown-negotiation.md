# Markdown for Agents

donchong.com returns a markdown version of any page when an agent requests it.

## Usage

Send an `Accept: text/markdown` header on any page URL:

```
curl -H "Accept: text/markdown" https://donchong.com/
curl -H "Accept: text/markdown" https://donchong.com/me
curl -H "Accept: text/markdown" https://donchong.com/projects/this-site
```

The response uses `Content-Type: text/markdown; charset=utf-8` and
includes an `x-markdown-tokens` header with an approximate token count.
Requests without `Accept: text/markdown` continue to receive HTML.

## Scope

Works for all content pages under the site root. Paths that already
serve non-HTML content (`/sitemap.xml`, `/robots.txt`,
`/.well-known/*`, `/api/*`) are not affected.

## Discovery

- Sitemap: <https://donchong.com/sitemap.xml>
- robots.txt: <https://donchong.com/robots.txt>
- This skill index: <https://donchong.com/.well-known/agent-skills/index.json>
