import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const region = searchParams.get('region') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const results: any = {
      clinics: [],
      treatments: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };

    if (type === 'all' || type === 'clinic') {
      const where: any = {
        isActive: true,
      };

      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { nameEn: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
        ];
      }

      if (region) {
        where.region = region;
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
        }),
        prisma.clinic.count({ where }),
      ]);

      results.clinics = clinics;
      results.pagination.total += total;
    }

    if (type === 'all' || type === 'treatment') {
      if (q) {
        const treatments = await prisma.treatment.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { nameEn: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 10,
        });
        results.treatments = treatments;
      }
    }

    results.pagination.totalPages = Math.ceil(results.pagination.total / limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}

