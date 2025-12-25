import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';

export function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-primary">
            Korean Clinic Advisor
          </Link>
          
          <div className="flex-1 max-w-2xl mx-8">
            <SearchBar />
          </div>

          <nav className="flex items-center gap-4">
            <Link
              href="/clinics"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              클리닉
            </Link>
            <Link
              href="/login"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              로그인
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

