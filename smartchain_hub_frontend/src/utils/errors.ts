/** Type-safe error message extractor for catch (e: unknown) blocks. */
export function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'object' && e !== null) {
    const obj = e as Record<string, unknown>;
    return String(obj.reason ?? obj.message ?? JSON.stringify(obj));
  }
  return String(e);
}
