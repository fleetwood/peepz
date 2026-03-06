"use client"

import { UsersIcon } from "lucide-react";

import MongoDbStatus from "../db/MongoDbStatus";
import ShareDbStatus from "../db/ShareDbStatus";
import FlexGrow from "../library/flexGrow";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/context/SocketProvider";

const PageFooter = () => {
  const { presenceCount } = useSocket();

  return (
    <footer className="w-full flex items-center gap-4 justify-end p-2 bg-muted text-muted-foreground">
      <FlexGrow />
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1">
          <UsersIcon className="size-4" />
          <Badge variant="secondary">{presenceCount}</Badge>
        </div>
        <MongoDbStatus />
        <ShareDbStatus />
      </div>
    </footer>
  );
};

PageFooter.displayName = "PageFooter";
export default PageFooter;
