import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

/**
 * Cloudinary 설정 초기화 (동적 로드)
 */
function initializeCloudinary() {
  if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface UploadOptions {
  folder?: string;
  transformation?: any[];
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  allowed_formats?: string[];
  max_file_size?: number;
}

/**
 * 버퍼를 스트림으로 변환
 */
function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

/**
 * 이미지를 Cloudinary에 업로드
 * @param file - 업로드할 파일 (Buffer 또는 base64 문자열)
 * @param options - 업로드 옵션
 * @returns 업로드 결과
 */
export async function uploadImage(
  file: Buffer | string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    // Cloudinary 설정 초기화
    initializeCloudinary();
    
    const {
      folder = 'korean-clinic-advisor/clinics',
      transformation = [],
      resource_type = 'image',
      allowed_formats = ['jpg', 'jpeg', 'png', 'webp'],
      max_file_size = 10 * 1024 * 1024, // 10MB
    } = options;

    // 기본 변환 옵션 추가 (최적화)
    const defaultTransformation = [
      {
        quality: 'auto',
        fetch_format: 'auto',
      },
      ...transformation,
    ];

    const uploadOptions: any = {
      folder,
      resource_type,
      allowed_formats,
      max_file_size,
      transformation: defaultTransformation,
    };

    let result;

    if (typeof file === 'string') {
      // base64 문자열인 경우
      result = await cloudinary.uploader.upload(file, uploadOptions);
    } else {
      // Buffer인 경우 스트림으로 변환하여 업로드
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
                url: result.url,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
              });
            } else {
              reject(new Error('Upload failed: No result returned'));
            }
          }
        );

        bufferToStream(file).pipe(uploadStream);
      });
    }

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(
      error instanceof Error
        ? `Failed to upload image: ${error.message}`
        : 'Failed to upload image'
    );
  }
}

/**
 * Cloudinary에서 이미지 삭제
 * @param publicId - 삭제할 이미지의 public_id
 * @returns 삭제 결과
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    // Cloudinary 설정 초기화
    initializeCloudinary();
    
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(
      error instanceof Error
        ? `Failed to delete image: ${error.message}`
        : 'Failed to delete image'
    );
  }
}

/**
 * 이미지 URL 생성 (변환 옵션 포함)
 * @param publicId - 이미지의 public_id
 * @param transformation - 변환 옵션
 * @returns 최적화된 이미지 URL
 */
export function getImageUrl(
  publicId: string,
  transformation: any[] = []
): string {
  // Cloudinary 설정 초기화
  initializeCloudinary();
  
  const defaultTransformation = [
    {
      quality: 'auto',
      fetch_format: 'auto',
    },
    ...transformation,
  ];

  return cloudinary.url(publicId, {
    transformation: defaultTransformation,
    secure: true,
  });
}

/**
 * 썸네일 이미지 URL 생성
 * @param publicId - 이미지의 public_id
 * @param width - 너비
 * @param height - 높이
 * @param crop - 크롭 모드
 * @returns 썸네일 이미지 URL
 */
export function getThumbnailUrl(
  publicId: string,
  width: number = 400,
  height: number = 300,
  crop: string = 'fill'
): string {
  // Cloudinary 설정 초기화
  initializeCloudinary();
  
  return cloudinary.url(publicId, {
    transformation: [
      {
        width,
        height,
        crop,
        quality: 'auto',
        fetch_format: 'auto',
      },
    ],
    secure: true,
  });
}

/**
 * Cloudinary 설정 검증
 * @returns 설정이 올바른지 여부
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}
