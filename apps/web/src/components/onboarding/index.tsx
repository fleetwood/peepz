import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import OnboardingApproval from "./OnboardingApproval";
import OnboardingFamily from "./OnboardingFamily";
import OnboardingProfile from "./OnboardingProfile";

const tabs = [
  {
    value      : "ToDo",
    label      : "ToDo",
    description: "This is where we left off",
  },
  {
    value      : "Approval",
    label      : "Approval",
    description: "All in the family",
  },
  {
    value      : "Family",
    label      : "Family",
    description: "Connect with your family",
  },
  {
    value      : "Profile",
    label      : "Profile",
    description: `It's all about you`,
  },
];

const OnboardingComponent = () => {
  return (
    <Tabs>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key = {tab.value} value = {tab.value}>
            {tab.value}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value = "ToDo">
        <pre>
            {`# Family onboarding (NOT user onboarding)

## Core premise

- Onboarding is **per-family** (per Group/Family), and is **repeatable**.
- A single person can be in **multiple families** (mom’s side, dad’s side, step-family, in-laws, etc).
- Therefore, onboarding state must be scoped to **(person/member + family group)**, not just “this user”.

## Family selection (all entry modes)

Users should be able to choose the family they’re onboarding into via:

- Invite link
- Search by family name
- Enter a code
- Create new family

All entry modes must converge on the same outcome:

- **groupId** (the chosen family group)
- a membership/join state for the current person in that group

## Membership & approval

Approval is group-scoped. “Approval requires 1 admin or 2 non-admin members” only makes sense once we know:

- which **family group** you are joining

So, **Family selection / join request comes before Approval**.

Possible membership outcomes after selecting a family:

- Immediate membership (ACTIVE)
- Pending membership / join request (PENDING) that requires approval

## Relationships are member-to-member

Relationship capture is **person-to-person** (see Relationship model):

- personAId
- personBId
- relationshipType (parent/child/sibling/spouse/partner/etc)
- status (pending/active)
- confirmedBy (both parties must confirm)

Implications:

- “Relationship to the family” is not enough; we need edges to specific people.
- During family onboarding, user declares relationships (creates pending edges), then other people confirm.

## Suggested step framing (for this page)

This page is a **family onboarding state machine** (single-page flow), not a one-time funnel.

Suggested steps:

1. Choose/Join family (invite/search/code/create)
2. Add relationships (person-to-person edges)
3. Approval (only if membership is pending)

## Implementation constraints

- No auth orchestration / token fetching / protocol glue inside components.
- Components should call client-layer functions (e.g. @peeps/client) that hide fetch + auth details.
`}
        </pre>
      </TabsContent>
      <TabsContent value = "Approval">
        <OnboardingApproval />
      </TabsContent>
      <TabsContent value = "Family">
        <OnboardingFamily />
      </TabsContent>
      <TabsContent value = "Profile">
        <OnboardingProfile />
      </TabsContent>
    </Tabs>
  );
};

OnboardingComponent.displayName = "OnboardingComponent";
export default OnboardingComponent;
