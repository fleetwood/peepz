import { WithChildren, WithClassName } from "@peeps/types"
import { cn } from "@peeps/utils/classnames"

type MainProps = WithChildren & WithClassName & {
    title?: string | React.ReactNode
}

const Main = (props:MainProps) => {
    return (
    <div className={cn("mx-auto p-6 flex-1 overflow-y-auto", props.className)}>
        {props.title && <h1 className="text-2xl font-bold mb-4">{props.title}</h1>}
        {props.children}
    </div>
    )
}

Main.displayName = "Main"
export default Main