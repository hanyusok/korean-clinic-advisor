import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Korean Clinic Advisor</h3>
            <p className="text-gray-600 text-sm">
              강남 인근 피부시술 클리닉을 검색하고 비교하세요
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/clinics" className="text-gray-600 hover:text-primary">
                  클리닉 검색
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-600 hover:text-primary">
                  통합 검색
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">정보</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-primary">
                  서비스 소개
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">법적 고지</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-primary">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-primary">
                  이용약관
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          <p>&copy; 2024 Korean Clinic Advisor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

