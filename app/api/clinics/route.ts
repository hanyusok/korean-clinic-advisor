import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SearchFilters } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const filters: SearchFilters = {
      region: searchParams.get('region') || undefined,
      treatmentId: searchParams.get('treatmentId') || undefined,
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
      sort: (searchParams.get('sort') as any) || 'rating',
      search: searchParams.get('search') || undefined,
    };

    const where: any = {
      isActive: true,
    };

    if (filters.region) {
      where.region = filters.region;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { nameEn: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [clinics, total] = await Promise.all([
      prisma.clinic.findMany({
        where,
        include: {
          images: {
            where: { type: 'main' },
            take: 1,
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: getOrderBy(filters.sort),
      }),
      prisma.clinic.count({ where }),
    ]);

    return NextResponse.json({
      data: clinics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching clinics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinics' },
      { status: 500 }
    );
  }
}

function getOrderBy(sort?: string): any {
  switch (sort) {
    case 'rating':
      return { reviews: { _count: 'desc' as const } };
    case 'reviews':
      return { reviews: { _count: 'desc' as const } };
    case 'price-low':
      return { createdAt: 'desc' as const }; // Simplified for now
    case 'price-high':
      return { createdAt: 'desc' as const }; // Simplified for now
    case 'newest':
      return { createdAt: 'desc' as const };
    default:
      return { reviews: { _count: 'desc' as const } };
  }
}

