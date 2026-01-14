'use client';

import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/search/SearchBar';
import { REGIONS } from '@/lib/constants';

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="bg-gradient-to-r from-primary to-secondary text-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            강남 인근 피부시술 클리닉을 찾아보세요
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-white/90 px-2">
            후기, 가격, 위치 정보를 한눈에 비교하고 최적의 클리닉을 선택하세요
          </p>
          
          <div className="mb-6 md:mb-8">
            <SearchBar />
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {REGIONS.slice(0, 4).map((region) => (
              <button
                key={region.value}
                onClick={() => router.push(`/clinics?region=${region.value}`)}
                className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-white/20 hover:bg-white/30 rounded-md transition-colors"
              >
                {region.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

