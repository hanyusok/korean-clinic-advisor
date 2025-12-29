'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { SearchBar } from '@/components/search/SearchBar';
import { Button } from '@/components/ui/Button';
import { User, LogOut } from 'lucide-react';

export function Header() {
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

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
            
            {status === 'loading' ? (
              <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/account"
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <span className="hidden md:inline">
                    {session.user?.name || session.user?.email}
                  </span>
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">로그아웃</span>
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  로그인
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

