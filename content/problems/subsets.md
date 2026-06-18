---
title: "Subsets"
slug: "subsets"
leetcodeNumber: 78
difficulty: "Medium"
pattern: "Backtracking"
leetcodeUrl: "https://leetcode.com/problems/subsets/"
dateSolved: "2026-06-18"
tags: ["array", "backtracking", "subsets"]
source: "generated-starter"
status: "needs-personal-notes"
---

# Subsets

## Core Idea
Generate every possible subset by making a choice for each number: include it or skip it.

## Pattern
Backtracking — explore an implicit decision tree, adding and removing one element at a time as you recurse.

## My First Approach
<!-- How you first tried to solve it (personal note) — not added yet. Replace this comment with your own words. -->

## Issue With My First Approach
<!-- What was slow, wrong, or clunky about your first attempt (personal note) — not added yet. Replace this comment with your own words. -->

## Improved / Standard Approach
Use DFS/backtracking: append the current path to the result, then explore choices from the next index onward, undoing each choice (pop) as you backtrack.

## Key Code
```python
def subsets(nums: list[int]) -> list[list[int]]:
    res = []

    def backtrack(start: int, path: list[int]) -> None:
        res.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()

    backtrack(0, [])
    return res
```

## Why It Works
Each recursive path represents one subset, and moving the start index forward prevents duplicate ordering.

## Complexity
- **Time:** O(n * 2^n) — there are 2^n subsets and copying each costs up to O(n).
- **Space:** O(n) recursion depth excluding output, O(n * 2^n) including the output list.

## What I Learned
<!-- The insight you want to remember (personal note) — not added yet. Replace this comment with your own words. -->

## When To Use This Pattern Again
<!-- Signals/triggers that should remind you to reach for this pattern (personal note) — not added yet. Replace this comment with your own words. -->

## Similar Problems
- Subsets II
- Permutations
- Combination Sum
