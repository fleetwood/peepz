export type MainProps = {
    children: React.ReactNode
}

const Main = (props:MainProps) => {
    return (
    <div className="flex-1 overflow-y-auto">
        {props.children}
    </div>
    )
}

Main.displayName = "Main"
export default Main