# Valuego FE

Next.js 16 + TypeScript + pnpm 기반의 Valuego 프론트엔드 프로젝트입니다.  
코드 품질은 **ESLint/Prettier + Husky + GitHub Actions + Git Flow**로 관리합니다.

> 초기 세팅은 [Sossbar-4th-Client](https://github.com/JECT-Study/Sossbar-4th-Client) 레포의 툴링·폴더 구조·컨벤션을 참고했습니다.

## 전체 흐름 (Big Picture)

```text
로컬 개발
  ├─ ESLint + Prettier (저장/수동 실행)
  ├─ Husky pre-commit (lint-staged)
  ├─ Husky commit-msg (commitlint)
  └─ Git Flow 브랜치 (feature / release / hotfix)
        └─ GitHub PR  →  GitHub Actions CI (lint + build)  →  main 태그 → 배포
```

자세한 규칙은 다음 문서를 참고해주세요.

- 코드 스타일 & 설계: `docs/coding-convention.md`
- 커밋 메시지 규칙: `docs/commit-convention.md`
- 브랜치 전략 & PR 플로우: `docs/workflow-and-gitflow.md`
- 폴더 아키텍처: `.claude/references/folder-architecture.md`

## 개발 서버 실행

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

브라우저에서 `http://localhost:3000`을 열어 결과를 확인할 수 있습니다.

## 환경 변수

| 변수                             | 설명                                      |
| -------------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`       | 백엔드 API 베이스 URL (끝 `/` 없이)       |
| `NEXT_PUBLIC_API_ORIGIN`         | API origin (CORS/절대 URL용)              |
| `NEXT_PUBLIC_SITE_URL`           | 사이트 URL (metadataBase 등)              |
| `NEXT_PUBLIC_KAKAO_CLIENT_ID`    | 카카오 OAuth 앱 REST API 키               |
| `NEXT_PUBLIC_KAKAO_REDIRECT_URI` | 카카오 콜백 URL (`/login/kakao/callback`) |
| `NEXT_PUBLIC_MSW`                | `true`면 MSW mock 사용 (handlers 추가 후) |

`/api/v1/*` 요청은 `next.config.ts` rewrite로 백엔드로 프록시됩니다.

## 폴더 구조

```text
app/        # 라우팅 레이어만 (page/layout/error)
features/   # 도메인별 기능
shared/     # 교차 도메인 재사용 코드
styles/     # 디자인 시스템 CSS
mocks/      # MSW handlers
docs/       # 컨벤션 문서
```

## 스크립트

```bash
pnpm dev      # 개발 서버
pnpm build    # 프로덕션 빌드
pnpm lint     # ESLint
pnpm format   # Prettier
```
