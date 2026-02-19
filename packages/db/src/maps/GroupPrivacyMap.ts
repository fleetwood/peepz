import { GroupPrivacyLevel } from "../schema/enums"

const { PRIVATE, PUBLIC, APPROVAL } = GroupPrivacyLevel

export type GroupPrivacyValue = (typeof GroupPrivacyLevel)[keyof typeof GroupPrivacyLevel]

type GroupPrivacyDetail = {
  label      : string
  description: string
  bestFor    : string
}

export const GroupPrivacyMap: Record<GroupPrivacyValue, GroupPrivacyDetail> = {
  [PRIVATE]: {
    label      : "Private",
    description: "Familiy is invisible in searches. Membership is invite-only, and newcomers need one family admin or two family members to approve them.",
    bestFor    : "Families sharing sensitive stories, caring for minors, or anyone who wants their group completely off the public radar.",
  },
  [PUBLIC]: {
    label      : "Public",
    description: "Your family appears in searches, but members need to join the family before seeing posts.",
    bestFor    : "Large or extended families who want to be discoverable while keeping actual conversations inside the group.",
  },
  [APPROVAL]: {
    label      : "Approval",
    description: "The family appears in searches, but not its members or posts. Members need to request to join and be approved by an admin or two family members.",
    bestFor    : "Families expecting lots of join requests who still want an admin checkpoint before anyone sees family content.",
  },
}