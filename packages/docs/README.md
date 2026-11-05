# Documentation

The Storybook site published at
[commercelayer.github.io/commercelayer-react-components](https://commercelayer.github.io/commercelayer-react-components).

This package is private: it is never published to npm, it only builds the site.

## Running it

From the repository root:

```bash
pnpm docs:dev     # dev server on http://localhost:6006
pnpm docs:build   # static build into storybook-static/
```

`docs:build` needs the libraries built first (`pnpm build`), which is what both
`netlify.toml` and `.github/workflows/gh-pages.yaml` do.

## How it resolves the components

`.storybook/main.ts` aliases `@commercelayer/react-components` to
`packages/react-components/src/index.ts`, so the site renders the **sources**
rather than `dist/`. A change to a component shows up in the dev server without
rebuilding the library — and, by the same token, the site can show behaviour
that is not in any published version yet.

## Where things live

| Path | What |
|---|---|
| `src/stories/getting-started/` | the prose pages, as MDX |
| `src/stories/<domain>/` | component stories, CSF3 |
| `src/stories/_internals/` | helpers the stories share: the token hook, the `CommerceLayer` wrapper, the order fixture |
| `.storybook/` | config, theme, and the "View repository" toolbar addon |

Prop tables are not written by hand: `react-docgen-typescript` extracts them
from the TSDoc comments in the component sources at build time, so a prop
documented there shows up here on its own.
