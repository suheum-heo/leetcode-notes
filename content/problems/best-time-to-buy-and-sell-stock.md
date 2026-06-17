---
title: "Best Time to Buy and Sell Stock"
slug: "best-time-to-buy-and-sell-stock"
difficulty: "Easy"
pattern: "Sliding Window"
leetcodeUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"
dateSolved: "2026-06-13"
tags: ["sliding-window", "greedy"]
---

# Best Time to Buy and Sell Stock

## Core Idea
Track the lowest price seen so far (your best buy day). For each later day,
compute the profit if you sold today and keep the maximum.

## Pattern
Sliding Window / single-pass greedy.

You can think of `left` as the buy day and `right` as the sell day. Whenever a
new minimum appears, slide `left` forward to it.

## Key Code
```python
def maxProfit(prices: list[int]) -> int:
    min_price = float("inf")
    best = 0
    for price in prices:
        min_price = min(min_price, price)
        best = max(best, price - min_price)
    return best
```

## Intuition
You never need to look back: once you have a cheaper buy price, the old one is
strictly worse for every future sell day.

## Complexity
- **Time:** `O(n)`
- **Space:** `O(1)`
