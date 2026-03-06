import { WithClassName } from '../base/baseClasses'
import { ServiceResult } from '../response/response.types'

export type AspectRatioProps = {
  type: CTypeEnum
  height?: number
  width?: number
  aspect?: string
  sz?: CBaseH | CExtH // Added sz
}

/**
 * @description Cloudinary upload progress callback type
 */
export type CloudinaryUploadProps = {
  /** File to be uploaded */
  file: File
  /** Optional path/folder in Cloudinary where the file will be stored */
  path?: string
  /** Optional callback to track upload progress (0-100) */
  uploadProgress?: (progress: number) => void
}

/**
 * @description Cloudinary response type
 */
export type CloudinaryResponse = ServiceResult<{
  /** Public URL of the uploaded file */
  url: string
  /** Unique Cloudinary public ID for the file */
  publicId: string
}>

/**
 * @description Cloudinary stored file type
 */
export type CloudinaryStoredFile = {
  /** Original filename */
  name: string
  /** Complete path including folders in Cloudinary */
  fullPath?: string
  /** Public URL to access the file */
  url?: string
  /** Unique Cloudinary public ID for the file */
  publicId: string
}

export type CBaseH = 'sm' | 'md' | 'lg' | 'full'
export type CExtH = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

export enum CTypeEnum {
  Avatar = 'Avatar',
  Banner = 'Banner',
  Cover  = 'Cover',
  Image  = 'Image'
}

export enum AspectRatioEnum {
  Square = '1:1',
  Avatar = '1:1',
  Wide   = '16:9',
  Banner = '23:4',
  Cover  = '2:3',
  Event  = '4:3'
}

export enum CAspectEnum {
  '1:1'  = 'ar_1:1',
  '16:9' = 'ar_16:9',
  '23:4' = 'ar_23:4',
  '2:3'  = 'ar_2:3',
  '4:3'  = 'ar_4:3'
}

export enum CoverHEnum {
  'xs' = 'h_80',
  'sm' = 'h_160',
  'md' = 'h_320',
  'lg' = 'h_480',
  'xl' = 'h_640',
  'full' = 'h_1.0'
}

export enum AvatarHEnum {
  'xs'   = 'h_24',
  'sm'   = 'h_48',
  'md'   = 'h_72',
  'lg'   = 'h_96',
  'xl'   = 'h_144',
  'full' = 'h_1.0'
}

export enum BannerHEnum {
  'sm'   = 'h_48',
  'md'   = 'h_72',
  'lg'   = 'h_96',
  'full' = 'h_1.0'
}

export type CScale = 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100

export const _CScale: Record<CScale, string> = {
  10: 'h_0.1', // xs |sm
  20: 'h_0.2', // xs | sm
  30: 'h_0.3', // sm
  40: 'h_0.4', // md
  50: 'h_0.5', // md
  60: 'h_0.6', // md
  70: 'h_0.7', // lg
  80: 'h_0.8', // xl |lg
  90: 'h_0.9', // xl | lg
  100: 'h_1.0' //full
}

export const defaultScale = (size?: AvatarHEnum | BannerHEnum | CoverHEnum) => {
  switch (size || CoverHEnum.md) {
    case AvatarHEnum.xs:
    case CoverHEnum.xs:
      return _CScale[10]

    case AvatarHEnum.sm:
    case BannerHEnum.sm:
    case CoverHEnum.sm:
      return _CScale[30]

    case AvatarHEnum.md:
    case BannerHEnum.md:
    case CoverHEnum.md:
      return _CScale[50]

    case AvatarHEnum.lg:
    case BannerHEnum.lg:
    case CoverHEnum.lg:
      return _CScale[70]

    case AvatarHEnum.xl:
    case CoverHEnum.xl:
      return _CScale[90]

    case BannerHEnum.full:
    case AvatarHEnum.full:
    case CoverHEnum.full:
    default:
      return _CScale[100]
  }
}

export const hw = ({
  height,
  width,
  type,
  aspect: customAspect,
  sz // Added sz
}: AspectRatioProps): { height: number; width: number } => {
  // Get aspect ratio from type or custom aspect
  const aspectString = customAspect || AspectRatioEnum[type as keyof typeof AspectRatioEnum] || AspectRatioEnum.Square
  
  if (typeof aspectString !== 'string') {
    throw new Error('[Cloudinary types] hw: invalid aspect ratio string')
  }
  
  // Parse aspect ratio
  const parts = aspectString.split(':').map(Number)
  if (parts.length !== 2 || parts.some(isNaN) || parts[0] === 0 || parts[1] === 0) {
    throw new Error('[Cloudinary types] hw: invalid aspect ratio format: ' + aspectString)
  }
  
  const [aspectWidth, aspectHeight] = parts

  if (sz && type) {
    let parsedHeightValue: string | undefined;
    const szKey = sz as keyof (typeof CoverHEnum | typeof AvatarHEnum | typeof BannerHEnum);

    switch (type) {
      case CTypeEnum.Cover:
        parsedHeightValue = CoverHEnum[szKey as keyof typeof CoverHEnum];
        break;
      case CTypeEnum.Avatar:
        parsedHeightValue = AvatarHEnum[szKey as keyof typeof AvatarHEnum];
        break;
      case CTypeEnum.Banner:
        parsedHeightValue = BannerHEnum[szKey as keyof typeof BannerHEnum];
        break;
    }

    // Check if parsedHeightValue is like 'h_123' (pixel value) and not 'h_1.0' (percentage)
    if (parsedHeightValue && parsedHeightValue.startsWith('h_') && !parsedHeightValue.includes('.')) {
      const numericHeight = parseInt(parsedHeightValue.substring(2), 10);
      if (!isNaN(numericHeight) && numericHeight > 0) {
        return {
          width: Math.round(numericHeight * (aspectWidth / aspectHeight)),
          height: numericHeight
        };
      }
    }
    // If sz is 'full' (h_1.0) or doesn't yield a direct pixel height, 
    // we fall through to the logic below (explicit w/h or defaults).
  }
  
  // Fallback logic: if sz didn't provide a direct pixel height, or if sz was not provided.
  if (width && height) {
    // Both dimensions provided - return as is
    return { width, height }
  } else if (width && !height) {
    // Only width provided - calculate height
    // For width:height ratio like 2:3, if width=200, height=300
    return {
      width,
      height: Math.round(width * (aspectHeight / aspectWidth))
    }
  } else if (!width && height) {
    // Only height provided - calculate width
    // For width:height ratio like 2:3, if height=300, width=200
    return {
      width: Math.round(height * (aspectWidth / aspectHeight)),
      height
    }
  } else {
    // Neither provided - use default size based on type
    const defaultWidth = type === CTypeEnum.Cover ? 300 : 400
    return {
      width: defaultWidth,
      height: Math.round(defaultWidth * (aspectHeight / aspectWidth))
    }
  }
}

export type CImgProps = WithClassName & {
    src    : string
    type   : CTypeEnum
    aspect ?: AspectRatioEnum
    height ?: number
    width  ?: number
    sz     ?: CBaseH | CExtH
    alt    ?: string
    loading?: 'lazy' | 'eager'
    decoding?: 'async' | 'auto' | 'sync'
  }
