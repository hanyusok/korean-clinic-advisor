'use client';

import { REGIONS, TREATMENT_CATEGORIES, PRICE_RANGES } from '@/lib/constants';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export function ClinicFilters() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">필터</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">지역</h3>
          <div className="space-y-2">
            {REGIONS.map((region) => (
              <label key={region.value} className="flex items-center">
                <input
                  type="checkbox"
                  name="region"
                  value={region.value}
                  className="mr-2"
                />
                <span>{region.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">시술 종류</h3>
          <div className="space-y-2">
            {TREATMENT_CATEGORIES.map((category) => (
              <label key={category.value} className="flex items-center">
                <input
                  type="checkbox"
                  name="category"
                  value={category.value}
                  className="mr-2"
                />
                <span>{category.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">가격대</h3>
          <div className="space-y-2">
            {PRICE_RANGES.map((range, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  name="priceRange"
                  value={`${range.min}-${range.max}`}
                  className="mr-2"
                />
                <span>{range.label}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

