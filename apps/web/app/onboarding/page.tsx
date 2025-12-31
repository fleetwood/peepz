"use client"

import Main from "@/components/layout/Main"
import { useCurrentUser } from "@/context/CurrentUserProvider"
import OnboardingComponent from "@/components/onboarding"

type OnboardingPageProps = {
    searchParams?: {}
}

const OnboardingPage = (props:OnboardingPageProps) => {
    const {user, userLoading, userError} = useCurrentUser()
    return (
    <Main title="Onboarding">
        {user &&
        <OnboardingComponent />
        }
    </Main>
    )
}

OnboardingPage.displayName = "OnboardingPage"
export default OnboardingPage