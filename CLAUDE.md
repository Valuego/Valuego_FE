# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**Valuego** — Valuego frontend repository.

초기 세팅은 Sossbar-4th-Client의 툴링·폴더 구조·컨벤션을 기반으로 구성했습니다.

---

## Commands

```bash
pnpm dev        # Start dev server (Next.js)
pnpm build      # Production build
pnpm lint       # Run ESLint
pnpm format     # Run Prettier on entire codebase
```

No test suite is configured yet.

## Architecture

**Stack**: Next.js 16 App Router, React 19, TypeScript 5 (strict), Tailwind CSS 4, TanStack Query v5, CVA

**Domain-based folder structure** — full rules in `.claude/references/folder-architecture.md`:

```
app/          # Routing layer ONLY — pages delegate to features/
features/     # One folder per domain ([domain].api.ts, [domain].hooks.ts, [domain].types.ts, components/)
shared/       # Cross-domain reusables — promote here only at 2nd actual reuse
styles/       # Design system CSS
```

> **REQUIRED — 코드 작업 전 반드시 읽어라:**
>
> - `.claude/references/folder-architecture.md` — 파일 위치·네이밍·도메인 레이어·import 방향 전체 규칙

**Path alias**: `@/*` maps to the project root.

## Design System

Three-layer CSS in `styles/`: `primitive-color.css` → `semantic-color.css` → `typography.css`.

- **Variants**: Use CVA (`class-variance-authority`). See `shared/components/button` for the pattern.
- **Class merging**: Always use `cn()` from `shared/lib/cn.ts`. Never use `clsx` or `twMerge` directly.

## Code Conventions

Enforced by ESLint + Prettier — violations fail CI:

- **No default exports** except Next.js page/layout/error files
- **Arrow functions** for all React components
- **Type imports** must use `import type { ... }`
- **No `any`**, **No `console`**
- Import order: builtin → external → internal → type → index → unknown (alphabetical within groups)
- Prettier: single quotes, semicolons, trailing commas, 120-char print width

## Commits

Conventional Commits. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`, `ci`, `design`. Max 72 chars, no trailing period. Enforced by commitlint + Husky.

## 이슈 & PR 워크플로우

**모든 작업은 이슈 → 브랜치 → PR 순서를 따른다.**

### 이슈 생성

반드시 `.github/ISSUE_TEMPLATE/` 템플릿 중 가장 적절한 것을 선택한다.

| 템플릿                | 사용 시점                                 |
| --------------------- | ----------------------------------------- |
| `feature_request.yml` | 새 기능, 새 페이지, 신규 도구/인프라 추가 |
| `enhancement.yml`     | 기존 기능 개선, 성능 향상                 |
| `refactor.yml`        | 코드 구조 개선, 기술 부채 해소            |
| `hotfix.yml`          | 프로덕션 긴급 버그 수정                   |

### 브랜치 생성

이슈 번호를 포함한 브랜치명으로 git flow를 사용한다.

```bash
git checkout develop
git pull
git checkout -b feature/<issue-number>-<short-description>
```

### PR

`.github/pull_request_template.md` 체크리스트를 채운다. CI(lint + build) 통과 후 머지한다.
