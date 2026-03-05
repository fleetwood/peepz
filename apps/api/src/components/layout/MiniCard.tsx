import * as React from "react"
import { WithChildren } from "@peeps/types"
import { Button, ButtonProps } from "../ui/button"
import { cn } from "@peeps/utils/classnames"

type MiniCardProps = WithChildren

type MiniCardSlots = {
  icon   ?: React.ReactElement<typeof MiniCardIcon>
  content?: React.ReactElement<typeof MiniCardContent>
  cta    ?: React.ReactElement<typeof MiniCardCta>
}

const MiniCard = ({ children }: MiniCardProps) => {
  const { icon, content, cta } = React.Children.toArray(children).reduce<MiniCardSlots>((acc, child) => {
    if (!React.isValidElement(child)) return acc

    if (child.type === MiniCardIcon) {
      acc.icon = child as React.ReactElement<typeof MiniCardIcon>
    } else if (child.type === MiniCardContent) {
      acc.content = child as React.ReactElement<typeof MiniCardContent>
    } else if (child.type === MiniCardCta) {
      acc.cta = child as React.ReactElement<typeof MiniCardCta>
    }

    return acc
  }, {})

  if (!content) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn("MiniCard requires a MiniCardContent child.")
    }
    return null
  }

  return (
    <div className="w-full border-2 border-dashed rounded-lg p-4 flex items-center justify-between gap-3">
      {icon}
      {content}
      {cta}
    </div>
  )
}

type MiniCardIconProps = {
  icon?: React.ReactNode
}

const MiniCardIcon = ({ icon }: MiniCardIconProps) => {
  if (!icon) return null
  return <div>{icon}</div>
}

const MiniCardContent = ({ children }: WithChildren) => {
  return <div>{children}</div>
}

type MiniCardCtaProps = ButtonProps & {
  icon   : React.ReactNode
  label ?: string
}

const MiniCardCta = ({ icon, label, ...props }: MiniCardCtaProps) => {
  return (
    <Button {...props}>
      {icon}
      {label && <span>{label}</span>}
    </Button>
  )
}

MiniCard.displayName        = "MiniCard"
MiniCardIcon.displayName    = "MiniCard.Icon"
MiniCardContent.displayName = "MiniCard.Content"
MiniCardCta.displayName     = "MiniCard.Cta"

export { MiniCardIcon, MiniCardContent, MiniCardCta }
export default MiniCard