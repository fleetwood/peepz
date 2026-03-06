
import { clientEnv } from '@peeps/config/env'
import { WithChildren } from "@peeps/types"

const DevOnly = (props:WithChildren) => {
    const isDev = clientEnv.isDev
    return (
        isDev ? props.children : null
    )
}

DevOnly.displayName = "DevOnly"
export default DevOnly
