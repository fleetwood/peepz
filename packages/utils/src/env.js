export function CLI_ENV() {
    const proc = globalThis.process;
    if (!proc?.env)
        return;
    if (proc.env.VERCEL)
        return;
    return;
}
