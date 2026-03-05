"use client"

import { DatabaseIcon } from "lucide-react"
import { QueryManager } from "@peeps/client"
import { QueryDomainEnum as QueryDomain, MongoHeartbeatResult } from "@peeps/types"

import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { mongoHeartbeat } from "../../../app/actions/mongo/heartbeat"
import { cn } from "@/lib/utils"

const MONGO_STATUS = {
    ERROR  : "ERROR",
    LOADING: "LOADING",
    OK     : "OK",
} as const

type MongoStatusValue = (typeof MONGO_STATUS)[keyof typeof MONGO_STATUS]

type MongoDbStatusProps = {
    className?: string
}


const STATUS_LABELS: Record<MongoStatusValue, string> = {
    [MONGO_STATUS.ERROR]  : "MongoDB unhealthy",
    [MONGO_STATUS.LOADING]: "Checking MongoDB...",
    [MONGO_STATUS.OK]     : "MongoDB healthy",
}

const MongoDbStatus = ({ className }: MongoDbStatusProps) => {
    const { data, isLoading, isFetching, error } = QueryManager.domainQuery<MongoHeartbeatResult>({
        domain   : QueryDomain.APP,
        subdomain: "mongo.heartbeat",
        queryFn  : mongoHeartbeat,
    })

    const status = isFetching || isLoading
        ? MONGO_STATUS.LOADING
        : data?.ok
            ? MONGO_STATUS.OK
            : MONGO_STATUS.ERROR

    const label      = STATUS_LABELS[status]
    const result     = data as MongoHeartbeatResult | undefined
    const serverTime = result?.serverTime ? new Date(result.serverTime) : null
    const details    = result
        ? `db: ${result.dbName} • ${serverTime?.toLocaleString() ?? ""}`
        : error instanceof Error ? error.message : null
    const tooltipText = details ? `${label} — ${details}` : label

    const icon = status === MONGO_STATUS.LOADING
        ? <Spinner className="size-4" />
        : (
            <div
                className={cn(
                    "p-2 rounded-full cursor-pointer hover:bg-primary hover:text-primary-foreground transition-ease-200",
                    status === MONGO_STATUS.OK ? "bg-success text-success-foreground" : "bg-danger text-danger-foreground",
                )}
            >
                <DatabaseIcon className="size-4" />
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

MongoDbStatus.displayName = "MongoDbStatus"
export default MongoDbStatus