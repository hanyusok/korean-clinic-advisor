import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">회원가입</h1>
        <p className="text-gray-600 text-center mb-8">
          새 계정을 만들어 클리닉 리뷰를 작성하세요
        </p>
        <SignupForm />
      </div>
    </div>
  );
}

