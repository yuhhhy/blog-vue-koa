# 一曝十寒

A personal publishing space, built for words and quiet experiments.

[Live](https://yuhhhy.cn)

## Stack

Vue 3 · Koa · MongoDB · Three.js · Rapier

## Develop

```bash
pnpm install
pnpm start
```

## Checks

```bash
pnpm lint          # Oxlint + production dependency audit (blocks high/critical)
pnpm audit:prod    # Same dependency audit used before commits and in CI
pnpm format:check # Check formatting; legacy files may still need formatting
```

## Structure

```text
blog-client       web
blog-background   studio
blog-server       api
```

## License

GPL-3.0
