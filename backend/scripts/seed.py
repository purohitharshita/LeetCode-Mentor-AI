"""
Seed script — inserts topics and 50 problems with hints into the database.
Run from the backend directory:
    uv run python scripts/seed.py
"""

import asyncio
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.models.problem import Problem, ProblemHint, ProblemTopic, Topic

# ---------------------------------------------------------------------------
# Topics
# ---------------------------------------------------------------------------

TOPICS = [
    {"name": "arrays", "display_name": "Arrays", "description": "Array traversal, indexing, and manipulation"},
    {"name": "strings", "display_name": "Strings", "description": "String manipulation and pattern matching"},
    {"name": "hash_maps", "display_name": "Hash Maps", "description": "Key-value lookups using hash tables"},
    {"name": "two_pointers", "display_name": "Two Pointers", "description": "Using two indices to traverse arrays efficiently"},
    {"name": "sliding_window", "display_name": "Sliding Window", "description": "Maintaining a window over a sequence"},
    {"name": "binary_search", "display_name": "Binary Search", "description": "Divide and conquer search on sorted data"},
    {"name": "linked_lists", "display_name": "Linked Lists", "description": "Node-based linear data structures"},
    {"name": "stacks", "display_name": "Stacks", "description": "LIFO data structure and applications"},
    {"name": "trees", "display_name": "Trees", "description": "Hierarchical data structures and traversals"},
    {"name": "binary_search_trees", "display_name": "Binary Search Trees", "description": "Ordered binary trees"},
    {"name": "heaps", "display_name": "Heaps", "description": "Priority queues and heap operations"},
    {"name": "graphs", "display_name": "Graphs", "description": "Nodes and edges, connectivity problems"},
    {"name": "bfs", "display_name": "BFS", "description": "Breadth-first search for shortest paths and level order"},
    {"name": "dfs", "display_name": "DFS", "description": "Depth-first search for traversal and backtracking"},
    {"name": "dynamic_programming", "display_name": "Dynamic Programming", "description": "Optimal substructure and memoization"},
    {"name": "backtracking", "display_name": "Backtracking", "description": "Explore all possibilities with pruning"},
    {"name": "greedy", "display_name": "Greedy", "description": "Locally optimal choices for global optimum"},
    {"name": "math", "display_name": "Math", "description": "Mathematical reasoning and number theory"},
]

# ---------------------------------------------------------------------------
# Problems
# ---------------------------------------------------------------------------

