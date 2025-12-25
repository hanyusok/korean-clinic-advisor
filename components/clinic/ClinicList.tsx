'use client';

import { useEffect, useState } from 'react';
import { ClinicCard } from './ClinicCard';
import { ClinicWithRelations } from '@/types';

export function ClinicList() {
  const [clinics, setClinics] = useState<ClinicWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await fetch('/api/clinics');
        const data = await response.json();
        setClinics(data.data || []);
      } catch (error) {
        console.error('Error fetching clinics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  if (clinics.length === 0) {
    return <div className="text-center py-12">클리닉이 없습니다.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clinics.map((clinic) => (
        <ClinicCard key={clinic.id} clinic={clinic} />
      ))}
    </div>
  );
}

