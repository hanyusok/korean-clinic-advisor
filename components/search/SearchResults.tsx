'use client';

import { useEffect, useState } from 'react';
import { ClinicCard } from '@/components/clinic/ClinicCard';
import { ClinicWithRelations } from '@/types';

interface SearchResultsProps {
  searchParams: {
    q?: string;
    type?: string;
    region?: string;
  };
}

export function SearchResults({ searchParams }: SearchResultsProps) {
  const [results, setResults] = useState<{
    clinics: ClinicWithRelations[];
    treatments: any[];
    pagination: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchParams.q) params.append('q', searchParams.q);
        if (searchParams.type) params.append('type', searchParams.type);
        if (searchParams.region) params.append('region', searchParams.region);

        const response = await fetch(`/api/search?${params.toString()}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  if (loading) {
    return <div className="text-center py-12">검색 중...</div>;
  }

  if (!results) {
    return <div className="text-center py-12">검색 결과를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="space-y-8">
      {results.clinics.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">클리닉 ({results.clinics.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.clinics.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </div>
        </section>
      )}

      {results.clinics.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

