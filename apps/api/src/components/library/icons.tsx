import type { FamilySettingsConfig, GovernanceValue, GroupPrivacyValue } from "@peeps/db"
import { Check, MessageCircleQuestion, Vote, X } from "lucide-react";
import type { IconType } from "react-icons"
import { FaEyeSlash, FaUserShield } from "react-icons/fa"
import { FaEye, FaUserGroup, FaUsers, FaUsersBetweenLines } from "react-icons/fa6"
import { ImEyePlus } from "react-icons/im";

export const GovernanceIcons = {
  SINGLE_ADMIN: FaUserShield,
  HIERARCHICAL: FaUsers,
  CONSENSUS   : FaUserGroup,
  DEMOCRATIC  : FaUsersBetweenLines,
} satisfies Record<GovernanceValue, IconType>

export const GroupPrivacyIcons = {
  PRIVATE : FaEyeSlash,
  PUBLIC  : FaEye,
  APPROVAL: ImEyePlus,
} satisfies Record<GroupPrivacyValue, IconType>

export const FamilySettngsIcon = {
  "access" : Check,
  "request": MessageCircleQuestion,
  "vote"   : Vote,
  "none"   : X,
} satisfies Record<FamilySettingsConfig, IconType>