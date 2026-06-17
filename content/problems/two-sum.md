---
title: "Two Sum"
slug: "two-sum"
difficulty: "Easy"
pattern: "Arrays & Hashing"
leetcodeUrl: "https://leetcode.com/problems/two-sum/"
dateSolved: "2026-06-16"
tags: ["hashmap", "complement"]
---

# Two Sum

## Core Idea
For each number `x`, the partner you need is `target - x`. Instead of searching
for that partner with a second loop, remember every number you've already seen
in a hash map so the lookup is instant.

## Pattern
Hash Map / complement lookup.

This is the canonical "trade space for time" trick: an `O(n^2)` brute force
collapses to `O(n)` by caching what you've seen.

## Key Code
```python
def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}  # value -> index
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return [seen[complement], i]
        seen[n] = i
    return []
```

## Gotchas
- Store the index **after** checking, otherwise an element could match itself.
- The map stores `value -> index` so you can return positions, not values.

## Complexity
- **Time:** `O(n)`
- **Space:** `O(n)`
