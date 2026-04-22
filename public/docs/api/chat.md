# Chat API

`POST https://donchong.top/api/chat` — streaming chat used by the
on-site assistant. Returns plain-text token deltas with
`Content-Type: text/plain; charset=utf-8` (not Server-Sent Events).

## Request body

```json
{
  "messages": [
    { "role": "user", "content": "..." }
  ],
  "detailMode": false,
  "pageMeta": {
    "title": "Home",
    "url": "https://donchong.top/"
  }
}
```

- `messages` — chronological turns. Roles are `user`, `assistant`,
  or `system`.
- `detailMode` — `false` (default) caps responses at 64 words;
  `true` raises the cap to 512.
- `pageMeta` — optional context the assistant grounds on.

## Response

The body streams plain-text deltas. The model may append a trailing
`[Error] ...` line if generation finished abnormally (empty response
or non-`stop` finish reason).

## Rate limiting

Per-IP token bucket. On exhaustion the endpoint returns `429` with
`Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and
`X-RateLimit-Reset` (Unix epoch seconds) headers. Limits are
configured via `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS` env vars.

## Tools

The model may invoke a `getRagContent` tool that performs semantic
search over the site's content (PostgreSQL + pgvector). At most four
tool calls per response.

## Discovery

- API catalog: <https://donchong.top/.well-known/api-catalog>
- OpenAPI spec: <https://donchong.top/openapi/chat.yaml>
