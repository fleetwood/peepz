"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { FamilySearchResult } from "@peeps/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useFamilyClient } from "@peeps/client";
import { Debug } from "../layout/Debug";
import { Logger } from "@peeps/utils";
import MiniCard, { MiniCardContent, MiniCardCta, MiniCardIcon } from "../layout/MiniCard";

const logger = Logger.instance('FamilySearch', false)

export function FamilySearch() {
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [selectingGroupId, setSelectingGroupId] = React.useState<string | null>(null);
  const familyClient = useFamilyClient();
  const router = useRouter();

  // Use QueryManager for search with debounced query
  const {data, isLoading, isFetching} = familyClient.useSearch({
    query: debouncedQuery,
    pagination: { limit: 10 },
  })

  const handleSelectFamily = async (family: FamilySearchResult) => {
    setSelectingGroupId(family.groups.id);
    // Placeholder: selection behavior will be implemented later
    logger.debug('handleSelectFamily placeholder', family);
    setSelectingGroupId(null);
  };

  const handleCreate = async () => {
    const name = query.trim();
    if (!name) return;
    router.push(`/families/create?name=${encodeURIComponent(name)}`);
  };

  // Debounce query to prevent API calls on every keystroke
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search for a family..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
        {isLoading || isFetching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </div>
      <Debug data={data} label="FamilySearch" logger={logger} />

      {(data||[])?.map((family) => (
        <div
          key={family.groups.id}
          className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
          onClick={() => void handleSelectFamily(family)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="font-medium">{family.groups.name}</h3>
              {family.groups.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {family.groups.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded">
                  {family.groups.privacyLevel}
                </span>
                <span className="text-xs px-2 py-1 border rounded">
                  {family.groups.governanceModel}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" disabled={selectingGroupId === family.groups.id}>
              {selectingGroupId === family.groups.id ? "Selecting..." : "Select"}
            </Button>
          </div>
        </div>
      ))}

      {/* Create Family Option */}
      {query.trim().length > 0 && (
        <MiniCard>
          <MiniCardIcon
            icon={<Plus className="h-10 w-10 text-primary" />} 
            />
          <MiniCardContent>
            <div>
              <h5 className="font-medium">Create a new family</h5>
              <p className="text-sm text-muted-foreground">
                Start a new family group and invite members
              </p>
            </div>
          </MiniCardContent>
          <MiniCardCta
            icon={<Plus className="h-4 w-4" />}
            label={`Create ${query.trim()}`}
            onClick={() => void handleCreate()}
          />
        </MiniCard>
      )}
    </div>
  );
}

FamilySearch.displayName = "FamilySearch";
