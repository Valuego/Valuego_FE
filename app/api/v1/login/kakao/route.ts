import { handleKakaoOAuthCallback } from '@/features/auth/auth.kakao-callback';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = handleKakaoOAuthCallback;
