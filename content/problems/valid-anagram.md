---
title: "Valid Anagram"
slug: "valid-anagram"
difficulty: "Easy"
pattern: "Arrays & Hashing"
leetcodeUrl: "https://leetcode.com/problems/valid-anagram/"
dateSolved: "2026-06-15"
tags: ["counting", "frequency", "strings"]
---

# Valid Anagram

## Core Idea
Two strings are anagrams iff they contain the same characters with the same
frequencies. Count letters in one string, then subtract while scanning the
other — everything should cancel to zero.

## Pattern
Frequency counting with a hash map (or fixed-size array for known alphabets).

## Key Code
```python
from collections import Counter

def isAnagram(s: str, t: str) -> bool:
    return Counter(s) == Counter(t)
```

Manual counting, useful when you want `O(1)` extra space for a fixed alphabet:

```python
def isAnagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    counts = [0] * 26
    for cs, ct in zip(s, t):
        counts[ord(cs) - ord("a")] += 1
        counts[ord(ct) - ord("a")] -= 1
    return all(c == 0 for c in counts)
```

## Complexity
- **Time:** `O(n)`
- **Space:** `O(1)` for the fixed 26-letter array, `O(n)` for the Counter.
