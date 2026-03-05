import * as React from "react"
import MiniCard, { MiniCardContent } from "../MiniCard"

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

type SendFamilyLinkProps = {
  groupId: string
  className?: string
}

const SendFamilyLink = ({ groupId, className }: SendFamilyLinkProps) => {
  const [method, setMethod] = React.useState<InviteMethod>("EMAIL")
  const [value, setValue] = React.useState("")

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <MiniCard>
      <MiniCardContent>
        <h4>Invite someone new</h4>
        <p className="text-xs text-muted-foreground">
          Send this family’s join link via email today; SMS/identity providers coming soon.
        </p>
        <form className="mt-3 space-y-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 sm:flex-row">
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
            value={method}
            onChange={(event) => setMethod(event.target.value as InviteMethod)}
          >
            {Object.entries(inviteMethodLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
            placeholder={invitePlaceholders[method]}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            type="text"
          />
          <button
            type="submit"
            className="whitespace-nowrap rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
            disabled={!value.trim()}
          >
            Copy link
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Until automated delivery lands, copy the link and share it wherever you chat.
        </p>
      </form>
      </MiniCardContent>
    </MiniCard>
  )
}

SendFamilyLink.displayName = "SendFamilyLink"
export default SendFamilyLink