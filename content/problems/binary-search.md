---
title: "Binary Search"
slug: "binary-search"
difficulty: "Easy"
pattern: "Binary Search"
leetcodeUrl: "https://leetcode.com/problems/binary-search/"
dateSolved: "2026-06-11"
tags: ["binary-search", "sorted-array"]
---

# Binary Search

## Core Idea
On a sorted array, comparing with the middle element lets you discard half the
search space every step. Keep an inclusive `[left, right]` window and shrink it.

## Pattern
Binary Search — halving a monotonic search space.

The reusable template below avoids overflow and the classic off-by-one bugs.

## Key Code
```python
def search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

## Things to Watch
- Use `left + (right - left) // 2` to avoid integer overflow in other languages.
- Decide up front whether `right` is inclusive (`len - 1`) or exclusive (`len`);
  the loop condition and updates must match that choice.

## Complexity
- **Time:** `O(log n)`
- **Space:** `O(1)`
