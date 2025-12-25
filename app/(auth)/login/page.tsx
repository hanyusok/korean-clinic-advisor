import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">로그인</h1>
        <p className="text-gray-600 text-center mb-8">
          계정에 로그인하여 리뷰를 작성하고 즐겨찾기를 저장하세요
        </p>
        <LoginForm />
      </div>
    </div>
  );
}

