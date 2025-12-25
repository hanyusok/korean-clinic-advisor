'use client';

import { useEffect, useState } from 'react';
import { ClinicCard } from '@/components/clinic/ClinicCard';
import { ClinicWithRelations } from '@/types';
import Link from 'next/link';

export function PopularClinics() {
  const [clinics, setClinics] = useState<ClinicWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await fetch('/api/clinics?sort=rating&limit=10');
        const data = await response.json();
        setClinics(data.data || []);
      } catch (error) {
        console.error('Error fetching popular clinics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">인기 클리닉</h2>
        <Link href="/clinics" className="text-primary hover:underline">
          전체 보기 →
        </Link>
      </div>
      {loading ? (
        <div className="text-center py-12">로딩 중...</div>
      ) : clinics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clinics.map((clinic) => (
            <ClinicCard key={clinic.id} clinic={clinic} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-600">클리닉이 없습니다.</div>
      )}
    </section>
  );
}

