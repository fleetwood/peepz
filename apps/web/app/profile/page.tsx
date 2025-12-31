import Main from "@/components/layout/Main"

type ProfilePageProps = {
    searchParams?: {
        linked?: string
    }
}

const ProfilePage = (props:ProfilePageProps) => {
    const linked = props.searchParams?.linked === '1'

    return (
    <Main title="User Profile">
        {linked ? (
            <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-900">
                Login provider linked.
            </div>
        ) : null}
        <div>
            TODO: Get the user profile
        </div>
    </Main>
    )
}

ProfilePage.displayName = "ProfilePage"
export default ProfilePage