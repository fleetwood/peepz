import type { ImgHTMLAttributes } from "react"

import Image from "next/image"

import logo32 from "@peeps/ui/assets/logo_32.png"
import logo64 from "@peeps/ui/assets/logo_64.png"
import logo128 from "@peeps/ui/assets/logo_128.png"
import logo256 from "@peeps/ui/assets/logo_256.png"
import logo512 from "@peeps/ui/assets/logo_512.png"
import logo1030 from "@peeps/ui/assets/logo_1030.png"

type PeepsLogoProps = ImgHTMLAttributes<HTMLImageElement> & {
    s32  ?: boolean
    s64  ?: boolean
    s128 ?: boolean
    s256 ?: boolean
    s512 ?: boolean
    s1024?: boolean
}

const PeepsLogo = (props:PeepsLogoProps) => {
    const { s32, s64, s128, s256, s512, s1024, alt, height, width, ...imgProps } = props

    const size =
        (s1024 ? 1024 : undefined) ??
        (s512 ? 512 : undefined) ??
        (s256 ? 256 : undefined) ??
        (s128 ? 128 : undefined) ??
        (s64 ? 64 : undefined) ??
        (s32 ? 32 : undefined)

    const src =
        size === 1024 ? logo1030 :
        size === 512  ? logo512  :
        size === 256  ? logo256  :
        size === 128  ? logo128  :
        size === 64   ? logo64   :
        size === 32   ? logo32   :
        logo128

    const resolvedSize = size ?? 128

    return (
        <Image
            src={src}
            alt={alt ?? "Peeps Logo"}
            width={(typeof width === 'number' ? width : resolvedSize)}
            height={(typeof height === 'number' ? height : resolvedSize)}
            {...imgProps}
        />
    )
}

PeepsLogo.displayName = "PeepsLogo"
export default PeepsLogo