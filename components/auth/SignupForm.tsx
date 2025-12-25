'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';

export function SignupForm() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoSignup = async () => {
    setLoading(true);
    try {
      await signIn('kakao', { callbackUrl: '/' });
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            Google로 회원가입
          </Button>
          <Button
            onClick={handleKakaoSignup}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            Kakao로 회원가입
          </Button>
          
          <div className="text-center text-sm text-gray-600 mt-4">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-primary hover:underline">
              로그인
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

