import { h, type FunctionalComponent } from 'vue'
import type { FamilySettingsConfig, GovernanceValue, GroupPrivacyValue } from '@peeps/types'
import { Icon as IconComponent } from '@iconify/vue'

const Icon = (name: string, props?: any) => {
  return h(IconComponent, { icon: name, ...props })
}
// Auth Provider Icons
export const GoogleIcon = (props?: any) => Icon('mingcute:google-fill', props)
export const EmailIcon = (props?: any) => Icon('mingcute:mail-fill', props)
export const LogoutIcon = (props?: any) => Icon('mingcute:enter-door-line', props)

// Governance Icons
export const GovernanceIcons = {
  SINGLE_ADMIN: (props?: any) => Icon('mingcute:user-star-fill', props),
  HIERARCHICAL: (props?: any) => Icon('mingcute:user-3-fill', props),
  CONSENSUS   : (props?: any) => Icon('mingcute:user-follow-2-fill', props),
  DEMOCRATIC  : (props?: any) => Icon('mingcute:user-star-fill', props),
} satisfies Record<GovernanceValue, (props?: any) => any>

// Privacy Icons
export const GroupPrivacyIcons = {
  PRIVATE : (props?: any) => Icon('mingcute:user-security-fill', props),
  PUBLIC  : (props?: any) => Icon('mingcute:user-visible-line', props),
  APPROVAL: (props?: any) => Icon('mingcute:user-hide-fill', props),
} satisfies Record<GroupPrivacyValue, (props?: any) => any>

// Family Settings Icons
export const FamilySettingsIcon = {
  "access" : (props?: any) => Icon('mingcute:check-line', props),
  "request": (props?: any) => Icon('mingcute:message-question-line', props),
  "vote"   : (props?: any) => Icon('mingcute:vote-line', props),
  "none"   : (props?: any) => Icon('mingcute:close-line', props),
} satisfies Record<FamilySettingsConfig, (props?: any) => any>
