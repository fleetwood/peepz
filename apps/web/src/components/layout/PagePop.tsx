"use client"

import { useLayout } from "@/context/LayoutProvider"
import type { PagePopoverProps } from "@peeps/types"
import {
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react"
import { Popover, PopoverAnchor, PopoverContent } from "../ui/popover"

type PeepsPopTriggerProps = {
  children: ReactElement
}

type PeepsPopContentProps = {
  children: ReactNode
}

type PeepsPopComponent = React.FC<PeepsPopRootProps> & {
  Trigger: typeof PeepsPopTrigger
  Content: typeof PeepsPopContent
}

type PeepsPopMode = "click" | "hover"

type PeepsPopRootProps = {
  title   ?: PagePopoverProps["title"]
  side    ?: PagePopoverProps["side"]
  align   ?: PagePopoverProps["align"]
  mode    ?: PeepsPopMode
  children: ReactNode
}

type PeepsPopContextValue = {
  registerContent: (node: ReactNode) => void
  showPopover    : (rect: DOMRect) => void
  closePopover   : () => void
  mode           : PeepsPopMode
}

const PagePopover = () => {
  const { popover, closePopover } = useLayout()

  if (!popover) return null

  const { anchor, title, side = "bottom", align = "center", children } = popover

  return (
    <Popover open onOpenChange={(open) => !open && closePopover()}>
      <PopoverAnchor asChild>
        <span
          style={{
            ...anchor,
            position     : "fixed",
            pointerEvents: "none",
          }}
        />
      </PopoverAnchor>
      <PopoverContent side={side} align={align} className="max-w-xs">
        <div className="flex flex-col gap-2 text-sm bg-background text-foreground break-words">
          {title && <div className="font-semibold leading-snug">{title}</div>}
          <div className="leading-snug">{children}</div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const PeepsPopContext = createContext<PeepsPopContextValue | null>(null)

const usePeepsPop = () => {
  const ctx = useContext(PeepsPopContext)
  if (!ctx) {
    throw new Error("PeepsPop components must be used inside <PeepsPop>")
  }
  return ctx
}

const assignRef = (ref: React.Ref<HTMLElement> | undefined, node: HTMLElement | null) => {
  if (!ref) return
  if (typeof ref === "function") {
    ref(node)
    return
  }
  (ref as React.MutableRefObject<HTMLElement | null>).current = node
}

const PeepsPopRoot = ({ children, title, side, align, mode = "hover" }: PeepsPopRootProps) => {
  const { setPopover, closePopover } = useLayout()
  const contentRef = useRef<ReactNode>(null)

  const registerContent = useCallback((node: ReactNode) => {
    contentRef.current = node
  }, [])

  const showPopover = useCallback((rect: DOMRect) => {
    if (!contentRef.current) return
    setPopover({
      title,
      side,
      align,
      anchor: {
        top   : rect.top,
        left  : rect.left,
        width : rect.width,
        height: rect.height,
      },
      children: contentRef.current,
    })
  }, [align, setPopover, side, title])

  const value = useMemo(() => ({
    registerContent,
    showPopover,
    closePopover,
    mode,
  }), [closePopover, mode, registerContent, showPopover])

  return (
    <PeepsPopContext.Provider value={value}>
      {children}
    </PeepsPopContext.Provider>
  )
}

const PeepsPopTrigger = ({ children }: PeepsPopTriggerProps) => {
  const { showPopover, closePopover, mode } = usePeepsPop()
  const nodeRef = useRef<HTMLElement | null>(null)
  const childRef = (children as ReactElement & { ref?: React.Ref<HTMLElement> }).ref
  const assignInternalRef = (node: HTMLElement | null) => {
    assignRef(childRef as React.Ref<HTMLElement> | undefined, node)
    nodeRef.current = node
  }

  const openFromTarget = (target: EventTarget | null) => {
    const element = nodeRef.current ?? (target as HTMLElement | null)
    if (!element) return
    showPopover(element.getBoundingClientRect())
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    children.props.onClick?.(event)
    if (event.defaultPrevented || mode !== "click") return
    openFromTarget(event.currentTarget)
  }

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    children.props.onMouseEnter?.(event)
    if (event.defaultPrevented || mode !== "hover") return
    openFromTarget(event.currentTarget)
  }

  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    children.props.onMouseLeave?.(event)
    if (event.defaultPrevented || mode !== "hover") return
    closePopover()
  }

  const props: Record<string, unknown> = { ref: assignInternalRef }

  if (mode === "click") {
    props.onClick = handleClick
  } else {
    props.onMouseEnter = handleMouseEnter
    props.onMouseLeave = handleMouseLeave
  }

  return cloneElement(children, props)
}

const PeepsPopContent = ({ children }: PeepsPopContentProps) => {
  const { registerContent } = usePeepsPop()
  registerContent(children)
  return null
}

export const PeepsPop = Object.assign(PeepsPopRoot, {
  Trigger: PeepsPopTrigger,
  Content: PeepsPopContent,
}) as PeepsPopComponent

PagePopover.displayName = "PagePopover"
export default PagePopover