PROBLEMS = [
    # ── ARRAYS ──────────────────────────────────────────────────────────────
    {
        "title": "Two Sum",
        "slug": "two-sum",
        "difficulty": "easy",
        "topics": [("arrays", True), ("hash_maps", False)],
        "companies": ["google", "amazon", "meta"],
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "examples": [
            {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "nums[0] + nums[1] == 9"},
            {"input": "nums = [3,2,4], target = 6", "output": "[1,2]", "explanation": "nums[1] + nums[2] == 6"},
        ],
        "constraints": ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists"],
        "hints": [
            "Think about what data structure lets you look up values in O(1) time.",
            "For each number, you need to find if its complement (target - num) exists. How can you store numbers you've already seen?",
            "Use a hash map: for each num, check if (target - num) is already in the map. If yes, return both indices. If no, store num with its index.",
            "result = {}\nfor i, num in enumerate(nums):\n    complement = target - num\n    if complement in result:\n        return [result[complement], i]\n    result[num] = i",
        ],
    },
    {
        "title": "Best Time to Buy and Sell Stock",
        "slug": "best-time-to-buy-and-sell-stock",
        "difficulty": "easy",
        "topics": [("arrays", True)],
        "companies": ["amazon", "microsoft", "meta"],
        "description": "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
        "examples": [
            {"input": "prices = [7,1,5,3,6,4]", "output": "5", "explanation": "Buy on day 2 (price=1), sell on day 5 (price=6), profit=5"},
            {"input": "prices = [7,6,4,3,1]", "output": "0", "explanation": "No profitable transaction possible"},
        ],
        "constraints": ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
        "hints": [
            "You need to find the maximum difference between two elements where the smaller comes first.",
            "Track the minimum price seen so far as you scan left to right. At each step, compute the profit if you sold today.",
            "Keep two variables: min_price (smallest seen so far) and max_profit. For each price, update max_profit = max(max_profit, price - min_price), then update min_price.",
            "min_price = float('inf')\nmax_profit = 0\nfor price in prices:\n    max_profit = max(max_profit, price - min_price)\n    min_price = min(min_price, price)",
        ],
    },
    {
        "title": "Contains Duplicate",
        "slug": "contains-duplicate",
        "difficulty": "easy",
        "topics": [("arrays", True), ("hash_maps", False)],
        "companies": ["amazon", "google"],
        "description": "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
        "examples": [
            {"input": "nums = [1,2,3,1]", "output": "true"},
            {"input": "nums = [1,2,3,4]", "output": "false"},
        ],
        "constraints": ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
        "hints": [
            "What data structure tells you instantly if you've seen a value before?",
            "A set stores unique elements. As you iterate, check if the current element is already in the set.",
            "Add each element to a set. If the element already exists in the set before adding, return True.",
            "seen = set()\nfor num in nums:\n    if num in seen:\n        return True\n    seen.add(num)\nreturn False",
        ],
    },
    {
        "title": "Product of Array Except Self",
        "slug": "product-of-array-except-self",
        "difficulty": "medium",
        "topics": [("arrays", True)],
        "companies": ["amazon", "microsoft", "meta", "google"],
        "description": "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer. You must write an algorithm that runs in O(n) time and without using the division operation.",
        "examples": [
            {"input": "nums = [1,2,3,4]", "output": "[24,12,8,6]"},
            {"input": "nums = [-1,1,0,-3,3]", "output": "[0,0,9,0,0]"},
        ],
        "constraints": ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30", "No division allowed"],
        "hints": [
            "For each position i, the answer is (product of all elements to the left of i) × (product of all elements to the right of i).",
            "You can compute prefix products in one pass and suffix products in another pass, both in O(n).",
            "First pass: result[i] = product of all nums[0..i-1]. Second pass: multiply result[i] by product of all nums[i+1..n-1] using a running suffix product.",
            "result = [1] * len(nums)\nprefix = 1\nfor i in range(len(nums)):\n    result[i] = prefix\n    prefix *= nums[i]\nsuffix = 1\nfor i in range(len(nums)-1, -1, -1):\n    result[i] *= suffix\n    suffix *= nums[i]\nreturn result",
        ],
    },
    {
        "title": "Maximum Subarray",
        "slug": "maximum-subarray",
        "difficulty": "medium",
        "topics": [("arrays", True), ("dynamic_programming", False)],
        "companies": ["amazon", "microsoft", "google"],
        "description": "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
        "examples": [
            {"input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "output": "6", "explanation": "Subarray [4,-1,2,1] has the largest sum = 6"},
            {"input": "nums = [1]", "output": "1"},
        ],
        "constraints": ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
        "hints": [
            "Think about when it makes sense to start a new subarray vs extending the current one.",
            "If the current running sum becomes negative, it will only hurt future subarrays — reset it to 0.",
            "Kadane's algorithm: track current_sum and max_sum. At each step, current_sum = max(num, current_sum + num). Update max_sum = max(max_sum, current_sum).",
            "max_sum = nums[0]\ncurrent_sum = nums[0]\nfor num in nums[1:]:\n    current_sum = max(num, current_sum + num)\n    max_sum = max(max_sum, current_sum)\nreturn max_sum",
        ],
    },

    # ── TWO POINTERS ─────────────────────────────────────────────────���───────
    {
        "title": "Valid Palindrome",
        "slug": "valid-palindrome",
        "difficulty": "easy",
        "topics": [("two_pointers", True), ("strings", False)],
        "companies": ["meta", "microsoft"],
        "description": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string s, return true if it is a palindrome, or false otherwise.",
        "examples": [
            {"input": 's = "A man, a plan, a canal: Panama"', "output": "true"},
            {"input": 's = "race a car"', "output": "false"},
        ],
        "constraints": ["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters"],
        "hints": [
            "Clean the string first, or use two pointers that skip non-alphanumeric characters.",
            "Place one pointer at the start and one at the end. Move them toward each other, skipping non-alphanumeric chars, comparing characters as you go.",
            "While left < right: skip non-alphanumeric on both sides, then compare lowercased chars. If they differ, return False. If they match, move both pointers inward.",
            "left, right = 0, len(s) - 1\nwhile left < right:\n    while left < right and not s[left].isalnum(): left += 1\n    while left < right and not s[right].isalnum(): right -= 1\n    if s[left].lower() != s[right].lower(): return False\n    left += 1; right -= 1\nreturn True",
        ],
    },
    {
        "title": "3Sum",
        "slug": "3sum",
        "difficulty": "medium",
        "topics": [("two_pointers", True), ("arrays", False)],
        "companies": ["amazon", "google", "meta"],
        "description": "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. Notice that the solution set must not contain duplicate triplets.",
        "examples": [
            {"input": "nums = [-1,0,1,2,-1,-4]", "output": "[[-1,-1,2],[-1,0,1]]"},
            {"input": "nums = [0,1,1]", "output": "[]"},
        ],
        "constraints": ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
        "hints": [
            "Sorting the array first makes duplicate handling and the two-pointer approach much easier.",
            "Fix one element at a time (the outer loop). For the remaining two, use two pointers on the sorted subarray to find pairs that sum to the negative of the fixed element.",
            "Sort nums. For each i, use left=i+1 and right=n-1. Move pointers based on whether the sum is too small or too large. Skip duplicates carefully.",
            "nums.sort()\nresult = []\nfor i in range(len(nums)-2):\n    if i > 0 and nums[i] == nums[i-1]: continue\n    left, right = i+1, len(nums)-1\n    while left < right:\n        s = nums[i]+nums[left]+nums[right]\n        if s == 0:\n            result.append([nums[i],nums[left],nums[right]])\n            while left < right and nums[left]==nums[left+1]: left+=1\n            while left < right and nums[right]==nums[right-1]: right-=1\n            left+=1; right-=1\n        elif s < 0: left+=1\n        else: right-=1\nreturn result",
        ],
    },
    {
        "title": "Container With Most Water",
        "slug": "container-with-most-water",
        "difficulty": "medium",
        "topics": [("two_pointers", True), ("arrays", False)],
        "companies": ["amazon", "google", "bloomberg"],
        "description": "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.",
        "examples": [
            {"input": "height = [1,8,6,2,5,4,8,3,7]", "output": "49"},
            {"input": "height = [1,1]", "output": "1"},
        ],
        "constraints": ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
        "hints": [
            "The area is determined by the shorter of the two lines multiplied by the distance between them.",
            "Start with the widest possible container (pointers at both ends). Which pointer should you move to potentially find a larger area?",
            "Always move the pointer pointing to the shorter line inward. Moving the taller one can never increase area (width decreases, height bounded by the shorter).",
            "left, right = 0, len(height)-1\nmax_water = 0\nwhile left < right:\n    water = min(height[left], height[right]) * (right - left)\n    max_water = max(max_water, water)\n    if height[left] < height[right]: left += 1\n    else: right -= 1\nreturn max_water",
        ],
    },

    # ── SLIDING WINDOW ───────────────────────────────────────────────────────
    {
        "title": "Best Time to Buy and Sell Stock II",
        "slug": "best-time-to-buy-and-sell-stock-ii",
        "difficulty": "medium",
        "topics": [("sliding_window", False), ("arrays", True), ("greedy", False)],
        "companies": ["amazon", "microsoft"],
        "description": "You are given an integer array prices where prices[i] is the price of a given stock on the ith day. On each day, you may decide to buy and/or sell the stock. You can only hold at most one share of the stock at any time. However, you can buy it then immediately sell it on the same day. Find and return the maximum profit you can achieve.",
        "examples": [
            {"input": "prices = [7,1,5,3,6,4]", "output": "7", "explanation": "Buy day 2 sell day 3 (profit 4) + buy day 4 sell day 5 (profit 3) = 7"},
            {"input": "prices = [1,2,3,4,5]", "output": "4"},
        ],
        "constraints": ["1 <= prices.length <= 3 * 10^4", "0 <= prices[i] <= 10^4"],
        "hints": [
            "Unlike the single transaction version, you can make as many transactions as you want.",
            "Every upward movement in price is a profit opportunity. What's the simplest way to capture all upward movements?",
            "Add prices[i] - prices[i-1] to profit whenever it's positive. This captures every upward move.",
            "profit = 0\nfor i in range(1, len(prices)):\n    if prices[i] > prices[i-1]:\n        profit += prices[i] - prices[i-1]\nreturn profit",
        ],
    },
    {
        "title": "Longest Substring Without Repeating Characters",
        "slug": "longest-substring-without-repeating-characters",
        "difficulty": "medium",
        "topics": [("sliding_window", True), ("strings", False), ("hash_maps", False)],
        "companies": ["amazon", "google", "microsoft", "meta"],
        "description": "Given a string s, find the length of the longest substring without repeating characters.",
        "examples": [
            {"input": 's = "abcabcbb"', "output": "3", "explanation": 'Substring "abc" has length 3'},
            {"input": 's = "bbbbb"', "output": "1"},
        ],
        "constraints": ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces"],
        "hints": [
            "Think about maintaining a window of characters with no duplicates. What happens when you encounter a duplicate?",
            "Use two pointers (left, right) to define the window. When a duplicate enters the window, shrink from the left.",
            "Use a hash map to track the last seen index of each character. When s[right] was last seen at index i >= left, jump left to i+1.",
            "char_index = {}\nleft = max_len = 0\nfor right, char in enumerate(s):\n    if char in char_index and char_index[char] >= left:\n        left = char_index[char] + 1\n    char_index[char] = right\n    max_len = max(max_len, right - left + 1)\nreturn max_len",
        ],
    },
    {
        "title": "Minimum Window Substring",
        "slug": "minimum-window-substring",
        "difficulty": "hard",
        "topics": [("sliding_window", True), ("strings", False), ("hash_maps", False)],
        "companies": ["meta", "google", "amazon", "microsoft"],
        "description": "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string.",
        "examples": [
            {"input": 's = "ADOBECODEBANC", t = "ABC"', "output": '"BANC"'},
            {"input": 's = "a", t = "a"', "output": '"a"'},
        ],
        "constraints": ["m == s.length", "n == t.length", "1 <= m, n <= 10^5"],
        "hints": [
            "Use a sliding window. Expand the right pointer until you have all required characters, then shrink from the left.",
            "Track character frequencies in t using a hash map. Track how many distinct characters from t are currently satisfied in the window.",
            "Expand right until all t chars are covered (have_count == need_count). Then shrink left while the window is still valid, updating the minimum window.",
            "from collections import Counter\nneed = Counter(t)\nhave, need_count = {}, len(need)\nleft = res_len = float('inf')\nres = (-1, -1)\nfor right, c in enumerate(s):\n    have[c] = have.get(c, 0) + 1\n    if c in need and have[c] == need[c]: have_count += 1\n    while have_count == need_count:\n        if right-left+1 < res_len:\n            res = (left, right); res_len = right-left+1\n        have[s[left]] -= 1\n        if s[left] in need and have[s[left]] < need[s[left]]: have_count -= 1\n        left += 1\nreturn '' if res_len == float('inf') else s[res[0]:res[1]+1]",
        ],
    },

    # ── BINARY SEARCH ────────────────────────────────────────────────────────
    {
        "title": "Binary Search",
        "slug": "binary-search",
        "difficulty": "easy",
        "topics": [("binary_search", True)],
        "companies": ["google", "amazon"],
        "description": "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.",
        "examples": [
            {"input": "nums = [-1,0,3,5,9,12], target = 9", "output": "4"},
            {"input": "nums = [-1,0,3,5,9,12], target = 2", "output": "-1"},
        ],
        "constraints": ["1 <= nums.length <= 10^4", "All integers in nums are unique", "nums is sorted in ascending order"],
        "hints": [
            "The array is sorted. How can you eliminate half the elements at each step?",
            "Compare target with the middle element. If equal, return mid. If target is smaller, search the left half. If larger, search the right half.",
            "Maintain left and right boundaries. Compute mid = (left + right) // 2. Adjust boundaries based on comparison until left > right.",
            "left, right = 0, len(nums) - 1\nwhile left <= right:\n    mid = (left + right) // 2\n    if nums[mid] == target: return mid\n    elif nums[mid] < target: left = mid + 1\n    else: right = mid - 1\nreturn -1",
        ],
    },
    {
        "title": "Search in Rotated Sorted Array",
        "slug": "search-in-rotated-sorted-array",
        "difficulty": "medium",
        "topics": [("binary_search", True), ("arrays", False)],
        "companies": ["amazon", "microsoft", "google", "meta"],
        "description": "There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k. Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.",
        "examples": [
            {"input": "nums = [4,5,6,7,0,1,2], target = 0", "output": "4"},
            {"input": "nums = [4,5,6,7,0,1,2], target = 3", "output": "-1"},
        ],
        "constraints": ["1 <= nums.length <= 5000", "All values of nums are unique"],
        "hints": [
            "Even though the array is rotated, at least one half of the array is always sorted at any given mid point.",
            "At each mid point, determine which half is sorted. Then check if target falls within the sorted half's range to decide which half to search.",
            "If nums[left] <= nums[mid], left half is sorted. Check if target is in [nums[left], nums[mid]]. Otherwise check the right half's sorted portion.",
            "left, right = 0, len(nums)-1\nwhile left <= right:\n    mid = (left+right)//2\n    if nums[mid] == target: return mid\n    if nums[left] <= nums[mid]:\n        if nums[left] <= target < nums[mid]: right = mid-1\n        else: left = mid+1\n    else:\n        if nums[mid] < target <= nums[right]: left = mid+1\n        else: right = mid-1\nreturn -1",
        ],
    },
    {
        "title": "Find Minimum in Rotated Sorted Array",
        "slug": "find-minimum-in-rotated-sorted-array",
        "difficulty": "medium",
        "topics": [("binary_search", True), ("arrays", False)],
        "companies": ["microsoft", "amazon"],
        "description": "Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Given the sorted rotated array nums of unique elements, return the minimum element of this array. You must write an algorithm that runs in O(log n) time.",
        "examples": [
            {"input": "nums = [3,4,5,1,2]", "output": "1"},
            {"input": "nums = [4,5,6,7,0,1,2]", "output": "0"},
        ],
        "constraints": ["n == nums.length", "1 <= n <= 5000", "All integers are unique"],
        "hints": [
            "The minimum is at the rotation point. How does comparing nums[mid] with nums[right] tell you which side the minimum is on?",
            "If nums[mid] > nums[right], the minimum is in the right half. If nums[mid] < nums[right], the minimum is in the left half (including mid).",
            "Binary search: if nums[mid] > nums[right], left = mid + 1. Else right = mid. When left == right, that's the minimum.",
            "left, right = 0, len(nums)-1\nwhile left < right:\n    mid = (left+right)//2\n    if nums[mid] > nums[right]: left = mid+1\n    else: right = mid\nreturn nums[left]",
        ],
    },

    # ── LINKED LISTS ─────────────────────────────────────────────────────────
    {
        "title": "Reverse Linked List",
        "slug": "reverse-linked-list",
        "difficulty": "easy",
        "topics": [("linked_lists", True)],
        "companies": ["amazon", "microsoft", "meta"],
        "description": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        "examples": [
            {"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]"},
            {"input": "head = [1,2]", "output": "[2,1]"},
        ],
        "constraints": ["The number of nodes in the list is the range [0, 5000]", "-5000 <= Node.val <= 5000"],
        "hints": [
            "You need to change the direction of each pointer. What three things do you need to track at each step?",
            "Track prev (starts as None), curr (starts as head), and next_node. At each step: save next, point curr.next to prev, advance prev and curr.",
            "Iterate through the list. For each node: save curr.next, set curr.next = prev, move prev to curr, move curr to saved next.",
            "prev, curr = None, head\nwhile curr:\n    next_node = curr.next\n    curr.next = prev\n    prev = curr\n    curr = next_node\nreturn prev",
        ],
    },
    {
        "title": "Merge Two Sorted Lists",
        "slug": "merge-two-sorted-lists",
        "difficulty": "easy",
        "topics": [("linked_lists", True)],
        "companies": ["amazon", "microsoft", "google"],
        "description": "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
        "examples": [
            {"input": "list1 = [1,2,4], list2 = [1,3,4]", "output": "[1,1,2,3,4,4]"},
            {"input": "list1 = [], list2 = []", "output": "[]"},
        ],
        "constraints": ["The number of nodes in both lists is in the range [0, 50]"],
        "hints": [
            "Use a dummy head node to simplify edge cases. Compare the current nodes of both lists and append the smaller one.",
            "Maintain a current pointer. At each step, compare list1.val and list2.val. Attach the smaller node to current.next, advance that list's pointer.",
            "Use a dummy node as the start. While both lists are non-empty, pick the smaller head and attach it. When one list is exhausted, attach the remaining list.",
            "dummy = ListNode(0)\ncurr = dummy\nwhile list1 and list2:\n    if list1.val <= list2.val:\n        curr.next = list1; list1 = list1.next\n    else:\n        curr.next = list2; list2 = list2.next\n    curr = curr.next\ncurr.next = list1 or list2\nreturn dummy.next",
        ],
    },
    {
        "title": "Linked List Cycle",
        "slug": "linked-list-cycle",
        "difficulty": "easy",
        "topics": [("linked_lists", True), ("two_pointers", False)],
        "companies": ["amazon", "microsoft"],
        "description": "Given head, the head of a linked list, determine if the linked list has a cycle in it. Return true if there is a cycle in the linked list, otherwise, return false.",
        "examples": [
            {"input": "head = [3,2,0,-4], pos = 1", "output": "true"},
            {"input": "head = [1,2], pos = 0", "output": "true"},
        ],
        "constraints": ["The number of the nodes in the list is in the range [0, 10^4]"],
        "hints": [
            "Can you detect a cycle without extra space? Think about two pointers moving at different speeds.",
            "Floyd's algorithm: use a slow pointer (moves 1 step) and a fast pointer (moves 2 steps). If there's a cycle, they'll eventually meet.",
            "Initialize both pointers to head. Move slow by 1 and fast by 2 each iteration. If fast reaches None, no cycle. If slow == fast, cycle detected.",
            "slow = fast = head\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next\n    if slow == fast: return True\nreturn False",
        ],
    },
    {
        "title": "Remove Nth Node From End of List",
        "slug": "remove-nth-node-from-end-of-list",
        "difficulty": "medium",
        "topics": [("linked_lists", True), ("two_pointers", False)],
        "companies": ["amazon", "microsoft", "google"],
        "description": "Given the head of a linked list, remove the nth node from the end of the list and return its head.",
        "examples": [
            {"input": "head = [1,2,3,4,5], n = 2", "output": "[1,2,3,5]"},
            {"input": "head = [1], n = 1", "output": "[]"},
        ],
        "constraints": ["The number of nodes in the list is sz", "1 <= sz <= 30", "1 <= n <= sz"],
        "hints": [
            "To find the nth from end in one pass, try using two pointers with a gap of n between them.",
            "Advance the first pointer n steps ahead. Then move both pointers together. When the first reaches the end, the second is at the node to remove.",
            "Use a dummy node before head. Move fast n+1 steps from dummy. Then move both slow and fast until fast is None. slow.next is the node to remove.",
            "dummy = ListNode(0, head)\nslow = fast = dummy\nfor _ in range(n+1): fast = fast.next\nwhile fast:\n    slow = slow.next\n    fast = fast.next\nslow.next = slow.next.next\nreturn dummy.next",
        ],
    },

    # ── STACKS ───────────────────────────────────────────────────────────────
    {
        "title": "Valid Parentheses",
        "slug": "valid-parentheses",
        "difficulty": "easy",
        "topics": [("stacks", True), ("strings", False)],
        "companies": ["google", "amazon", "meta", "microsoft"],
        "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: open brackets are closed by the same type of brackets, and open brackets are closed in the correct order.",
        "examples": [
            {"input": 's = "()"', "output": "true"},
            {"input": 's = "()[]{}"', "output": "true"},
            {"input": 's = "(]"', "output": "false"},
        ],
        "constraints": ["1 <= s.length <= 10^4", "s consists of parentheses only"],
        "hints": [
            "What data structure naturally handles matching the most recently opened bracket?",
            "A stack is perfect here. Push open brackets. When you see a closing bracket, check if it matches the top of the stack.",
            "Use a stack. For opening brackets, push them. For closing brackets, pop from stack and verify it matches the corresponding opener. Empty stack at end = valid.",
            "stack = []\nmapping = {')': '(', '}': '{', ']': '['}\nfor char in s:\n    if char in mapping:\n        top = stack.pop() if stack else '#'\n        if mapping[char] != top: return False\n    else:\n        stack.append(char)\nreturn not stack",
        ],
    },
    {
        "title": "Daily Temperatures",
        "slug": "daily-temperatures",
        "difficulty": "medium",
        "topics": [("stacks", True), ("arrays", False)],
        "companies": ["amazon", "google"],
        "description": "Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day for which this is possible, keep answer[i] == 0 instead.",
        "examples": [
            {"input": "temperatures = [73,74,75,71,69,72,76,73]", "output": "[1,1,4,2,1,1,0,0]"},
            {"input": "temperatures = [30,40,50,60]", "output": "[1,1,1,0]"},
        ],
        "constraints": ["1 <= temperatures.length <= 10^5", "30 <= temperatures[i] <= 100"],
        "hints": [
            "For each day, you need the next day with a higher temperature. A monotonic stack can help find the 'next greater element'.",
            "Use a stack of indices. Push index i if no warmer day found yet. When you find a warmer day at j, pop all indices from the stack where temperatures[index] < temperatures[j].",
            "Maintain a decreasing monotonic stack of indices. For each index j: while stack and temps[j] > temps[stack[-1]], pop index i, set result[i] = j - i.",
            "result = [0] * len(temperatures)\nstack = []\nfor j, temp in enumerate(temperatures):\n    while stack and temp > temperatures[stack[-1]]:\n        i = stack.pop()\n        result[i] = j - i\n    stack.append(j)\nreturn result",
        ],
    },

    # ── TREES ────────────────────────────────────────────────────────────────
    {
        "title": "Maximum Depth of Binary Tree",
        "slug": "maximum-depth-of-binary-tree",
        "difficulty": "easy",
        "topics": [("trees", True), ("dfs", False)],
        "companies": ["amazon", "google", "microsoft"],
        "description": "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
        "examples": [
            {"input": "root = [3,9,20,null,null,15,7]", "output": "3"},
            {"input": "root = [1,null,2]", "output": "2"},
        ],
        "constraints": ["The number of nodes in the tree is in the range [0, 10^4]"],
        "hints": [
            "Think recursively: the depth of a tree is 1 + the depth of its deeper subtree.",
            "Base case: if node is None, depth is 0. Recursive case: 1 + max(depth(left), depth(right)).",
            "DFS recursion: return 0 for None, else return 1 + max(maxDepth(root.left), maxDepth(root.right)).",
            "def maxDepth(root):\n    if not root: return 0\n    return 1 + max(maxDepth(root.left), maxDepth(root.right))",
        ],
    },
    {
        "title": "Invert Binary Tree",
        "slug": "invert-binary-tree",
        "difficulty": "easy",
        "topics": [("trees", True), ("dfs", False)],
        "companies": ["google", "amazon"],
        "description": "Given the root of a binary tree, invert the tree, and return its root.",
        "examples": [
            {"input": "root = [4,2,7,1,3,6,9]", "output": "[4,7,2,9,6,3,1]"},
            {"input": "root = [2,1,3]", "output": "[2,3,1]"},
        ],
        "constraints": ["The number of nodes in the tree is in the range [0, 100]"],
        "hints": [
            "Think recursively: inverting a tree means swapping left and right children at every node.",
            "Base case: None node returns None. For each node: swap its left and right children, then recursively invert both subtrees.",
            "For each node, swap root.left and root.right, then call invert on both children.",
            "def invertTree(root):\n    if not root: return None\n    root.left, root.right = root.right, root.left\n    invertTree(root.left)\n    invertTree(root.right)\n    return root",
        ],
    },
    {
        "title": "Same Tree",
        "slug": "same-tree",
        "difficulty": "easy",
        "topics": [("trees", True), ("dfs", False)],
        "companies": ["amazon", "microsoft"],
        "description": "Given the roots of two binary trees p and q, write a function to check if they are the same or not. Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.",
        "examples": [
            {"input": "p = [1,2,3], q = [1,2,3]", "output": "true"},
            {"input": "p = [1,2], q = [1,null,2]", "output": "false"},
        ],
        "constraints": ["The number of nodes in both trees is in the range [0, 100]"],
        "hints": [
            "Two trees are the same if their roots are equal and their subtrees are the same.",
            "Base cases: both None → True. One None → False. Values differ → False. Recursive: check left subtrees AND right subtrees.",
            "Recursively check: if both None return True, if one None return False, if values differ return False, else return isSameTree(p.left,q.left) and isSameTree(p.right,q.right).",
            "def isSameTree(p, q):\n    if not p and not q: return True\n    if not p or not q: return False\n    if p.val != q.val: return False\n    return isSameTree(p.left, q.left) and isSameTree(p.right, q.right)",
        ],
    },
    {
        "title": "Binary Tree Level Order Traversal",
        "slug": "binary-tree-level-order-traversal",
        "difficulty": "medium",
        "topics": [("trees", True), ("bfs", False)],
        "companies": ["amazon", "microsoft", "google", "meta"],
        "description": "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
        "examples": [
            {"input": "root = [3,9,20,null,null,15,7]", "output": "[[3],[9,20],[15,7]]"},
            {"input": "root = [1]", "output": "[[1]]"},
        ],
        "constraints": ["The number of nodes in the tree is in the range [0, 2000]"],
        "hints": [
            "Level order means processing nodes level by level. What data structure is designed for level-by-level processing?",
            "A queue (BFS) naturally processes nodes level by level. At each level, process all nodes currently in the queue before adding their children.",
            "Use a deque. Start with root. For each level: record queue size, process that many nodes, append their values, add their children to the queue.",
            "from collections import deque\nif not root: return []\nresult, queue = [], deque([root])\nwhile queue:\n    level = []\n    for _ in range(len(queue)):\n        node = queue.popleft()\n        level.append(node.val)\n        if node.left: queue.append(node.left)\n        if node.right: queue.append(node.right)\n    result.append(level)\nreturn result",
        ],
    },
    {
        "title": "Validate Binary Search Tree",
        "slug": "validate-binary-search-tree",
        "difficulty": "medium",
        "topics": [("binary_search_trees", True), ("trees", False), ("dfs", False)],
        "companies": ["amazon", "microsoft", "google"],
        "description": "Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST: left subtree has only nodes with keys less than the node's key, right subtree has only nodes with keys greater than the node's key, both subtrees must also be valid BSTs.",
        "examples": [
            {"input": "root = [2,1,3]", "output": "true"},
            {"input": "root = [5,1,4,null,null,3,6]", "output": "false"},
        ],
        "constraints": ["The number of nodes in the tree is in the range [1, 10^4]"],
        "hints": [
            "Checking only parent-child relationship isn't enough. A node must satisfy constraints from all its ancestors.",
            "Pass down valid ranges (min, max) as you recurse. Each node must fall strictly within its valid range.",
            "Recursive helper with (node, min_val, max_val): return False if node.val <= min_val or node.val >= max_val. Recurse left with max=node.val, right with min=node.val.",
            "def isValid(node, min_val, max_val):\n    if not node: return True\n    if node.val <= min_val or node.val >= max_val: return False\n    return isValid(node.left, min_val, node.val) and isValid(node.right, node.val, max_val)\nreturn isValid(root, float('-inf'), float('inf'))",
        ],
    },
    {
        "title": "Lowest Common Ancestor of BST",
        "slug": "lowest-common-ancestor-of-a-binary-search-tree",
        "difficulty": "medium",
        "topics": [("binary_search_trees", True), ("trees", False)],
        "companies": ["amazon", "microsoft", "meta"],
        "description": "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes p and q in the BST. The LCA is defined as the lowest node in T that has both p and q as descendants.",
        "examples": [
            {"input": "root = [6,2,8,0,4,7,9], p = 2, q = 8", "output": "6"},
            {"input": "root = [6,2,8,0,4,7,9], p = 2, q = 4", "output": "2"},
        ],
        "constraints": ["All Node.val are unique", "p != q", "p and q will exist in the BST"],
        "hints": [
            "Use the BST property: if both p and q are less than current node, LCA is in the left subtree. If both greater, it's in the right subtree.",
            "The split point is the LCA. When p and q are on different sides (or one equals current), current node is the LCA.",
            "While True: if both p.val and q.val < node.val, go left. If both greater, go right. Otherwise, return current node.",
            "while root:\n    if p.val < root.val and q.val < root.val:\n        root = root.left\n    elif p.val > root.val and q.val > root.val:\n        root = root.right\n    else:\n        return root",
        ],
    },

    # ── HEAPS ────────────────────────────────────────────────────────────────
    {
        "title": "Kth Largest Element in an Array",
        "slug": "kth-largest-element-in-an-array",
        "difficulty": "medium",
        "topics": [("heaps", True), ("arrays", False)],
        "companies": ["amazon", "microsoft", "google", "meta"],
        "description": "Given an integer array nums and an integer k, return the kth largest element in the array. Note that it is the kth largest element in the sorted order, not the kth distinct element.",
        "examples": [
            {"input": "nums = [3,2,1,5,6,4], k = 2", "output": "5"},
            {"input": "nums = [3,2,3,1,2,4,5,5,6], k = 4", "output": "4"},
        ],
        "constraints": ["1 <= k <= nums.length <= 10^5"],
        "hints": [
            "Sorting works but is O(n log n). Can you do better using a heap of size k?",
            "A min-heap of size k always keeps the k largest elements seen so far. The root is the kth largest.",
            "Maintain a min-heap of size k. For each element: push it. If heap size exceeds k, pop the smallest. After processing all elements, heap[0] is the answer.",
            "import heapq\nheap = []\nfor num in nums:\n    heapq.heappush(heap, num)\n    if len(heap) > k:\n        heapq.heappop(heap)\nreturn heap[0]",
        ],
    },
    {
        "title": "Top K Frequent Elements",
        "slug": "top-k-frequent-elements",
        "difficulty": "medium",
        "topics": [("heaps", True), ("hash_maps", False), ("arrays", False)],
        "companies": ["amazon", "google", "meta"],
        "description": "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.",
        "examples": [
            {"input": "nums = [1,1,1,2,2,3], k = 2", "output": "[1,2]"},
            {"input": "nums = [1], k = 1", "output": "[1]"},
        ],
        "constraints": ["1 <= nums.length <= 10^5", "k is in the range [1, the number of unique elements]"],
        "hints": [
            "First count frequencies with a hash map. Then find the k elements with the highest frequencies.",
            "Use a min-heap of size k on (frequency, element) pairs. At the end, all elements in the heap are the top-k frequent.",
            "Count with Counter. Use heapq.nlargest(k, count.keys(), key=count.get) — or manually maintain a size-k min-heap.",
            "from collections import Counter\nimport heapq\ncount = Counter(nums)\nreturn heapq.nlargest(k, count.keys(), key=count.get)",
        ],
    },

    # ── GRAPHS ───────────────────────────────────────────────────────────────
    {
        "title": "Number of Islands",
        "slug": "number-of-islands",
        "difficulty": "medium",
        "topics": [("graphs", True), ("dfs", False), ("bfs", False)],
        "companies": ["amazon", "google", "microsoft", "meta"],
        "description": "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
        "examples": [
            {"input": 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', "output": "1"},
            {"input": 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', "output": "3"},
        ],
        "constraints": ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300"],
        "hints": [
            "Each time you find unvisited land ('1'), it's a new island. How do you mark all connected land as visited?",
            "Use DFS or BFS from each unvisited land cell. Mark visited cells as '0' (or use a visited set) to avoid counting them again.",
            "Iterate the grid. When grid[r][c] == '1': increment count, then DFS to mark all connected '1's as '0'.",
            "def dfs(r, c):\n    if r<0 or c<0 or r>=len(grid) or c>=len(grid[0]) or grid[r][c]!='1': return\n    grid[r][c]='0'\n    dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1)\ncount=0\nfor r in range(len(grid)):\n    for c in range(len(grid[0])):\n        if grid[r][c]=='1': count+=1; dfs(r,c)\nreturn count",
        ],
    },
    {
        "title": "Clone Graph",
        "slug": "clone-graph",
        "difficulty": "medium",
        "topics": [("graphs", True), ("dfs", False), ("bfs", False), ("hash_maps", False)],
        "companies": ["amazon", "microsoft", "meta"],
        "description": "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node contains a value and a list of its neighbors.",
        "examples": [
            {"input": "adjList = [[2,4],[1,3],[2,4],[1,3]]", "output": "[[2,4],[1,3],[2,4],[1,3]]"},
        ],
        "constraints": ["The number of nodes in the graph is in the range [0, 100]"],
        "hints": [
            "You need to create new nodes while preserving the same structure. How do you avoid infinite loops in cyclic graphs?",
            "Use a hash map from original node → cloned node as a visited cache. Before creating a new clone, check if it's already been cloned.",
            "DFS with a visited map. For each node: if already in visited, return its clone. Otherwise create a new node, add to visited, then recursively clone all neighbors.",
            "visited = {}\ndef dfs(node):\n    if node in visited: return visited[node]\n    clone = Node(node.val)\n    visited[node] = clone\n    for neighbor in node.neighbors:\n        clone.neighbors.append(dfs(neighbor))\n    return clone\nreturn dfs(node) if node else None",
        ],
    },
    {
        "title": "Course Schedule",
        "slug": "course-schedule",
        "difficulty": "medium",
        "topics": [("graphs", True), ("dfs", False)],
        "companies": ["amazon", "google", "microsoft", "meta"],
        "description": "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi before course ai. Return true if you can finish all courses. Otherwise, return false.",
        "examples": [
            {"input": "numCourses = 2, prerequisites = [[1,0]]", "output": "true"},
            {"input": "numCourses = 2, prerequisites = [[1,0],[0,1]]", "output": "false"},
        ],
        "constraints": ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= 5000"],
        "hints": [
            "This is a cycle detection problem in a directed graph. If there's a cycle, you can't finish all courses.",
            "Build an adjacency list. Use DFS with three states per node: unvisited, visiting (in current path), visited (fully processed).",
            "DFS cycle detection: mark node as 'visiting'. If you reach a 'visiting' node, cycle found. After exploring all neighbors, mark as 'visited'.",
            "graph = [[] for _ in range(numCourses)]\nfor a, b in prerequisites: graph[b].append(a)\nstate = [0] * numCourses  # 0=unvisited, 1=visiting, 2=visited\ndef dfs(node):\n    if state[node] == 1: return False\n    if state[node] == 2: return True\n    state[node] = 1\n    for nei in graph[node]:\n        if not dfs(nei): return False\n    state[node] = 2\n    return True\nreturn all(dfs(i) for i in range(numCourses))",
        ],
    },

    # ── DYNAMIC PROGRAMMING ──────────────────────────────────────────────────
    {
        "title": "Climbing Stairs",
        "slug": "climbing-stairs",
        "difficulty": "easy",
        "topics": [("dynamic_programming", True)],
        "companies": ["amazon", "google", "microsoft"],
        "description": "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        "examples": [
            {"input": "n = 2", "output": "2", "explanation": "1+1 or 2"},
            {"input": "n = 3", "output": "3", "explanation": "1+1+1, 1+2, 2+1"},
        ],
        "constraints": ["1 <= n <= 45"],
        "hints": [
            "To reach step n, you came from either step n-1 or step n-2. How does this relate to a well-known sequence?",
            "ways(n) = ways(n-1) + ways(n-2). Base cases: ways(1) = 1, ways(2) = 2. This is the Fibonacci sequence.",
            "You only need the previous two values, so you don't need an array. Use two variables and iterate.",
            "if n <= 2: return n\nprev2, prev1 = 1, 2\nfor _ in range(3, n+1):\n    prev2, prev1 = prev1, prev1 + prev2\nreturn prev1",
        ],
    },
    {
        "title": "House Robber",
        "slug": "house-robber",
        "difficulty": "medium",
        "topics": [("dynamic_programming", True)],
        "companies": ["amazon", "google", "microsoft"],
        "description": "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have security systems connected, so you cannot rob two adjacent houses. Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
        "examples": [
            {"input": "nums = [1,2,3,1]", "output": "4", "explanation": "Rob house 1 (money=1) then house 3 (money=3)"},
            {"input": "nums = [2,7,9,3,1]", "output": "12"},
        ],
        "constraints": ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
        "hints": [
            "At each house, you have two choices: rob it (and can't rob previous) or skip it (take the best from previous).",
            "dp[i] = max money robbing up to house i. dp[i] = max(dp[i-1], dp[i-2] + nums[i]).",
            "You only need the previous two dp values. Use two variables: prev2 (best up to i-2) and prev1 (best up to i-1).",
            "prev2, prev1 = 0, 0\nfor num in nums:\n    prev2, prev1 = prev1, max(prev1, prev2 + num)\nreturn prev1",
        ],
    },
    {
        "title": "Coin Change",
        "slug": "coin-change",
        "difficulty": "medium",
        "topics": [("dynamic_programming", True)],
        "companies": ["amazon", "google", "microsoft", "meta"],
        "description": "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.",
        "examples": [
            {"input": "coins = [1,2,5], amount = 11", "output": "3", "explanation": "11 = 5 + 5 + 1"},
            {"input": "coins = [2], amount = 3", "output": "-1"},
        ],
        "constraints": ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
        "hints": [
            "Think bottom-up: what's the minimum coins needed for every amount from 0 to target?",
            "dp[i] = minimum coins to make amount i. For each amount, try every coin: if coin <= i, dp[i] = min(dp[i], dp[i-coin] + 1).",
            "Initialize dp[0]=0, everything else=infinity. For each amount 1 to target, try each coin and take the minimum.",
            "dp = [float('inf')] * (amount + 1)\ndp[0] = 0\nfor i in range(1, amount + 1):\n    for coin in coins:\n        if coin <= i:\n            dp[i] = min(dp[i], dp[i-coin] + 1)\nreturn dp[amount] if dp[amount] != float('inf') else -1",
        ],
    },
    {
        "title": "Longest Common Subsequence",
        "slug": "longest-common-subsequence",
        "difficulty": "medium",
        "topics": [("dynamic_programming", True), ("strings", False)],
        "companies": ["amazon", "google", "microsoft"],
        "description": "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0. A subsequence is a sequence derived by deleting some (or no) elements without changing the relative order.",
        "examples": [
            {"input": 'text1 = "abcde", text2 = "ace"', "output": "3", "explanation": 'LCS is "ace"'},
            {"input": 'text1 = "abc", text2 = "abc"', "output": "3"},
        ],
        "constraints": ["1 <= text1.length, text2.length <= 1000"],
        "hints": [
            "Build a 2D DP table where dp[i][j] represents the LCS of the first i chars of text1 and first j chars of text2.",
            "If text1[i-1] == text2[j-1]: dp[i][j] = dp[i-1][j-1] + 1. Else: dp[i][j] = max(dp[i-1][j], dp[i][j-1]).",
            "Initialize a (m+1) x (n+1) table of zeros. Fill row by row using the recurrence. Return dp[m][n].",
            "m, n = len(text1), len(text2)\ndp = [[0]*(n+1) for _ in range(m+1)]\nfor i in range(1, m+1):\n    for j in range(1, n+1):\n        if text1[i-1] == text2[j-1]:\n            dp[i][j] = dp[i-1][j-1] + 1\n        else:\n            dp[i][j] = max(dp[i-1][j], dp[i][j-1])\nreturn dp[m][n]",
        ],
    },
    {
        "title": "Word Break",
        "slug": "word-break",
        "difficulty": "medium",
        "topics": [("dynamic_programming", True), ("strings", False)],
        "companies": ["amazon", "google", "meta", "microsoft"],
        "description": "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.",
        "examples": [
            {"input": 's = "leetcode", wordDict = ["leet","code"]', "output": "true"},
            {"input": 's = "applepenapple", wordDict = ["apple","pen"]', "output": "true"},
        ],
        "constraints": ["1 <= s.length <= 300", "1 <= wordDict.length <= 1000"],
        "hints": [
            "dp[i] = True if s[:i] can be segmented. Build this from left to right.",
            "For each position i, check all positions j < i: if dp[j] is True and s[j:i] is in the dictionary, then dp[i] = True.",
            "Initialize dp[0] = True (empty string). For each i from 1 to len(s): for each j from 0 to i: if dp[j] and s[j:i] in word_set: dp[i] = True.",
            "word_set = set(wordDict)\ndp = [False] * (len(s)+1)\ndp[0] = True\nfor i in range(1, len(s)+1):\n    for j in range(i):\n        if dp[j] and s[j:i] in word_set:\n            dp[i] = True\n            break\nreturn dp[len(s)]",
        ],
    },
    {
        "title": "Longest Increasing Subsequence",
        "slug": "longest-increasing-subsequence",
        "difficulty": "medium",
        "topics": [("dynamic_programming", True), ("binary_search", False)],
        "companies": ["amazon", "microsoft", "google"],
        "description": "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
        "examples": [
            {"input": "nums = [10,9,2,5,3,7,101,18]", "output": "4", "explanation": "LIS is [2,3,7,101]"},
            {"input": "nums = [0,1,0,3,2,3]", "output": "4"},
        ],
        "constraints": ["1 <= nums.length <= 2500", "-10^4 <= nums[i] <= 10^4"],
        "hints": [
            "dp[i] = length of LIS ending at index i. For each i, look at all j < i where nums[j] < nums[i].",
            "dp[i] = 1 + max(dp[j] for j < i where nums[j] < nums[i]). Base case: dp[i] = 1.",
            "O(n²) DP: for each i, scan all j < i. O(n log n) is possible with binary search on a 'tails' array.",
            "dp = [1] * len(nums)\nfor i in range(1, len(nums)):\n    for j in range(i):\n        if nums[j] < nums[i]:\n            dp[i] = max(dp[i], dp[j]+1)\nreturn max(dp)",
        ],
    },

    # ── BACKTRACKING ─────────────────────────────────────────────────────────
    {
        "title": "Subsets",
        "slug": "subsets",
        "difficulty": "medium",
        "topics": [("backtracking", True), ("arrays", False)],
        "companies": ["amazon", "google", "meta"],
        "description": "Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return the solution in any order.",
        "examples": [
            {"input": "nums = [1,2,3]", "output": "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]"},
            {"input": "nums = [0]", "output": "[[],[0]]"},
        ],
        "constraints": ["1 <= nums.length <= 10", "All the numbers of nums are unique"],
        "hints": [
            "At each element, you make a binary choice: include it or exclude it.",
            "Use backtracking: at each index, add current subset to results, then recurse including the current element, then recurse excluding it (by backtracking).",
            "DFS: at each step, add current path to results, then for each index from start to end, add nums[i], recurse from i+1, then remove nums[i].",
            "result = []\ndef backtrack(start, path):\n    result.append(path[:])\n    for i in range(start, len(nums)):\n        path.append(nums[i])\n        backtrack(i+1, path)\n        path.pop()\nbacktrack(0, [])\nreturn result",
        ],
    },
    {
        "title": "Combination Sum",
        "slug": "combination-sum",
        "difficulty": "medium",
        "topics": [("backtracking", True), ("arrays", False)],
        "companies": ["amazon", "google", "microsoft"],
        "description": "Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. You may return the combinations in any order. The same number may be chosen from candidates an unlimited number of times.",
        "examples": [
            {"input": "candidates = [2,3,6,7], target = 7", "output": "[[2,2,3],[7]]"},
            {"input": "candidates = [2,3,5], target = 8", "output": "[[2,2,2,2],[2,3,3],[3,5]]"},
        ],
        "constraints": ["1 <= candidates.length <= 30", "All elements are distinct"],
        "hints": [
            "Use backtracking. At each step you can reuse the current candidate (staying at same index) or move to the next.",
            "Recurse with (index, remaining_target, current_path). When remaining == 0, add path to results. When remaining < 0, backtrack.",
            "For each recursive call starting at index i: add candidates[i] to path, recurse with same i (allow reuse) and target - candidates[i], then pop.",
            "result = []\ndef backtrack(start, target, path):\n    if target == 0: result.append(path[:]); return\n    if target < 0: return\n    for i in range(start, len(candidates)):\n        path.append(candidates[i])\n        backtrack(i, target-candidates[i], path)\n        path.pop()\nbacktrack(0, target, [])\nreturn result",
        ],
    },
    {
        "title": "Permutations",
        "slug": "permutations",
        "difficulty": "medium",
        "topics": [("backtracking", True), ("arrays", False)],
        "companies": ["amazon", "microsoft", "google"],
        "description": "Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.",
        "examples": [
            {"input": "nums = [1,2,3]", "output": "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]"},
            {"input": "nums = [0,1]", "output": "[[0,1],[1,0]]"},
        ],
        "constraints": ["1 <= nums.length <= 6", "All integers are unique"],
        "hints": [
            "A permutation uses every element exactly once. At each position, you can place any remaining unused element.",
            "Use backtracking with a 'used' set. Try placing each unused number at the current position, recurse, then unmark it.",
            "When path length equals nums length, add to results. Otherwise, for each num not in used: add to path+used, recurse, remove from path+used.",
            "result = []\ndef backtrack(path, used):\n    if len(path) == len(nums): result.append(path[:]); return\n    for num in nums:\n        if num not in used:\n            path.append(num); used.add(num)\n            backtrack(path, used)\n            path.pop(); used.remove(num)\nbacktrack([], set())\nreturn result",
        ],
    },

    # ── STRINGS ──────────────────────────────────────────────────────────────
    {
        "title": "Valid Anagram",
        "slug": "valid-anagram",
        "difficulty": "easy",
        "topics": [("strings", True), ("hash_maps", False)],
        "companies": ["amazon", "google"],
        "description": "Given two strings s and t, return true if t is an anagram of s, and false otherwise. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, using all the original letters exactly once.",
        "examples": [
            {"input": 's = "anagram", t = "nagaram"', "output": "true"},
            {"input": 's = "rat", t = "car"', "output": "false"},
        ],
        "constraints": ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters"],
        "hints": [
            "Two strings are anagrams if they have the same characters with the same frequencies.",
            "Count the frequency of each character in both strings and compare.",
            "Use Counter from collections to count characters in both strings. Return True if the counts are equal.",
            "from collections import Counter\nreturn Counter(s) == Counter(t)",
        ],
    },
    {
        "title": "Group Anagrams",
        "slug": "group-anagrams",
        "difficulty": "medium",
        "topics": [("strings", True), ("hash_maps", False)],
        "companies": ["amazon", "google", "meta", "microsoft"],
        "description": "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
        "examples": [
            {"input": 'strs = ["eat","tea","tan","ate","nat","bat"]', "output": '[["bat"],["nat","tan"],["ate","eat","tea"]]'},
            {"input": 'strs = [""]', "output": '[[""]]'},
        ],
        "constraints": ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100"],
        "hints": [
            "Anagrams have the same characters. What's a canonical representation of a string that all its anagrams share?",
            "Sorting a string gives the same result for all anagrams. Use sorted(word) as the key in a hash map.",
            "Use a defaultdict(list). For each word, key = tuple(sorted(word)). Append word to groups[key]. Return list of groups.values().",
            "from collections import defaultdict\ngroups = defaultdict(list)\nfor word in strs:\n    key = tuple(sorted(word))\n    groups[key].append(word)\nreturn list(groups.values())",
        ],
    },
    {
        "title": "Longest Palindromic Substring",
        "slug": "longest-palindromic-substring",
        "difficulty": "medium",
        "topics": [("strings", True), ("dynamic_programming", False)],
        "companies": ["amazon", "microsoft", "google", "meta"],
        "description": "Given a string s, return the longest palindromic substring in s.",
        "examples": [
            {"input": 's = "babad"', "output": '"bab"', "explanation": '"aba" is also valid'},
            {"input": 's = "cbbd"', "output": '"bb"'},
        ],
        "constraints": ["1 <= s.length <= 1000", "s consists of only digits and English letters"],
        "hints": [
            "A palindrome expands symmetrically around its center. There are 2n-1 possible centers (each char and each gap between chars).",
            "For each center, expand outward while characters match. Track the longest palindrome found.",
            "Expand around center function: take left and right pointers, expand while s[left]==s[right], return the longest palindrome found. Call for each odd and even center.",
            "def expand(l, r):\n    while l >= 0 and r < len(s) and s[l] == s[r]:\n        l -= 1; r += 1\n    return s[l+1:r]\nresult = ''\nfor i in range(len(s)):\n    odd = expand(i, i)\n    even = expand(i, i+1)\n    result = max(result, odd, even, key=len)\nreturn result",
        ],
    },

    # ── MATH / BIT MANIPULATION ──────────────────────────────────────────────
    {
        "title": "Reverse Bits",
        "slug": "reverse-bits",
        "difficulty": "easy",
        "topics": [("math", True)],
        "companies": ["apple", "amazon"],
        "description": "Reverse bits of a given 32 bits unsigned integer.",
        "examples": [
            {"input": "n = 00000010100101000001111010011100", "output": "964176192"},
            {"input": "n = 11111111111111111111111111111101", "output": "3221225471"},
        ],
        "constraints": ["The input must be a binary string of length 32"],
        "hints": [
            "Process bit by bit. Extract the least significant bit and build the result from the most significant bit.",
            "For 32 iterations: shift result left by 1, add (n & 1) to result, shift n right by 1.",
            "result = 0\nfor _ in range(32):\n    result = (result << 1) | (n & 1)\n    n >>= 1\nreturn result",
            "result = 0\nfor _ in range(32):\n    result = (result << 1) | (n & 1)\n    n >>= 1\nreturn result",
        ],
    },
    {
        "title": "Missing Number",
        "slug": "missing-number",
        "difficulty": "easy",
        "topics": [("math", True), ("arrays", False)],
        "companies": ["amazon", "microsoft"],
        "description": "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.",
        "examples": [
            {"input": "nums = [3,0,1]", "output": "2"},
            {"input": "nums = [9,6,4,2,3,5,7,0,1]", "output": "8"},
        ],
        "constraints": ["n == nums.length", "1 <= n <= 10^4", "All the numbers are unique"],
        "hints": [
            "The sum of 0 to n is n*(n+1)/2. What does the difference between this and the actual sum tell you?",
            "Expected sum = n*(n+1)//2. Actual sum = sum(nums). Missing number = expected - actual.",
            "return n*(n+1)//2 - sum(nums)",
            "return n*(n+1)//2 - sum(nums)",
        ],
    },

    # ── GREEDY ───────────────────────────────────────────────────────────────
    {
        "title": "Jump Game",
        "slug": "jump-game",
        "difficulty": "medium",
        "topics": [("greedy", True), ("arrays", False)],
        "companies": ["amazon", "microsoft", "google"],
        "description": "You are given an integer array nums. You are initially positioned at the first index of the array. Each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.",
        "examples": [
            {"input": "nums = [2,3,1,1,4]", "output": "true"},
            {"input": "nums = [3,2,1,0,4]", "output": "false"},
        ],
        "constraints": ["1 <= nums.length <= 10^4", "0 <= nums[i] <= 10^5"],
        "hints": [
            "Track the farthest index you can reach. At each position, check if you can even reach it.",
            "If your current position exceeds the farthest reachable index, you're stuck. Otherwise, update the farthest reachable index.",
            "Track max_reach. For each index i: if i > max_reach, return False. Update max_reach = max(max_reach, i + nums[i]).",
            "max_reach = 0\nfor i, jump in enumerate(nums):\n    if i > max_reach: return False\n    max_reach = max(max_reach, i + jump)\nreturn True",
        ],
    },
    {
        "title": "Gas Station",
        "slug": "gas-station",
        "difficulty": "medium",
        "topics": [("greedy", True), ("arrays", False)],
        "companies": ["amazon", "google"],
        "description": "There are n gas stations along a circular route. You have a car with an unlimited gas tank. Given two integer arrays gas and cost, return the starting gas station's index if you can travel around the circuit once in the clockwise direction, otherwise return -1.",
        "examples": [
            {"input": "gas = [1,2,3,4,5], cost = [3,4,5,1,2]", "output": "3"},
            {"input": "gas = [2,3,4], cost = [3,4,3]", "output": "-1"},
        ],
        "constraints": ["n == gas.length == cost.length", "1 <= n <= 10^5"],
        "hints": [
            "If total gas < total cost, no solution exists. Otherwise, a solution always exists.",
            "Track cumulative surplus. When the surplus goes negative, you can't start from any station in the current segment — reset the start to the next station.",
            "Track total_surplus and current_surplus. When current_surplus < 0: set start = i+1, reset current_surplus. Return start if total_surplus >= 0, else -1.",
            "start = total = current = 0\nfor i in range(len(gas)):\n    diff = gas[i] - cost[i]\n    total += diff\n    current += diff\n    if current < 0:\n        start = i + 1\n        current = 0\nreturn start if total >= 0 else -1",
        ],
    },
]


# ---------------------------------------------------------------------------
# Seed functions
# ---------------------------------------------------------------------------

async def seed_topics(session: AsyncSession) -> dict[str, uuid.UUID]:
    """Insert topics and return name→id mapping."""
    topic_map: dict[str, uuid.UUID] = {}
    for t in TOPICS:
        existing = await session.execute(select(Topic).where(Topic.name == t["name"]))
        topic = existing.scalar_one_or_none()
        if not topic:
            topic = Topic(id=uuid.uuid4(), **t)
            session.add(topic)
    await session.flush()

    result = await session.execute(select(Topic))
    for topic in result.scalars():
        topic_map[topic.name] = topic.id
    return topic_map


async def seed_problems(session: AsyncSession, topic_map: dict[str, uuid.UUID]) -> None:
    """Insert problems, their topics, and hints."""
    for p_data in PROBLEMS:
        existing = await session.execute(select(Problem).where(Problem.slug == p_data["slug"]))
        if existing.scalar_one_or_none():
            continue

        problem_id = uuid.uuid4()
        problem = Problem(
            id=problem_id,
            title=p_data["title"],
            slug=p_data["slug"],
            difficulty=p_data["difficulty"],
            description=p_data["description"],
            examples=p_data["examples"],
            constraints=p_data.get("constraints", []),
            companies=p_data.get("companies", []),
            url=f"https://leetcode.com/problems/{p_data['slug']}/",
        )
        session.add(problem)

        # Topics
        for topic_name, is_primary in p_data["topics"]:
            if topic_name in topic_map:
                session.add(ProblemTopic(
                    problem_id=problem_id,
                    topic_id=topic_map[topic_name],
                    is_primary=is_primary,
                ))

        # Hints
        for tier, hint_content in enumerate(p_data["hints"], start=1):
            session.add(ProblemHint(
                id=uuid.uuid4(),
                problem_id=problem_id,
                tier=tier,
                content=hint_content,
            ))

    await session.flush()


async def main() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async with session_factory() as session:
        async with session.begin():
            print("Seeding topics...")
            topic_map = await seed_topics(session)
            print(f"  {len(topic_map)} topics ready")

            print("Seeding problems...")
            await seed_problems(session, topic_map)
            print(f"  {len(PROBLEMS)} problems seeded")

    await engine.dispose()
    print("Done.")


if __name__ == "__main__":
    asyncio.run(main())
