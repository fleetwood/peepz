"use client"

import { useCurrentUser } from "@/context/CurrentUserProvider"
import { WithChildren } from "@peeps/types"
import { Spinner } from "../ui/spinner"

type ProtectedContentProps = WithChildren & {
    fallback?: React.ReactNode
}

const FallBack = () => <div className="text-center text-destructive">Sorry you do not have access to this content.</div>

const ProtectedContent = ({ children, fallback = <FallBack /> }: ProtectedContentProps) => {
    const { user, userLoading } = useCurrentUser()

    return userLoading ? <Spinner /> : user ? children : fallback
}

ProtectedContent.displayName = "ProtectedContent"
export default ProtectedContent
