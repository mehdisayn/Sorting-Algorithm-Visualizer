// Each sort is a generator: function*(arr, ascending, stats) that mutates arr in place
// and yields a step descriptor { highlights: { index: state } }.
// Each search is a generator: function*(arr, target, stats) that yields steps and RETURNS
// the found index (or -1). State strings: "compare" | "swap" | "sorted" | "target".
//
// `stats` is an optional { comparisons, writes } counter the generators increment so the
// UI can report real operation counts. It defaults so the algorithms stay usable/testable
// without it.

const newStats = () => ({ comparisons: 0, writes: 0 });

function* bubbleSort(arr, ascending, stats = newStats()) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      yield { highlights: { [j]: "compare", [j + 1]: "compare" } };
      const a = arr[j], b = arr[j + 1];
      stats.comparisons++;
      if ((a > b && ascending) || (a < b && !ascending)) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        stats.writes++;
        yield { highlights: { [j]: "swap", [j + 1]: "swap" } };
      }
    }
  }
}

function* insertionSort(arr, ascending, stats = newStats()) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0) {
      stats.comparisons++;
      const move = (arr[j] > key && ascending) || (arr[j] < key && !ascending);
      if (!move) break;
      arr[j + 1] = arr[j];
      stats.writes++;
      yield { highlights: { [j]: "compare", [j + 1]: "swap" } };
      j -= 1;
    }
    arr[j + 1] = key;
    stats.writes++;
    yield { highlights: { [j + 1]: "sorted" } };
  }
}

function* selectionSort(arr, ascending, stats = newStats()) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      stats.comparisons++;
      if ((arr[j] < arr[minIdx] && ascending) || (arr[j] > arr[minIdx] && !ascending)) {
        minIdx = j;
      }
      yield { highlights: { [j]: "compare", [minIdx]: "target" } };
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    stats.writes++;
    yield { highlights: { [i]: "sorted", [minIdx]: "swap" } };
  }
}

function* mergeSort(arr, ascending, stats = newStats()) {
  function* merge(start, mid, end) {
    const left = arr.slice(start, mid + 1);
    const right = arr.slice(mid + 1, end + 1);
    let i = 0, j = 0, k = start;
    while (i < left.length && j < right.length) {
      stats.comparisons++;
      if ((left[i] <= right[j] && ascending) || (left[i] >= right[j] && !ascending)) {
        arr[k] = left[i]; i++;
      } else {
        arr[k] = right[j]; j++;
      }
      stats.writes++;
      yield { highlights: { [k]: "swap" } };
      k++;
    }
    while (i < left.length) { arr[k] = left[i]; stats.writes++; yield { highlights: { [k]: "swap" } }; i++; k++; }
    while (j < right.length) { arr[k] = right[j]; stats.writes++; yield { highlights: { [k]: "swap" } }; j++; k++; }
  }
  function* helper(start, end) {
    if (start < end) {
      const mid = Math.floor((start + end) / 2);
      yield* helper(start, mid);
      yield* helper(mid + 1, end);
      yield* merge(start, mid, end);
    }
  }
  yield* helper(0, arr.length - 1);
}

function* quickSort(arr, ascending, stats = newStats()) {
  function* partition(low, high) {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      yield { highlights: { [j]: "compare", [high]: "target" } };
      stats.comparisons++;
      if ((arr[j] < pivot && ascending) || (arr[j] > pivot && !ascending)) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        stats.writes++;
        yield { highlights: { [i]: "swap", [j]: "swap" } };
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    stats.writes++;
    yield { highlights: { [i + 1]: "sorted" } };
    return i + 1;
  }
  function* helper(low, high) {
    if (low < high) {
      const pi = yield* partition(low, high);
      yield* helper(low, pi - 1);
      yield* helper(pi + 1, high);
    }
  }
  yield* helper(0, arr.length - 1);
}

function* heapSort(arr, ascending, stats = newStats()) {
  function* heapify(n, i) {
    let target = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (ascending) {
      if (l < n) { stats.comparisons++; if (arr[l] > arr[target]) target = l; }
      if (r < n) { stats.comparisons++; if (arr[r] > arr[target]) target = r; }
    } else {
      if (l < n) { stats.comparisons++; if (arr[l] < arr[target]) target = l; }
      if (r < n) { stats.comparisons++; if (arr[r] < arr[target]) target = r; }
    }
    if (target !== i) {
      [arr[i], arr[target]] = [arr[target], arr[i]];
      stats.writes++;
      yield { highlights: { [i]: "swap", [target]: "compare" } };
      yield* heapify(n, target);
    }
  }
  const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) yield* heapify(n, i);
  for (let i = n - 1; i > 0; i--) {
    [arr[i], arr[0]] = [arr[0], arr[i]];
    stats.writes++;
    yield { highlights: { [i]: "sorted", [0]: "swap" } };
    yield* heapify(i, 0);
  }
}

