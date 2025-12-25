'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setLoading(true);
    try {
      await signIn('kakao', { callbackUrl: '/' });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            Google로 로그인
          </Button>
          <Button
            onClick={handleKakaoLogin}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            Kakao로 로그인
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

