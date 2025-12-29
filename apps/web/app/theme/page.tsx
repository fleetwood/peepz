import Main from "@/components/layout/Main"
import Theme from "@/components/Theme"

export type ThemePageProps = {
    
}

const ThemePage = (props:ThemePageProps) => {
    return (
        <Main>
            <Theme />
        </Main>
    
    )
}

ThemePage.displayName = "ThemePage"
export default ThemePage
