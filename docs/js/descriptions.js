// Educational reference shown in the side drawer. Complexity values are the standard
// textbook figures (best / average / worst), which may differ from the single headline
// complexity shown in the header.

export const LEGEND = [
  { state: "compare", label: "Comparing / examining elements" },
  { state: "swap", label: "Swap or array write" },
  { state: "sorted", label: "Final position / match found" },
  { state: "target", label: "Pivot, current min, or search bounds" },
];

export const DESCRIPTIONS = {
  bubble: {
    summary: "Repeatedly swaps adjacent out-of-order pairs until the list is sorted.",
    how: "On each pass it walks the list comparing neighbours and swapping them when they are in the wrong order. After each pass the largest remaining value has 'bubbled' to its place at the end, so each pass needs to look at one fewer element.",
    time: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
    space: "O(1)",
    stable: true, inPlace: true, kind: "Comparison",
    use: "Teaching only. Simple to understand but far too slow for real data.",
  },
  insertion: {
    summary: "Builds the sorted list one element at a time by inserting each into place.",
    how: "It keeps the left part of the array sorted. Each new element is compared backwards and shifted into its correct slot among the already-sorted elements, like sorting a hand of cards.",
    time: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
    space: "O(1)",
    stable: true, inPlace: true, kind: "Comparison",
    use: "Great for small or nearly-sorted data; used inside hybrid sorts like Tim Sort.",
  },
  selection: {
    summary: "Repeatedly selects the smallest remaining element and places it next.",
    how: "It scans the unsorted portion to find the minimum (or maximum for descending), then swaps it into the next position. It always does the same number of comparisons regardless of input.",
    time: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
    space: "O(1)",
    stable: false, inPlace: true, kind: "Comparison",
    use: "When the number of swaps must be minimal; otherwise rarely the best choice.",
  },
  merge: {
    summary: "Divide and conquer: split in half, sort each half, then merge them.",
    how: "It recursively splits the array down to single elements, then merges sorted runs back together by repeatedly taking the smaller front element of two runs. Performance is consistent regardless of input order.",
    time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    space: "O(n)",
    stable: true, inPlace: false, kind: "Comparison",
    use: "When stable, predictable performance matters, or for linked lists / external sorting.",
  },
  quick: {
    summary: "Divide and conquer around a pivot; partition smaller / larger, then recurse.",
    how: "It picks a pivot (here, the last element), moves smaller values left and larger values right, then recursively sorts each side. Very fast on average, but a bad pivot on already-sorted data degrades to quadratic.",
    time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" },
    space: "O(log n)",
    stable: false, inPlace: true, kind: "Comparison",
    use: "General-purpose in-memory sorting; the default in many standard libraries.",
  },
  heap: {
    summary: "Builds a binary heap, then repeatedly extracts the max/min.",
    how: "It arranges the array into a heap so the largest (or smallest) value sits at the root, swaps it to the end, shrinks the heap, and re-heapifies. Worst-case time stays O(n log n) with no extra memory.",
    time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    space: "O(1)",
    stable: false, inPlace: true, kind: "Comparison",
    use: "When you need guaranteed O(n log n) and constant extra space.",
  },
  bucket: {
    summary: "Distributes values into buckets, sorts each, then concatenates.",
    how: "Values are spread into a fixed number of buckets by range, each bucket is sorted, and the buckets are read back in order. Works best when the input is spread evenly across the range.",
    time: { best: "O(n + k)", average: "O(n + k)", worst: "O(n²)" },
    space: "O(n + k)",
    stable: true, inPlace: false, kind: "Distribution",
    use: "Uniformly distributed numeric data over a known range.",
  },
  radix: {
    summary: "Sorts numbers digit by digit using a stable counting sort.",
    how: "It sorts on the least-significant digit first, then each more-significant digit, using a stable counting sort each pass. It never compares two values directly, so it sidesteps the comparison-sort lower bound.",
    time: { best: "O(n · d)", average: "O(n · d)", worst: "O(n · d)" },
    space: "O(n + b)",
    stable: true, inPlace: false, kind: "Non-comparison",
    use: "Fixed-width integers or strings where the digit/key length d is small.",
  },
  tim: {
    summary: "Hybrid of merge and insertion sort (simplified merge-based here).",
    how: "Real Tim Sort finds already-ordered runs, extends them with insertion sort, and merges them, which makes it very fast on partly-ordered data. This project ships a simplified merge-based version.",
    time: { best: "O(n)", average: "O(n log n)", worst: "O(n log n)" },
    space: "O(n)",
    stable: true, inPlace: false, kind: "Comparison",
    use: "Real-world default in Python and Java for its speed on real, partly-sorted data.",
  },
  intro: {
    summary: "Hybrid that starts with quick sort and falls back to heap sort (simplified here).",
    how: "Real Intro Sort begins with quick sort but switches to heap sort if recursion gets too deep, avoiding quick sort's O(n²) worst case. This project ships a simplified quick-based version.",
    time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    space: "O(log n)",
    stable: false, inPlace: true, kind: "Comparison",
    use: "Standard library sorting in C++ (std::sort) for guaranteed performance.",
  },
  linear: {
    summary: "Checks each element in order until the target is found.",
    how: "It walks the array from the start, comparing each element to the target, and stops at the first match. No ordering is required.",
    time: { best: "O(1)", average: "O(n)", worst: "O(n)" },
    space: "O(1)",
    stable: null, inPlace: null, kind: "Search (unsorted)",
    use: "Small or unsorted data, or when you only search occasionally.",
  },
  binary: {
    summary: "Repeatedly halves a sorted range to locate the target.",
    how: "It checks the middle element of the current range; if it is not the target, it discards the half that cannot contain it and repeats. The data must be sorted first (the app sorts it for you).",
    time: { best: "O(1)", average: "O(log n)", worst: "O(log n)" },
    space: "O(1)",
    stable: null, inPlace: null, kind: "Search (sorted)",
    use: "Fast lookups in sorted data; the basis of many range and set operations.",
  },
};
