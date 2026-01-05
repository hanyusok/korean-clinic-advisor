'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Mail, Calendar, Shield, Link as LinkIcon, LogOut, Edit2 } from 'lucide-react';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';
import { AccountEditForm } from './AccountEditForm';

interface AccountData {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    provider: string | null;
    providerId: string | null;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  accounts: Array<{
    id: string;
    provider: string;
    providerAccountId: string;
    type: string;
  }>;
  sessions: Array<{
    id: string;
    expires: string;
    isActive: boolean;
  }>;
  stats: {
    reviews: number;
    favorites: number;
  };
}

export function AccountInfo() {
  const { data: session, status } = useSession();
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAccountInfo();
    }
  }, [status]);

  const fetchAccountInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/me');
      if (!response.ok) {
        throw new Error('계정 정보를 불러올 수 없습니다.');
      }
      const data = await response.json();
      setAccountData(data);
    } catch (error) {
      console.error('Error fetching account info:', error);
      toast.error('계정 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' });
      toast.success('로그아웃되었습니다.');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    fetchAccountInfo(); // 계정 정보 다시 불러오기
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!accountData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600">계정 정보를 불러올 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  const { user, accounts, sessions, stats } = accountData;

  // 수정 모드일 때 수정 폼 표시
  if (isEditing) {
    return (
      <AccountEditForm
        initialData={{
          name: user.name,
          avatar: user.avatar,
        }}
        onCancel={() => setIsEditing(false)}
        onSuccess={handleEditSuccess}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 사용자 기본 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              기본 정보
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              수정
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <div className="relative w-20 h-20 rounded-full overflow-hidden">
                <img
                  src={user.avatar}
                  alt={user.name || 'User'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 이미지 로드 실패 시 fallback
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div className="avatar-fallback absolute inset-0 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center" style={{ display: 'none' }}>
                  <User className="w-10 h-10 text-primary" />
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-semibold">{user.name || '이름 없음'}</h2>
              <p className="text-gray-600 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">역할:</span>
              <span className="font-medium">{user.role === 'admin' ? '관리자' : '사용자'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">가입일:</span>
              <span className="font-medium">
                {new Date(user.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OAuth 계정 연결 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            연결된 계정
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length > 0 ? (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {account.provider === 'google' ? '🔵 Google' : '🟡 Kakao'}
                      </span>
                      <span className="text-sm text-gray-500">({account.type})</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Provider Account ID: {account.providerAccountId}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    연결됨
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">연결된 OAuth 계정이 없습니다.</p>
          )}

          {/* 사용자 모델의 Provider 정보 */}
          {user.provider && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>주 로그인 Provider:</strong> {user.provider}
              </p>
              {user.providerId && (
                <p className="text-sm text-gray-600 mt-1">
                  Provider ID: {user.providerId}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 활동 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>활동 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.reviews}</div>
              <div className="text-sm text-gray-600 mt-1">작성한 리뷰</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.favorites}</div>
              <div className="text-sm text-gray-600 mt-1">즐겨찾기</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 세션 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>활성 세션</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="text-sm">
                      세션 ID: {session.id.substring(0, 8)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      만료일: {new Date(session.expires).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      session.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {session.isActive ? '활성' : '만료됨'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">세션 정보가 없습니다.</p>
          )}
        </CardContent>
      </Card>

      {/* 로그아웃 버튼 */}
      <div className="flex justify-end">
        <Button onClick={handleSignOut} variant="outline" className="flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          로그아웃
        </Button>
      </div>
    </div>
  );
}

