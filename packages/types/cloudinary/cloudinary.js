export var CTypeEnum;
(function (CTypeEnum) {
    CTypeEnum["Avatar"] = "Avatar";
    CTypeEnum["Banner"] = "Banner";
    CTypeEnum["Cover"] = "Cover";
    CTypeEnum["Image"] = "Image";
})(CTypeEnum || (CTypeEnum = {}));
export var AspectRatioEnum;
(function (AspectRatioEnum) {
    AspectRatioEnum["Square"] = "1:1";
    AspectRatioEnum["Avatar"] = "1:1";
    AspectRatioEnum["Wide"] = "16:9";
    AspectRatioEnum["Banner"] = "23:4";
    AspectRatioEnum["Cover"] = "2:3";
    AspectRatioEnum["Event"] = "4:3";
})(AspectRatioEnum || (AspectRatioEnum = {}));
export var CAspectEnum;
(function (CAspectEnum) {
    CAspectEnum["1:1"] = "ar_1:1";
    CAspectEnum["16:9"] = "ar_16:9";
    CAspectEnum["23:4"] = "ar_23:4";
    CAspectEnum["2:3"] = "ar_2:3";
    CAspectEnum["4:3"] = "ar_4:3";
})(CAspectEnum || (CAspectEnum = {}));
export var CoverHEnum;
(function (CoverHEnum) {
    CoverHEnum["xs"] = "h_80";
    CoverHEnum["sm"] = "h_160";
    CoverHEnum["md"] = "h_320";
    CoverHEnum["lg"] = "h_480";
    CoverHEnum["xl"] = "h_640";
    CoverHEnum["full"] = "h_1.0";
})(CoverHEnum || (CoverHEnum = {}));
export var AvatarHEnum;
(function (AvatarHEnum) {
    AvatarHEnum["xs"] = "h_24";
    AvatarHEnum["sm"] = "h_48";
    AvatarHEnum["md"] = "h_72";
    AvatarHEnum["lg"] = "h_96";
    AvatarHEnum["xl"] = "h_144";
    AvatarHEnum["full"] = "h_1.0";
})(AvatarHEnum || (AvatarHEnum = {}));
export var BannerHEnum;
(function (BannerHEnum) {
    BannerHEnum["sm"] = "h_48";
    BannerHEnum["md"] = "h_72";
    BannerHEnum["lg"] = "h_96";
    BannerHEnum["full"] = "h_1.0";
})(BannerHEnum || (BannerHEnum = {}));
export const _CScale = {
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
};
export const defaultScale = (size) => {
    switch (size || CoverHEnum.md) {
        case AvatarHEnum.xs:
        case CoverHEnum.xs:
            return _CScale[10];
        case AvatarHEnum.sm:
        case BannerHEnum.sm:
        case CoverHEnum.sm:
            return _CScale[30];
        case AvatarHEnum.md:
        case BannerHEnum.md:
        case CoverHEnum.md:
            return _CScale[50];
        case AvatarHEnum.lg:
        case BannerHEnum.lg:
        case CoverHEnum.lg:
            return _CScale[70];
        case AvatarHEnum.xl:
        case CoverHEnum.xl:
            return _CScale[90];
        case BannerHEnum.full:
        case AvatarHEnum.full:
        case CoverHEnum.full:
        default:
            return _CScale[100];
    }
};
export const hw = ({ height, width, type, aspect: customAspect, sz // Added sz
 }) => {
    // Get aspect ratio from type or custom aspect
    const aspectString = customAspect || AspectRatioEnum[type] || AspectRatioEnum.Square;
    if (typeof aspectString !== 'string') {
        throw new Error('[Cloudinary types] hw: invalid aspect ratio string');
    }
    // Parse aspect ratio
    const parts = aspectString.split(':').map(Number);
    if (parts.length !== 2 || parts.some(isNaN) || parts[0] === 0 || parts[1] === 0) {
        throw new Error('[Cloudinary types] hw: invalid aspect ratio format: ' + aspectString);
    }
    const [aspectWidth, aspectHeight] = parts;
    if (sz && type) {
        let parsedHeightValue;
        const szKey = sz;
        switch (type) {
            case CTypeEnum.Cover:
                parsedHeightValue = CoverHEnum[szKey];
                break;
            case CTypeEnum.Avatar:
                parsedHeightValue = AvatarHEnum[szKey];
                break;
            case CTypeEnum.Banner:
                parsedHeightValue = BannerHEnum[szKey];
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
        return { width, height };
    }
    else if (width && !height) {
        // Only width provided - calculate height
        // For width:height ratio like 2:3, if width=200, height=300
        return {
            width,
            height: Math.round(width * (aspectHeight / aspectWidth))
        };
    }
    else if (!width && height) {
        // Only height provided - calculate width
        // For width:height ratio like 2:3, if height=300, width=200
        return {
            width: Math.round(height * (aspectWidth / aspectHeight)),
            height
        };
    }
    else {
        // Neither provided - use default size based on type
        const defaultWidth = type === CTypeEnum.Cover ? 300 : 400;
        return {
            width: defaultWidth,
            height: Math.round(defaultWidth * (aspectHeight / aspectWidth))
        };
    }
};
