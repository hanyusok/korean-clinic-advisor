'use client';

import { useEffect, useState } from 'react';
import { ReviewWithUser } from '@/types';
import { Rating } from '@/components/ui/Rating';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';

export function RecentReviews() {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // 최신 리뷰를 가져오는 API 호출 (실제 구현 필요)
        // 임시로 빈 배열 반환
        setReviews([]);
      } catch (error) {
        console.error('Error fetching recent reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return null;
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">최신 리뷰</h2>
        <Link href="/reviews" className="text-primary hover:underline">
          전체 보기 →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.slice(0, 6).map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{review.user.name || '익명'}</span>
                <Rating rating={review.rating} size="sm" />
              </div>
              <p className="text-gray-700 text-sm line-clamp-3">{review.content}</p>
              <span className="text-xs text-gray-500 mt-2 block">
                {new Date(review.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

