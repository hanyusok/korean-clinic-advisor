import { LoginForm } from '@/components/auth/LoginForm';

interface LoginPageProps {
  searchParams: { error?: string; callbackUrl?: string };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const error = searchParams.error;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">로그인</h1>
        <p className="text-gray-600 text-center mb-8">
          계정에 로그인하여 리뷰를 작성하고 즐겨찾기를 저장하세요
        </p>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              {error === 'OAuthAccountNotLinked'
                ? '이 이메일 주소로 이미 다른 방법으로 가입된 계정이 있습니다. 기존 로그인 방법을 사용해주세요.'
                : error === 'OAuthCallback'
                ? 'Kakao 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. (요청 속도 제한 초과일 수 있습니다)'
                : error === 'OAuthCreateAccount'
                ? '계정 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
                : '로그인 중 오류가 발생했습니다. 다시 시도해주세요.'}
            </p>
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  );
}

