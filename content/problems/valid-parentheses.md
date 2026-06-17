---
title: "Valid Parentheses"
slug: "valid-parentheses"
difficulty: "Easy"
pattern: "Stack"
leetcodeUrl: "https://leetcode.com/problems/valid-parentheses/"
dateSolved: "2026-06-12"
tags: ["stack", "matching"]
---

# Valid Parentheses

## Core Idea
Brackets must close in the reverse order they opened — that "last opened, first
closed" rule is exactly a stack. Push opens, and on each closer make sure it
matches the most recent open.

## Pattern
Stack — for nested / balanced structure problems.

## Key Code
```python
def isValid(s: str) -> bool:
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return not stack
```

## Gotchas
- An empty stack on a closing bracket means there's nothing to match — invalid.
- A non-empty stack at the end means some brackets were never closed.

## Complexity
- **Time:** `O(n)`
- **Space:** `O(n)`
