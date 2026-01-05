import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * 현재 로그인한 사용자의 계정 정보 조회
 * GET /api/users/me
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // 사용자 정보와 연결된 계정 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          select: {
            id: true,
            provider: true,
            providerAccountId: true,
            type: true,
          },
        },
        sessions: {
          select: {
            id: true,
            sessionToken: true,
            expires: true,
          },
          orderBy: {
            expires: 'desc',
          },
          take: 5, // 최근 5개 세션
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
        providerId: user.providerId,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accounts: user.accounts,
      sessions: user.sessions.map((session) => ({
        id: session.id,
        expires: session.expires,
        isActive: session.expires > new Date(),
      })),
      stats: {
        reviews: user._count.reviews,
        favorites: user._count.favorites,
      },
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 현재 로그인한 사용자의 계정 정보 수정
 * PATCH /api/users/me
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    // 수정 가능한 필드만 허용
    const updateData: {
      name?: string;
      avatar?: string | null;
    } = {};

    if (body.name !== undefined) {
      updateData.name = body.name || null;
    }

    if (body.avatar !== undefined) {
      updateData.avatar = body.avatar || null;
    }

    // 수정할 데이터가 없으면 오류 반환
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '수정할 정보가 없습니다.' },
        { status: 400 }
      );
    }

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        // image 필드도 동기화 (PrismaAdapter가 사용)
        image: updateData.avatar !== undefined ? updateData.avatar : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        image: true,
        provider: true,
        providerId: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        provider: updatedUser.provider,
        providerId: updatedUser.providerId,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
      message: '계정 정보가 성공적으로 수정되었습니다.',
    });
  } catch (error) {
    console.error('Error updating user info:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

