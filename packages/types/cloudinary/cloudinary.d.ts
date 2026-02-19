import { WithClassName } from '../base/baseClasses';
import { ImgHTMLAttributes } from 'react';
import { ServiceResult } from '../response/response.types';
export type AspectRatioProps = {
    type: CTypeEnum;
    height?: number;
    width?: number;
    aspect?: string;
    sz?: CBaseH | CExtH;
};
/**
 * @description Cloudinary upload progress callback type
 */
export type CloudinaryUploadProps = {
    /** File to be uploaded */
    file: File;
    /** Optional path/folder in Cloudinary where the file will be stored */
    path?: string;
    /** Optional callback to track upload progress (0-100) */
    uploadProgress?: (progress: number) => void;
};
/**
 * @description Cloudinary response type
 */
export type CloudinaryResponse = ServiceResult<{
    /** Public URL of the uploaded file */
    url: string;
    /** Unique Cloudinary public ID for the file */
    publicId: string;
}>;
/**
 * @description Cloudinary stored file type
 */
export type CloudinaryStoredFile = {
    /** Original filename */
    name: string;
    /** Complete path including folders in Cloudinary */
    fullPath?: string;
    /** Public URL to access the file */
    url?: string;
    /** Unique Cloudinary public ID for the file */
    publicId: string;
};
export type CBaseH = 'sm' | 'md' | 'lg' | 'full';
export type CExtH = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export declare enum CTypeEnum {
    Avatar = "Avatar",
    Banner = "Banner",
    Cover = "Cover",
    Image = "Image"
}
export declare enum AspectRatioEnum {
    Square = "1:1",
    Avatar = "1:1",
    Wide = "16:9",
    Banner = "23:4",
    Cover = "2:3",
    Event = "4:3"
}
export declare enum CAspectEnum {
    '1:1' = "ar_1:1",
    '16:9' = "ar_16:9",
    '23:4' = "ar_23:4",
    '2:3' = "ar_2:3",
    '4:3' = "ar_4:3"
}
export declare enum CoverHEnum {
    'xs' = "h_80",
    'sm' = "h_160",
    'md' = "h_320",
    'lg' = "h_480",
    'xl' = "h_640",
    'full' = "h_1.0"
}
export declare enum AvatarHEnum {
    'xs' = "h_24",
    'sm' = "h_48",
    'md' = "h_72",
    'lg' = "h_96",
    'xl' = "h_144",
    'full' = "h_1.0"
}
export declare enum BannerHEnum {
    'sm' = "h_48",
    'md' = "h_72",
    'lg' = "h_96",
    'full' = "h_1.0"
}
export type CScale = 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100;
export declare const _CScale: Record<CScale, string>;
export declare const defaultScale: (size?: AvatarHEnum | BannerHEnum | CoverHEnum) => string;
export declare const hw: ({ height, width, type, aspect: customAspect, sz }: AspectRatioProps) => {
    height: number;
    width: number;
};
export type CImgProps = ImgHTMLAttributes<HTMLImageElement> & WithClassName & {
    src: string;
    type: CTypeEnum;
    aspect?: AspectRatioEnum;
    height?: number;
    width?: number;
    sz?: CBaseH | CExtH;
};
//# sourceMappingURL=cloudinary.d.ts.map