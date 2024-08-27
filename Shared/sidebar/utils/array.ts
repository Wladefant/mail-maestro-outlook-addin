export function sortByProperty<T, K extends keyof T & (string | number)>(
  arr: T[],
  propertyName: K,
  order: "asc" | "desc" = "asc",
): T[] {
  return arr.slice().sort((a, b) => {
    const aValue = a[propertyName];
    const bValue = b[propertyName];

    let comparison = 0;

    if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    }

    return order === "desc" ? -comparison : comparison;
  });
}

/**
 * Trims an array to a specified maximum number of elements.
 * @param array The array to be trimmed.
 * @param maxElements The maximum number of elements to retain in the array.
 * @returns A new array trimmed to the specified length.
 */
export const trimArrayToMaxElements = <T>(array: T[], maxElements: number = 10): T[] => {
  if (array.length > maxElements) {
    return array.slice(-maxElements);
  }
  return array;
};