function* bucketSort(arr, ascending, stats = newStats()) {
  const minVal = Math.min(...arr);
  const maxVal = Math.max(...arr);
  const bucketCount = 10;
  const buckets = Array.from({ length: bucketCount }, () => []);
  for (const val of arr) {
    let index = Math.floor(((val - minVal) / (maxVal - minVal + 1)) * bucketCount);
    if (index >= bucketCount) index = bucketCount - 1;
    if (index < 0) index = 0;
    buckets[index].push(val);
  }
  for (const bucket of buckets) {
    bucket.sort((a, b) => { stats.comparisons++; return ascending ? a - b : b - a; });
  }
  if (!ascending) buckets.reverse();
  let index = 0;
  for (const bucket of buckets) {
    for (const val of bucket) {
      arr[index] = val;
      stats.writes++;
      yield { highlights: { [index]: "swap" } };
      index++;
    }
  }
}

function* radixSort(arr, ascending, stats = newStats()) {
  // Non-comparison sort: comparisons stay 0 by design.
  function* countingSort(exp) {
    const n = arr.length;
    const output = new Array(n).fill(0);
    const count = new Array(10).fill(0);
    for (let i = 0; i < n; i++) count[Math.floor(arr[i] / exp) % 10]++;
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];
    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      output[count[digit] - 1] = arr[i];
      count[digit]--;
    }
    for (let i = 0; i < n; i++) {
      arr[i] = output[i];
      stats.writes++;
      yield { highlights: { [i]: "swap" } };
    }
  }
  const maxNum = Math.max(...arr);
  let exp = 1;
  while (Math.floor(maxNum / exp) > 0) {
    yield* countingSort(exp);
    exp *= 10;
  }
  if (!ascending) {
    arr.reverse();
    for (let i = 0; i < arr.length; i++) { stats.writes++; yield { highlights: { [i]: "compare" } }; }
  }
}

// Simplified Tim Sort (merge-based), as in the Python source.
function* timSort(arr, ascending, stats = newStats()) {
  yield* mergeSort(arr, ascending, stats);
}

// Simplified Intro Sort (quick-based), as in the Python source.
function* introSort(arr, ascending, stats = newStats()) {
  yield* quickSort(arr, ascending, stats);
}

function* linearSearch(arr, target, stats = newStats()) {
  for (let i = 0; i < arr.length; i++) {
    stats.comparisons++;
    yield { highlights: { [i]: "compare" } };
    if (arr[i] === target) {
      yield { highlights: { [i]: "sorted" } };
      return i;
    }
  }
  return -1;
}

// Assumes arr is already sorted ascending (the driver sorts before running).
function* binarySearch(arr, target, stats = newStats()) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    stats.comparisons++;
    yield { highlights: { [left]: "target", [right]: "target", [mid]: "compare" } };
    if (arr[mid] === target) {
      yield { highlights: { [mid]: "sorted" } };
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}

export const ALGORITHMS = {
  bubble:    { name: "Bubble Sort",    type: "sort",   complexity: "O(n²)",     fn: bubbleSort },
  insertion: { name: "Insertion Sort", type: "sort",   complexity: "O(n²)",     fn: insertionSort },
  selection: { name: "Selection Sort", type: "sort",   complexity: "O(n²)",     fn: selectionSort },
  merge:     { name: "Merge Sort",     type: "sort",   complexity: "O(n log n)", fn: mergeSort },
  quick:     { name: "Quick Sort",     type: "sort",   complexity: "O(n log n)", fn: quickSort },
  heap:      { name: "Heap Sort",      type: "sort",   complexity: "O(n log n)", fn: heapSort },
  bucket:    { name: "Bucket Sort",    type: "sort",   complexity: "O(n + k)",  fn: bucketSort },
  radix:     { name: "Radix Sort",     type: "sort",   complexity: "O(n · d)",  fn: radixSort },
  tim:       { name: "Tim Sort",       type: "sort",   complexity: "O(n log n)", fn: timSort },
  intro:     { name: "Intro Sort",     type: "sort",   complexity: "O(n log n)", fn: introSort },
  linear:    { name: "Linear Search",  type: "search", complexity: "O(n)",      fn: linearSearch },
  binary:    { name: "Binary Search",  type: "search", complexity: "O(log n)",  fn: binarySearch },
};
