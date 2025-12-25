'use client';

import { REGIONS } from '@/lib/constants';
import { useRouter } from 'next/navigation';

export function RegionClinics() {
  const router = useRouter();

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">지역별 클리닉</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {REGIONS.map((region) => (
          <button
            key={region.value}
            onClick={() => router.push(`/clinics?region=${region.value}`)}
            className="p-6 border rounded-lg hover:border-primary hover:shadow-md transition-all text-center"
          >
            <h3 className="font-semibold text-lg mb-1">{region.label}</h3>
            <p className="text-sm text-gray-600">{region.labelEn}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

