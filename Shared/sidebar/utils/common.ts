export function removeDuplicatesByProperty<T extends Record<string, any>>(arr: T[], propertyName: keyof T): T[] {
  const uniqueNames: { [key: string]: boolean } = {};
  return arr.filter((obj) => {
    const propertyValue = obj[propertyName] as string;
    if (!uniqueNames[propertyValue]) {
      uniqueNames[propertyValue] = true;
      return true;
    }
    return false;
  });
}
