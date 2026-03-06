import { GovernanceModel } from "../enums"
import type { FamilySettingsConfig, GovernanceValue } from "../family"

const { SINGLE_ADMIN, HIERARCHICAL, CONSENSUS, DEMOCRATIC } = GovernanceModel

type RolePrivileges = {
  changeSettings : FamilySettingsConfig
  approveMembers : FamilySettingsConfig
  removeMembers  : FamilySettingsConfig
  moderateContent: FamilySettingsConfig
}

type GovernancePrivileges = {
  primaryAdmins?: RolePrivileges
  admins       ?: RolePrivileges
  members       : RolePrivileges
}

type GovernanceDetail = {
  label      : string
  description: string
  decisions  : string
  bestFor    : string
  privileges : GovernancePrivileges
}

export const GovernanceMap: Record<GovernanceValue, GovernanceDetail> = {
  [SINGLE_ADMIN]: {
    label      : "Single Admin",
    description: "One trusted person runs everything and chooses a backup in case they step away.",
    decisions  : "That admin can add/remove people or change settings instantly; the family only steps in during emergencies.",
    bestFor    : "Small families or setups where one person already carries the load.",
    privileges : {
      admins: {
        changeSettings : "access",
        approveMembers : "access",
        removeMembers  : "access",
        moderateContent: "access",
      },
      members: {
        changeSettings : "request",
        approveMembers : "none",
        removeMembers  : "request",
        moderateContent: "request",
      },
    },
  },
  [HIERARCHICAL]: {
    label      : "Hierarchical",
    description: "Primary admins sit at the top, can instantly approve members, remove people, or tweak family settings.",
    decisions  : "Primary admins appoint or demote other admins and clear escalations; regular admins handle member approvals and moderation but escalate big changes upward.",
    bestFor    : "Multi-generational families that want clear leadership but still have helpers.",
    privileges : {
      primaryAdmins: {
        changeSettings : "access",
        approveMembers : "access",
        removeMembers  : "access",
        moderateContent: "access",
      },
      admins: {
        changeSettings : "request",
        approveMembers : "access",
        removeMembers  : "request",
        moderateContent: "access",
      },
      members: {
        changeSettings : "request",
        approveMembers : "none",
        removeMembers  : "request",
        moderateContent: "request",
      },
    },
  },
  [CONSENSUS]: {
    label      : "Consensus",
    description: "Every admin has an equal say: nothing changes unless everyone agrees.",
    decisions  : "Admins must unanimously approve member changes, moderation calls, or setting tweaks, so actions are slower but ultra-trustworthy.",
    bestFor    : "Tight-knit families that value harmony over speed.",
    privileges : {
      admins: {
        changeSettings : "vote",
        approveMembers : "access",
        removeMembers  : "vote",
        moderateContent: "vote",
      },
      members: {
        changeSettings : "request",
        approveMembers : "request",
        removeMembers  : "request",
        moderateContent: "request",
      },
    },
  },
  [DEMOCRATIC]: {
    label      : "Democratic",
    description: "There are no permanent admins—anyone can approve members, moderate content, or change settings.",
    decisions  : "Important changes go to a quick vote, and the family picks the passing threshold (50–100%).",
    bestFor    : "Small, egalitarian families who like decisions by ballot.",
    privileges : {
      members: {
        changeSettings : "vote",
        approveMembers : "vote",
        removeMembers  : "vote",
        moderateContent: "vote",
      },
    },
  },
}
