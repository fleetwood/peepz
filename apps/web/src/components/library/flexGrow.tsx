import { WithClassName } from "@peeps/types"

const FlexGrow = ({className}:WithClassName) => <div className={`flex-grow ${className || ''}`} />

FlexGrow.displayName = "FlexGrow"
export default FlexGrow