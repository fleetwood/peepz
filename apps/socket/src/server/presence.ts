export class PresenceTracker {
  private members = new Set<string>()

  add(memberId: string): void {
    this.members.add(memberId)
  }

  remove(memberId: string): void {
    this.members.delete(memberId)
  }

  getCount(): number {
    return this.members.size
  }
}

export const presenceTracker = new PresenceTracker()
