export default function sortArray(items, columnKey, sortDescending) {
    const key = columnKey;
    return items.slice(0).sort((a, b) => ((sortDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
}