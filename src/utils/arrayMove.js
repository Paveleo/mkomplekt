export function arrayMove(arr, from, to) {
    const a = arr.slice();
    const item = a.splice(from, 1)[0];
    a.splice(to, 0, item);
    return a;
}
