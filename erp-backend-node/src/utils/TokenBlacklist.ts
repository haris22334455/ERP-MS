// Simple in-memory token blacklist for logout functionality
// In a real production system with multiple instances, use Redis or a database table.

export class TokenBlacklist {
  private static blacklist: Set<string> = new Set();

  static add(token: string) {
    this.blacklist.add(token);
  }

  static has(token: string): boolean {
    return this.blacklist.has(token);
  }
}
