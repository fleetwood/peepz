import Main from "@/components/layout/Main"
import Theme from "@/components/Theme"

const ThemePage = (_props:unknown) => {
    return (
        <Main title="Theme">
            <Theme />
        </Main>
    )
}

ThemePage.displayName = "ThemePage"
export default ThemePage
