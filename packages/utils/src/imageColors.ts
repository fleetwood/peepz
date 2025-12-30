export const defaultGradient = ['hsl(var(--primary))', 'hsl(var(--primary-foreground))']

export async function imageColors(url: string): Promise<{ headerBg: string, headerText: string }> {
  void url
  return { headerBg: 'hsl(var(--primary))', headerText: 'hsl(var(--primary-foreground))' }
}
