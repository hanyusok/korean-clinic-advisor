import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clinicId = searchParams.get('clinicId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinicId is required' },
        { status: 400 }
      );
    }

    const where: any = {
      clinicId,
      isActive: true,
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: true,
          treatment: true,
          images: true,
          _count: {
            select: {
              helpfulUsers: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { clinicId, treatmentId, rating, content, visitDate, images } = body;

    const review = await prisma.review.create({
      data: {
        userId: (session.user as any).id,
        clinicId,
        treatmentId: treatmentId || null,
        rating,
        content,
        visitDate: visitDate ? new Date(visitDate) : null,
        images: {
          create: images?.map((url: string, index: number) => ({
            url,
            order: index,
          })) || [],
        },
      },
      include: {
        user: true,
        treatment: true,
        images: true,
      },
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

