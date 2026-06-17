---
title: "Valid Palindrome"
slug: "valid-palindrome"
difficulty: "Easy"
pattern: "Two Pointers"
leetcodeUrl: "https://leetcode.com/problems/valid-palindrome/"
dateSolved: "2026-06-14"
tags: ["two-pointers", "strings"]
---

# Valid Palindrome

## Core Idea
Walk inward from both ends at the same time. If every mirrored pair of
characters matches (ignoring case and non-alphanumerics), it's a palindrome.

## Pattern
Two Pointers — converging from the outside in.

This is the simplest form of the two-pointer pattern: a `left` pointer moving
right and a `right` pointer moving left until they cross.

## Key Code
```python
def isPalindrome(s: str) -> bool:
    left, right = 0, len(s) - 1
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        if s[left].lower() != s[right].lower():
            return False
        left += 1
        right -= 1
    return True
```

## Why Two Pointers
Skipping characters in place avoids building a cleaned copy of the string, so we
stay at `O(1)` extra space.

## Complexity
- **Time:** `O(n)`
- **Space:** `O(1)`
