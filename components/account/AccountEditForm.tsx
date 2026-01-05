'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { User, X } from 'lucide-react';
import toast from 'react-hot-toast';

// 폼 검증 스키마
const accountEditSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(50, '이름은 최대 50자까지 입력할 수 있습니다'),
  avatar: z.string().url('올바른 URL 형식을 입력해주세요').optional().or(z.literal('')),
});

type AccountEditFormData = z.infer<typeof accountEditSchema>;

interface AccountEditFormProps {
  initialData: {
    name: string | null;
    avatar: string | null;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

export function AccountEditForm({ initialData, onCancel, onSuccess }: AccountEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AccountEditFormData>({
    resolver: zodResolver(accountEditSchema),
    defaultValues: {
      name: initialData.name || '',
      avatar: initialData.avatar || '',
    },
  });

  const avatarUrl = watch('avatar');

  const onSubmit = async (data: AccountEditFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name || null,
          avatar: data.avatar || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '계정 정보 수정에 실패했습니다.');
      }

      toast.success('계정 정보가 성공적으로 수정되었습니다.');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating account:', error);
      toast.error(error.message || '계정 정보 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          계정 정보 수정
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 프로필 이미지 미리보기 */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="프로필 미리보기"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.avatar-preview-fallback');
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div className={`avatar-preview-fallback absolute inset-0 w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center ${avatarUrl ? 'hidden' : 'flex'}`}>
                <User className="w-12 h-12 text-primary" />
              </div>
            </div>
          </div>

          {/* 이름 입력 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              이름
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="이름을 입력해주세요"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* 프로필 이미지 URL 입력 */}
          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
              프로필 이미지 URL
            </label>
            <input
              id="avatar"
              type="url"
              {...register('avatar')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            {errors.avatar && (
              <p className="mt-1 text-sm text-red-600">{errors.avatar.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              프로필 이미지 URL을 입력하거나 비워두면 기본 이미지가 표시됩니다.
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  수정 중...
                </>
              ) : (
                '수정 완료'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

