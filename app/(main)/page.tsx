import { HeroSection } from '@/components/home/HeroSection';
import { PopularClinics } from '@/components/home/PopularClinics';
import { RecentReviews } from '@/components/home/RecentReviews';
import { RegionClinics } from '@/components/home/RegionClinics';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <div className="container mx-auto px-4 py-8 space-y-12">
        <PopularClinics />
        <RecentReviews />
        <RegionClinics />
      </div>
    </div>
  );
}

