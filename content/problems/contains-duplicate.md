---
title: "Contains Duplicate"
slug: "contains-duplicate"
difficulty: "Easy"
pattern: "Arrays & Hashing"
leetcodeUrl: "https://leetcode.com/problems/contains-duplicate/"
dateSolved: "2026-06-17"
tags: ["set", "hashing", "duplicates"]
---

# Contains Duplicate

## Core Idea
If duplicates exist, the number of unique values is smaller than the original
list. Throwing the numbers into a set collapses duplicates, so comparing sizes
is enough to answer the question.

## Pattern
Hash Set / uniqueness check.

When you need to know whether you've "seen something before", reach for a hash
set. Membership checks and insertions are both `O(1)` on average.

## Key Code
```python
def containsDuplicate(nums: list[int]) -> bool:
    return len(nums) != len(set(nums))
```

A streaming variant that short-circuits as soon as a repeat appears:

```python
def containsDuplicate(nums: list[int]) -> bool:
    seen = set()
    for n in nums:
        if n in seen:
            return True
        seen.add(n)
    return False
```

## Complexity
- **Time:** `O(n)` — one pass over the input.
- **Space:** `O(n)` — the set can hold up to every element.
