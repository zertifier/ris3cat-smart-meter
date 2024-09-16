export enum Comparison {
  LOWER = -1,
  EQUAL = 0,
  HIGHER = 1,
}

/**
 * Sorts the array with the comparison function. It mutates the original array
 * @param list
 * @param compare
 * @private
 */
export function quickSort<T>(list: T[], compare: (a: T, b: T) => Comparison) {
  sortArray(list, 0, list.length - 1, compare)
}

function sortArray<T>(list: T[], low: number, high: number, compare: (a: T, b: T) => Comparison) {
  if (low < high) {
    const pivot = partition(list, low, high, compare)
    // Sorting left side
    sortArray(list, low, pivot - 1, compare)
    // Sorting right side
    sortArray(list, pivot + 1, high, compare)
  }
}

/**
 * @param list
 * @param low
 * @param high
 * @param compare
 */
function partition<T>(list: T[], low: number, high: number, compare: (a: T, b: T) => Comparison): number {
  const pivot = list[high];
  let leftWall = low;
  let swapValue: T;

  for (let i = low + 1; i < high; i ++) {
    if (compare(list[i], pivot) === Comparison.LOWER) {
      swapValue = list[i]
      list[i] = list[leftWall]
      list[leftWall] = swapValue
      leftWall += 1
    }
  }

  list[high] = list[leftWall]
  list[leftWall] = pivot

  // We are returning the leftwal because it is incrementing for each iteration that needs
  // a swap and the result position is the pivote
  return leftWall
}
