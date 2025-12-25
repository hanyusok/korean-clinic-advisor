import { SearchResults } from '@/components/search/SearchResults';

interface SearchPageProps {
  searchParams: {
    q?: string;
    type?: string;
    region?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">검색 결과</h1>
        {searchParams.q && (
          <p className="text-gray-600">
            &quot;{searchParams.q}&quot;에 대한 검색 결과
          </p>
        )}
      </div>
      <SearchResults searchParams={searchParams} />
    </div>
  );
}

