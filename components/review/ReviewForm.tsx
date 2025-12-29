'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Rating } from '@/components/ui/Rating';
import { X, Upload, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

// 폼 검증 스키마
const reviewSchema = z.object({
  clinicId: z.string().min(1, '클리닉을 선택해주세요'),
  treatmentId: z.string().optional(),
  rating: z.number().min(1).max(5, '평점을 선택해주세요'),
  content: z.string().min(10, '리뷰는 최소 10자 이상 작성해주세요').max(2000, '리뷰는 최대 2000자까지 작성할 수 있습니다'),
  visitDate: z.string().optional(),
  images: z.array(z.string()).max(5, '이미지는 최대 5장까지 업로드할 수 있습니다'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  clinicId?: string;
  clinicName?: string;
  treatments?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function ReviewForm({ clinicId: initialClinicId, clinicName, treatments = [], onSuccess }: ReviewFormProps) {
  const router = useRouter();
  const [selectedRating, setSelectedRating] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinics, setClinics] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedClinicId, setSelectedClinicId] = useState(initialClinicId || '');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      clinicId: initialClinicId || '',
      treatmentId: '',
      rating: 0,
      content: '',
      visitDate: '',
      images: [],
    },
  });

  const content = watch('content');

  // 클리닉 검색
  useEffect(() => {
    if (searchQuery.length > 2) {
      fetch(`/api/clinics?search=${encodeURIComponent(searchQuery)}&limit=10`)
        .then((res) => res.json())
        .then((data) => {
          setClinics(data.data || []);
        })
        .catch(console.error);
    } else {
      setClinics([]);
    }
  }, [searchQuery]);

  // 초기 클리닉 ID 설정
  useEffect(() => {
    if (initialClinicId) {
      setValue('clinicId', initialClinicId);
      setSelectedClinicId(initialClinicId);
    }
  }, [initialClinicId, setValue]);

  // 이미지 업로드 (로컬 파일을 base64로 변환)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (uploadedImages.length + files.length > 5) {
      toast.error('이미지는 최대 5장까지 업로드할 수 있습니다');
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} 파일 크기는 5MB 이하여야 합니다`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedImages((prev) => [...prev, base64String]);
        setValue('images', [...uploadedImages, base64String]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 이미지 삭제
  const handleRemoveImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setValue('images', newImages);
  };

  // 폼 제출
  const onSubmit = async (data: ReviewFormData) => {
    if (selectedRating === 0) {
      toast.error('평점을 선택해주세요');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          rating: selectedRating,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '리뷰 작성에 실패했습니다');
      }

      toast.success('리뷰가 작성되었습니다!');
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/clinics/${data.clinicId}`);
      }
    } catch (error: any) {
      toast.error(error.message || '리뷰 작성에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">리뷰 작성</h2>
        {clinicName && (
          <p className="text-gray-600">클리닉: {clinicName}</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 클리닉 선택 */}
          {!initialClinicId && (
            <div>
              <label className="block text-sm font-medium mb-2">
                클리닉 선택 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="클리닉명을 검색하세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {clinics.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {clinics.map((clinic) => (
                      <button
                        key={clinic.id}
                        type="button"
                        onClick={() => {
                          setSelectedClinicId(clinic.id);
                          setValue('clinicId', clinic.id);
                          setSearchQuery(clinic.name);
                          setClinics([]);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        {clinic.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input type="hidden" {...register('clinicId')} />
              {errors.clinicId && (
                <p className="mt-1 text-sm text-red-500">{errors.clinicId.message}</p>
              )}
            </div>
          )}

          {/* 시술 종류 선택 */}
          {treatments.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">시술 종류</label>
              <select
                {...register('treatmentId')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">선택하지 않음</option>
                {treatments.map((treatment) => (
                  <option key={treatment.id} value={treatment.id}>
                    {treatment.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 평점 선택 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              평점 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => {
                    setSelectedRating(rating);
                    setValue('rating', rating);
                  }}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      rating <= selectedRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {selectedRating > 0 && (
                <span className="ml-2 text-gray-600">{selectedRating}점</span>
              )}
            </div>
            {errors.rating && (
              <p className="mt-1 text-sm text-red-500">{errors.rating.message}</p>
            )}
          </div>

          {/* 방문 날짜 */}
          <div>
            <label className="block text-sm font-medium mb-2">방문 날짜</label>
            <input
              type="date"
              {...register('visitDate')}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* 리뷰 내용 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              리뷰 내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('content')}
              rows={6}
              placeholder="시술 경험을 공유해주세요..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <div className="flex justify-between mt-1">
              <p className="text-sm text-gray-500">
                {content?.length || 0} / 2000자
              </p>
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium mb-2">사진 업로드 (선택, 최대 5장)</label>
            <div className="flex flex-wrap gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {uploadedImages.length < 5 && (
                <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedRating === 0}
              className="flex-1"
            >
              {isSubmitting ? '작성 중...' : '리뷰 작성'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

