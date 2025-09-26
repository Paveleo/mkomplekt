
export function arrayMove<T>(arr: T[], from: number, to: number): T[] {
    const a = arr.slice();
    const item = a.splice(from, 1)[0];
    a.splice(to, 0, item);
    return a;
}
