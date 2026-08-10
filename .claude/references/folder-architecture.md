---
name: folder-architecture
description: 'MUST READ before any file creation or feature work. 파일 위치·네이밍·도메인 레이어·import 방향 모든 규칙이 여기에 있다. 새 페이지·컴포넌트·훅·API를 추가하거나 도메인 간 참조를 결정할 때 이 파일을 읽지 않으면 규칙 위반이 발생한다.'
---

# Folder Architecture

## 전체 구조

```
app/           # 라우팅 레이어 — 비즈니스 로직 없음
features/      # 도메인별 모든 기능
shared/        # 2개 이상 도메인이 실제로 쓰는 코드만
styles/        # 디자인 시스템 CSS
mocks/         # MSW handlers
```

---

## app/ — 라우팅만

`app/`은 라우트 정의와 feature 컴포넌트 조합만 한다. 비즈니스 로직, 데이터 페칭, 상태관리는 전부 `features/`로.

```tsx
// ❌ app/에 로직
export default async function ProfilePage({ params }) {
  const profile = await fetchProfile(params.userId); // 여기 있으면 안 됨
  return <div>{profile.name}</div>;
}

// ✅ app/은 조합만
import { ProfileSection } from '@/features/profile';
export default function ProfilePage({ params }) {
  return <ProfileSection userId={params.userId} />;
}
```

**`app/` 안에 컴포넌트 파일을 만들지 않는다.** `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts` 외의 파일은 `features/`로.

---

## features/ — 도메인 구조

### 표준 구조

```
features/[domain]/
  index.ts                    # 외부 공개 심볼만 re-export (필수)
  [domain].api.ts             # fetcher + query-key + queryOptions 통합
  [domain].hooks.ts           # useQuery / useMutation 훅
  [domain].types.ts           # TypeScript 타입 + Zod infer 타입
  [domain].schemas.ts         # Zod 스키마
  [domain].constants.ts       # 도메인 상수 (필요 시)
  [domain].lib.ts             # 도메인 전용 순수 유틸 (필요 시)
  components/
    [component].tsx
```

### 파일 위치 결정표

| 파일 유형                                         | 위치                    |
| ------------------------------------------------- | ----------------------- |
| fetcher + query-key + queryOptions + mutation API | `[domain].api.ts`       |
| useQuery / useSuspenseQuery / useMutation 훅      | `[domain].hooks.ts`     |
| UI 상태 훅                                        | `[domain].hooks.ts`     |
| React 컴포넌트                                    | `components/[name].tsx` |
| TypeScript 타입, Zod infer                        | `[domain].types.ts`     |
| Zod 스키마                                        | `[domain].schemas.ts`   |
| 상수                                              | `[domain].constants.ts` |
| 순수 유틸 함수                                    | `[domain].lib.ts`       |

도메인이 이미 경계다. 도메인 내에서 create/update 등으로 파일을 미리 나누지 않는다. 파일이 실제로 커졌을 때 나눈다.

---

## 도메인 간 참조 규칙

### 의존 방향 (단방향)

"A 없이 B가 존재할 수 있는가?"로 판단한다. 더 독립적인 쪽이 상위 레이어(낮은 번호)다.

- **하위 레이어 → 상위 레이어 참조 금지**
- **같은 레이어끼리 cross-import 금지**
- cross-import가 필요해 보이면 **shared/로 올리거나 설계를 재검토**한다

### 참조 방법

다른 도메인을 참조할 때는 반드시 `index.ts`를 통해서만.

```ts
// ❌ 도메인 내부 직접 참조
import { useProfile } from '@/features/profile/profile.hooks';

// ✅ index.ts 경유
import { useProfile } from '@/features/profile';
```

---

## shared/ — 실제 재사용만

`shared/`에 올리는 기준은 **2개 이상 도메인에서 실제로 쓰인 뒤**다.

- 예상 재사용만으로 shared에 두지 않는다 (YAGNI)
- UI 프리미티브(Button, Input 등), `cn`, `apiRequest`, QueryProvider처럼 인프라성 코드는 처음부터 shared에 둔다

```
shared/
  components/   # UI 프리미티브
  lib/          # cn, api client, get-query-client 등
  providers/    # QueryProvider, MswProvider 등
  assets/       # 아이콘 등
  hooks/        # 교차 도메인 훅
  constants/    # 전역 상수
```

---

## styles/ — 디자인 시스템

```
styles/
  globals.css
  primitive-color.css
  semantic-color.css
  primitive-spacing.css
  typography.css
```

클래스 병합은 항상 `cn()`을 사용한다.

---

## Path alias

`@/*` → 프로젝트 루트

```ts
import { Button } from '@/shared/components/button';
import { apiRequest } from '@/shared/lib/api';
```
