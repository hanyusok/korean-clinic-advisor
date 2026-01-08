import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadImage, isCloudinaryConfigured } from '@/lib/cloudinary';

/**
 * 클리닉 이미지 목록 조회
 * GET /api/clinics/[id]/images
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    const images = await prisma.clinicImage.findMany({
      where: { clinicId: params.id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ data: images });
  } catch (error) {
    console.error('Error fetching clinic images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinic images' },
      { status: 500 }
    );
  }
}

/**
 * 클리닉 이미지 업로드
 * POST /api/clinics/[id]/images
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // Cloudinary 설정 확인
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: 'Cloudinary가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 클리닉 존재 확인
    const clinic = await prisma.clinic.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // FormData 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'main';
    const order = parseInt((formData.get('order') as string) || '0');

    if (!file) {
      return NextResponse.json(
        { error: '파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP만 가능)' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '파일 크기는 10MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 파일을 Buffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Cloudinary에 업로드
    const uploadResult = await uploadImage(buffer, {
      folder: `korean-clinic-advisor/clinics/${params.id}`,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      max_file_size: maxSize,
    });

    // 데이터베이스에 이미지 정보 저장
    const clinicImage = await prisma.clinicImage.create({
      data: {
        clinicId: params.id,
        url: uploadResult.secure_url,
        type: type as 'main' | 'interior' | 'exterior',
        order,
      },
    });

    return NextResponse.json(
      {
        data: {
          ...clinicImage,
          publicId: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading clinic image:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to upload clinic image',
      },
      { status: 500 }
    );
  }
}

/**
 * 클리닉 이미지 삭제
 * DELETE /api/clinics/[id]/images?imageId={imageId}
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // Query parameter에서 imageId 추출
    const searchParams = request.nextUrl.searchParams;
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required (query parameter: imageId)' },
        { status: 400 }
      );
    }

    // 이미지 정보 조회
    const clinicImage = await prisma.clinicImage.findUnique({
      where: { id: imageId },
      select: {
        id: true,
        clinicId: true,
        url: true,
      },
    });

    if (!clinicImage) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // 클리닉 소유 확인 (필요시 추가)
    if (clinicImage.clinicId !== params.id) {
      return NextResponse.json(
        { error: 'Image does not belong to this clinic' },
        { status: 403 }
      );
    }

    // Cloudinary에서 이미지 삭제 (URL에서 public_id 추출)
    // Cloudinary URL 형식: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{format}
    if (clinicImage.url.includes('cloudinary.com')) {
      try {
        const { deleteImage } = await import('@/lib/cloudinary');
        const urlParts = clinicImage.url.split('/');
        const publicIdWithFormat = urlParts
          .slice(urlParts.indexOf('upload') + 1)
          .join('/');
        const publicId = publicIdWithFormat.split('.')[0];
        await deleteImage(publicId);
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        // Cloudinary 삭제 실패해도 DB에서 삭제는 진행
      }
    }

    // 데이터베이스에서 이미지 정보 삭제
    await prisma.clinicImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting clinic image:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete clinic image',
      },
      { status: 500 }
    );
  }
}
