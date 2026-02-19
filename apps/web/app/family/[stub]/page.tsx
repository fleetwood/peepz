"use client"

import Main from "@/components/layout/Main"
import ProtectedContent from "@/components/layout/ProtectedContent"
import { GovernanceIcons, GroupPrivacyIcons } from "@/components/library/icons"
import SendFamilyLink from "@/components/layout/family/SendFamilyLink"
import { useFamilyClient } from "@peeps/client"
import type { FamilySearchResult } from "@peeps/types"
import { useParams } from "next/navigation"

const roleLabels = {
  ADMIN : "Admin",
  MEMBER: "Member",
} as const

type InviteMethod = "EMAIL" | "SMS" | "WHATSAPP"

const inviteMethodLabels: Record<InviteMethod, string> = {
  EMAIL   : "Email",
  SMS     : "SMS",
  WHATSAPP: "WhatsApp",
}

const invitePlaceholders: Record<InviteMethod, string> = {
  EMAIL   : "name@example.com",
  SMS     : "+1 (555) 123-4567",
  WHATSAPP: "+1 (555) 123-4567",
}

const formatMemberName = (person: FamilySearchResult["members"][number]["person"]) => {
  if (person.preferredName) return person.preferredName
  if (person.firstName || person.lastName) {
    return [person.firstName, person.lastName].filter(Boolean).join(" ") || "Family member"
  }
  if (person.name && person.name.length > 0) {
    return person.name.join(" ")
  }
  return "Family member"
}

const FamilyDetailPage = () => {
  const params = useParams<{ stub: string }>()
  const stub = params.stub
  const familyClient = useFamilyClient()
  const { data, isLoading, error } = familyClient.useFamiliesByStub({ stub })
  const errorMessage = error instanceof Error ? error.message : (typeof error === "string" ? error : null)
  const families = data ?? []

  return (
    <ProtectedContent>
    <Main title={`Your Family`} isLoading={[isLoading]} error={[errorMessage]}>
      {!isLoading && !errorMessage && (
        families.length > 0 ? (
          <div className="space-y-4">
            {families.map(({ groups, membership, members }) => {
              const roleKey = membership?.role ?? "MEMBER"
              const roleLabel = roleLabels[roleKey as keyof typeof roleLabels] ?? "Member"
              const PrivacyIcon = groups.privacyLevel
                ? GroupPrivacyIcons[groups.privacyLevel as keyof typeof GroupPrivacyIcons]
                : null
              const GovernanceIcon = groups.governanceModel
                ? GovernanceIcons[groups.governanceModel as keyof typeof GovernanceIcons]
                : null
              const otherMembers = (members ?? []).filter(
                (memberEntry) => memberEntry.membership.personId !== membership?.personId,
              )

              return (
                <div key={groups.id} className="rounded-xl border border-border p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{groups.name}</h2>
                  </div>
                  {groups.description && <p className="text-sm text-muted-foreground">{groups.description}</p>}
                  <dl className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground/80">
                      {roleLabel}
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-2">
                      {PrivacyIcon && <PrivacyIcon className="h-4 w-4" />}
                    </div>
                    <div className="flex items-center gap-2">
                      {GovernanceIcon && <GovernanceIcon className="h-4 w-4" />}
                    </div>
                  </dl>
                  
                  <div className="mt-4">
                    <h3>Peeps</h3>
                    {otherMembers.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {otherMembers.map(({ membership: memberMembership, person }) => {
                          const memberRoleKey = memberMembership.role ?? "MEMBER"
                          const memberRoleLabel = roleLabels[memberRoleKey as keyof typeof roleLabels] ?? "Member"
                          return (
                            <li key={memberMembership.id} className="flex items-center justify-between gap-2 rounded-md border border-muted px-2 py-1">
                              <span className="truncate">{formatMemberName(person)}</span>
                              <span className="text-xs font-medium text-foreground/70">{memberRoleLabel}</span>
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">No other members yet.</p>
                    )}
                  </div>

                  <SendFamilyLink groupId={groups.id} className="mt-6 rounded-lg border border-dashed border-muted p-3" />

                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            You don’t belong to any “{stub}” families yet. Double-check the link or ask an admin for access.
          </p>
        )
      )}
    </Main>
    </ProtectedContent>
  )
}

FamilyDetailPage.displayName = "FamilyDetailPage"
export default FamilyDetailPage