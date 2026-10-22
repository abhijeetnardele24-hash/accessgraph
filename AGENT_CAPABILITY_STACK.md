# Shared Agent Capability Stack

This machine-wide stack is available to both Codex and Antigravity. It improves workflow discipline and tool grounding; it does not change the underlying model or guarantee frontier-model reasoning.

## Coordinating workflow

- `evidence-driven-project-execution` — converts substantial work into a completion contract, vertical slices, targeted checks, root-cause diagnosis, and evidence-backed handoff.

## Planning and execution

- `brainstorming`
- `writing-plans`
- `executing-plans`
- `requesting-code-review`
- `verification-before-completion`

## Engineering and debugging

- `systematic-debugging`
- `test-driven-development`
- `playwright-best-practices`
- `webapp-testing`
- existing `codebase-design`, `code-review`, `diagnosing-bugs`, and `tdd` in Antigravity

## Interface design

- `reference-driven-interface` — inspects a supplied website or screenshot, extracts transferable design principles, and produces an original product-specific direction.
- `frontend-design`
- `impeccable`
- `web-design-guidelines`
- `vercel-react-best-practices`
- `vercel-composition-patterns`
- existing `superdesign` and `ui-ux-master`

## Current documentation and tools

- Context7 MCP — current library documentation for Codex and Antigravity.
- Chrome DevTools MCP — browser inspection and performance work in Antigravity.
- GitKraken MCP — repository, issue, and pull-request work.

Broken inactive Antigravity MCP entries were removed: a Docker-dependent GitHub server, an unavailable local Figma bridge, an unauthenticated Supabase server, and Google Developer Knowledge without configured credentials. GitKraken continues to provide GitHub/repository tooling.

## Recommended invocation

For substantial project work:

> Use `evidence-driven-project-execution`. Research and define a completion contract, build in verified vertical slices, use the appropriate design and testing skills, query current documentation instead of guessing APIs, and do not claim completion without fresh evidence.

When a reference site is provided:

> Use `reference-driven-interface` to inspect the exact reference at desktop and mobile widths. Extract its design principles, explain what will differ, and build an original product-specific interface. Then audit it with `impeccable` and `web-design-guidelines`.

## Maintenance

Check and update shared skills periodically with:

```powershell
npx skills check
npx skills update -g -y
```

Restart or reload Codex and Antigravity after installing skills or changing MCP configuration so new capabilities are discovered.
