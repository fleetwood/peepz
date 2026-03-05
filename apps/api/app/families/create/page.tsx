"use client"

import { PeepsPop } from "@/components/layout/PagePop"
import { Chooser, ChooseItem } from "@/components/library/chooser"
import { FamilySettngsIcon, GovernanceIcons, GroupPrivacyIcons } from "@/components/library/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { useFamilyClient } from "@peeps/client"
import { GovernanceMap } from "@peeps/db/maps/GovernanceMap"
import type { FamilySettingsConfig } from "@peeps/db/maps/GovernanceMap"
import { GroupPrivacyMap } from "@peeps/db/maps/GroupPrivacyMap"
import { GovernanceModel, GroupPrivacyLevel, RemovalPolicy } from "@peeps/db/schema/enums"
import { useRouter, useSearchParams } from "next/navigation"
import { type ChangeEvent, type FormEvent, useState } from "react"

const privacyOptions = Object.values(GroupPrivacyLevel)
const governanceOptions = Object.values(GovernanceModel)
const removalOptions = Object.values(RemovalPolicy)
const voteSteps = [10, 25, 33, 50, 66, 75, 90] as const
const defaultVoteStep = 50
type VoteStepValue = (typeof voteSteps)[number]
type GovernanceModelValue = (typeof GovernanceModel)[keyof typeof GovernanceModel]
type PrivacyLevelValue = (typeof GroupPrivacyLevel)[keyof typeof GroupPrivacyLevel]
type RemovalPolicyValue = (typeof RemovalPolicy)[keyof typeof RemovalPolicy]

type FormState = {
  name           : string
  description    : string
  privacyLevel   : PrivacyLevelValue
  governanceModel: GovernanceModelValue
  removalPolicy  : RemovalPolicyValue
  voteThreshold  : string
}

const governanceUsesVoting = (model: GovernanceModelValue) => {
  const privileges = GovernanceMap[model].privileges
  return Object.values(privileges).some(
    (role) => role && Object.values(role).some((value) => value === "vote"),
  )
}

const normalizeVoteThreshold = (value: string) => {
  const numeric = Number(value)
  return voteSteps.includes(numeric as VoteStepValue) ? String(numeric) : String(defaultVoteStep)
}

const getVoteStepIndex = (value: string) => {
  const numeric = Number(value)
  const index = voteSteps.indexOf(numeric as VoteStepValue)
  return index === -1 ? voteSteps.indexOf(defaultVoteStep) : index
}

const CreateFamilyPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const defaultName = searchParams.get("name") ?? ""
  const familyClient = useFamilyClient()
  const createFamily = familyClient.useCreate()

  const [formState, setFormState] = useState<FormState>({
    name           : defaultName,
    description    : "",
    privacyLevel   : GroupPrivacyLevel.PRIVATE,
    governanceModel: GovernanceModel.SINGLE_ADMIN,
    removalPolicy  : RemovalPolicy.IMMEDIATE,
    voteThreshold  : "100",
  })
  const [error, setError] = useState<string | null>(null)

  const handleChange = <T extends keyof FormState>(field: T) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const value = event.target.value as FormState[T]
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePrivacySelect = (value?: PrivacyLevelValue) => {
    if (!value) return
    setFormState((prev) => ({
      ...prev,
      privacyLevel: value,
    }))
  }

  const handleGovernanceSelect = (value: GovernanceModelValue | undefined) => {
    if (!value) return
    const allowsVoting = governanceUsesVoting(value)
    setFormState((prev) => ({
      ...prev,
      governanceModel: value,
      voteThreshold  : allowsVoting ? normalizeVoteThreshold(prev.voteThreshold) : "0",
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!formState.name.trim()) {
      setError("Family name is required")
      return
    }

    try {
      const result = await createFamily.mutateAsync({
        ...formState,
        name           : formState.name.trim(),
        description    : formState.description.trim(),
        voteThreshold  : formState.voteThreshold ? Number(formState.voteThreshold) : null,
      })

      router.push(`/family/${result.groups.id}`)
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "Failed to create family")
    }
  }

  const governancePrivileges = GovernanceMap[formState.governanceModel].privileges
  const privilegeColumns = [
    { key: "changeSettings", label: "Change family settings" },
    { key: "approveMembers", label: "Approve members" },
    { key: "removeMembers", label: "Remove members" },
    { key: "moderateContent", label: "Moderate content" },
  ] as const
  const privilegeLabels: Record<FamilySettingsConfig, string> = {
    access : "Yes",
    request: "By request",
    vote   : "By vote",
    none   : "No",
  }

  const privilegeRows = [
    { key: "primaryAdmins", label: "Primary admins", data: governancePrivileges.primaryAdmins },
    { key: "admins", label: "Admins", data: governancePrivileges.admins },
    { key: "members", label: "Members", data: governancePrivileges.members },
  ].filter((row) => row.data)

  const governanceAllowsVoting = governanceUsesVoting(formState.governanceModel)

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Create a Family</h1>
        <p className="text-muted-foreground">Set up a new family group so you can invite members, manage governance, and get everyone connected.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border p-6 shadow-sm">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Family Name
          </label>
          <Input id="name" value={formState.name} onChange={handleChange("name")} placeholder="e.g. The Ramirez Family" />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="description"
            value={formState.description}
            onChange={handleChange("description")}
            placeholder="Share a short description so people know they’re in the right place. Something that other family members will recognize. IYKYK (If You Know You Know)."
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          />
        </div>

          <div className="space-y-2">
            <label htmlFor="privacy" className="text-sm font-medium text-foreground">
              Privacy Level
            </label>
            <Chooser 
              className="w-full" 
              fit="stretch"
              value={formState.privacyLevel} 
              onValueChange={handlePrivacySelect}
            >
              {privacyOptions.map((option) => (
                <PeepsPop mode="hover">
                  <PeepsPop.Trigger>
                    <ChooseItem key={option} value={option}>
                      {(() => {
                        const Icon = GroupPrivacyIcons[option]
                        return <Icon className="mr-2" />
                      })()}
                      {GroupPrivacyMap[option].label}
                    </ChooseItem>
                  </PeepsPop.Trigger>
                  <PeepsPop.Content>
                    <div className="text-sm leading-snug text-foreground">
                      {GroupPrivacyMap[option].description}
                    </div>
                  </PeepsPop.Content>
                </PeepsPop>
              ))}
            </Chooser>
          </div>

          <div className="space-y-2">
            <label htmlFor="governance" className="text-sm font-medium text-foreground">
              Governance Model
            </label>
            <Chooser
              value={formState.governanceModel}
              onValueChange={handleGovernanceSelect}
              fit="stretch"
              className="w-full"
            >
              {governanceOptions.map((option) => (
                <PeepsPop mode="hover">
                  <PeepsPop.Trigger>
                    <ChooseItem key={option} value={option}>
                      {(() => {
                        const Icon = GovernanceIcons[option]
                        return <Icon className="mr-2" />
                      })()}
                      {GovernanceMap[option].label}
                    </ChooseItem>
                  </PeepsPop.Trigger>
                  <PeepsPop.Content>
                    <div className="text-sm leading-snug text-foreground">
                      {GovernanceMap[option].description}
                    </div>
                  </PeepsPop.Content>
                </PeepsPop>
                
              ))}
            </Chooser>
          </div>

          {governanceAllowsVoting && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Vote Threshold</p>
                  <p className="text-xs text-muted-foreground">What percentage is needed to approve a vote?</p>
                </div>
                <p className="text-sm font-semibold text-primary">{Number(formState.voteThreshold)}%</p>
              </div>
              <Slider
                min={0}
                max={voteSteps.length - 1}
                step={1}
                value={[getVoteStepIndex(formState.voteThreshold)]}
                onValueChange={([index]) => {
                  const safeIndex = index ?? getVoteStepIndex(formState.voteThreshold)
                  const nextValue = voteSteps[safeIndex as number] ?? defaultVoteStep
                  setFormState((prev) => ({
                    ...prev,
                    voteThreshold: String(nextValue),
                  }))
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {voteSteps.map((step) => (
                  <span key={step}>{step}%</span>
                ))}
              </div>
            </div>
          )}

        <div className="space-y-3 rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Who can do what?</p>
              <p className="text-xs text-muted-foreground">Based on your selected governance model.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-4 font-semibold">Role</th>
                  {privilegeColumns.map((column) => (
                    <th key={column.key} className="py-2 pr-4 font-semibold">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {privilegeRows.map((row) => (
                  <tr key={row.key} className="border-t border-border/60">
                    <td className="py-3 pr-4 font-medium text-foreground">{row.label}</td>
                    {privilegeColumns.map((column) => (
                      <td key={column.key} className="py-3 pr-4 align-top">
                        {(() => {
                          const value = row.data?.[column.key]
                          if (!value) return null
                          const Icon = FamilySettngsIcon[value]
                          return (
                            <div className={cn(
                              "flex items-center gap-2 text-sm text-foreground",
                               value === "access" ? "text-success" : value === "none" ? "text-danger" : "text-warning")}>
                              <Icon className="h-4 w-4" />
                              <span>{privilegeLabels[value]}</span>
                            </div>
                          )
                        })()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={createFamily.isPending} className="w-full">
          {createFamily.isPending ? "Creating..." : "Create Family"}
        </Button>
      </form>
    </main>
  )
}

CreateFamilyPage.displayName = "CreateFamilyPage"
export default CreateFamilyPage
