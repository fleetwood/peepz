"use client"

import { Share2Icon } from "lucide-react"
import { QueryManager } from "@peeps/client"
import { QueryDomainEnum as QueryDomain, ShareDbHeartbeatResult } from "@peeps/types"

import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { shareDbHeartbeat } from "../../../app/actions/socket/heartbeat"
import { cn } from "@/lib/utils"

const SHAREDB_STATUS = {
    ERROR  : "ERROR",
    LOADING: "LOADING",
    OK     : "OK",
} as const

type ShareDbStatusValue = (typeof SHAREDB_STATUS)[keyof typeof SHAREDB_STATUS]

type ShareDbStatusProps = {
    className?: string
}

const STATUS_LABELS: Record<ShareDbStatusValue, string> = {
    [SHAREDB_STATUS.ERROR]  : "ShareDB unhealthy",
    [SHAREDB_STATUS.LOADING]: "Checking ShareDB...",
    [SHAREDB_STATUS.OK]     : "ShareDB healthy",
}

const ShareDbStatus = ({ className }: ShareDbStatusProps) => {
    const { data, isLoading, isFetching, error } = QueryManager.domainQuery<ShareDbHeartbeatResult>({
        domain   : QueryDomain.APP,
        subdomain: "sharedb.heartbeat",
        queryFn  : shareDbHeartbeat,
    })

    const status = isFetching || isLoading
        ? SHAREDB_STATUS.LOADING
        : data?.ok
            ? SHAREDB_STATUS.OK
            : SHAREDB_STATUS.ERROR

    const label   = STATUS_LABELS[status]
    const result  = data as ShareDbHeartbeatResult | undefined
    const details = result
        ? `ws://localhost:${result.port}`
        : error instanceof Error ? error.message : null
    const tooltipText = details ? `${label} — ${details}` : label

    const icon = status === SHAREDB_STATUS.LOADING
        ? <Spinner className="size-4" />
        : (
            <div
                className={cn(
                    "p-2 rounded-full cursor-pointer hover:bg-primary hover:text-primary-foreground transition-ease-200",
                    status === SHAREDB_STATUS.OK ? "bg-success text-success-foreground" : "bg-danger text-danger-foreground",
                )}
            >
                <Share2Icon className="size-4" />
            </div>
        )

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span aria-label={label} className={cn("inline-flex items-center", className)}>
                        {icon}
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <span>{tooltipText}</span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

ShareDbStatus.displayName = "ShareDbStatus"
export default ShareDbStatus
