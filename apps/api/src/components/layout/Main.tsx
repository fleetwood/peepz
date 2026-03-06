import { WithChildren, WithClassName } from "@peeps/types"
import { cn } from "@peeps/utils/classnames"
import AsyncContainer, { AsyncContainerProps } from "./AsyncContainer"

type MainProps = AsyncContainerProps & WithChildren & WithClassName & {
    title?: string | React.ReactNode
}

const Main = ({title, className, children, ...props}:MainProps) => {
    return (
        <AsyncContainer {...props}>
            <div className={cn("p-6 overflow-y-auto", className)}>
                {title && <h1 className="w-full">{title}</h1>}
                {children}
            </div>
        </AsyncContainer>
    )
}

Main.displayName = "Main"
export default Main