import { WithChildren, WithClassName } from "@peeps/types"
import { cn } from "@peeps/utils/classnames"

type MainProps = WithChildren & WithClassName & {
    title?: string | React.ReactNode
}

const Main = (props:MainProps) => {
    return (
    <div className={cn("p-6 overflow-y-auto", props.className)}>
        {props.title && <h1 className="w-full">{props.title}</h1>}
        {props.children}
    </div>
    )
}

Main.displayName = "Main"
export default Main