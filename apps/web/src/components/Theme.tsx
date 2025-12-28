import ThemeSwitcher from "./ThemeSwitcher"

export type ThemeProps = {
    
}

const Theme = (props:ThemeProps) => {
    return (
    <div>
        <ThemeSwitcher />
    </div>
    )
}

Theme.displayName = "Theme"
export default Theme