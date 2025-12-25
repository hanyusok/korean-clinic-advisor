import { ClinicList } from '@/components/clinic/ClinicList';
import { ClinicFilters } from '@/components/clinic/ClinicFilters';

export default function ClinicsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">클리닉 검색</h1>
        <p className="text-gray-600">강남 인근 피부시술 클리닉을 검색하고 비교하세요</p>
      </div>
      <div className="flex gap-8">
        <aside className="w-64 flex-shrink-0">
          <ClinicFilters />
        </aside>
        <div className="flex-1">
          <ClinicList />
        </div>
      </div>
    </div>
  );
}

