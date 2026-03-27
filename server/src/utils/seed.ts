import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { Question } from "../models/Question";

dotenv.config();

type SeedQuestion = {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  examples: Array<{ input: string; output: string; explanation: string }>;
  constraints: string[];
  tags: string[];
};

const questions: SeedQuestion[] = [
  {
    title: "Two Sum",
    difficulty: "easy",
    tags: ["array", "hashmap"],
    description:
      "Given an array of integers `nums` and an integer `target`, return *indices* of the two numbers such that they add up to `target`.\n\n- You may assume that each input would have **exactly one solution**.\n- You may not use the same element twice.\n- You can return the answer in any order.\n\n### Example\n\n`nums = [2,7,11,15]`, `target = 9` → `[0,1]` because `2 + 7 = 9`.\n",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9.",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "nums[1] + nums[2] = 2 + 4 = 6.",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
        explanation: "The two 3s sum to 6.",
      },
    ],
    constraints: [
      "2 ≤ n ≤ 10^4",
      "-10^9 ≤ nums[i] ≤ 10^9",
      "-10^9 ≤ target ≤ 10^9",
      "Exactly one valid answer exists.",
    ],
  },
  {
    title: "Valid Parentheses",
    difficulty: "easy",
    tags: ["stack", "string"],
    description:
      "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['`, `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket.\n",
    examples: [
      {
        input: 's = "()[]{}"',
        output: "true",
        explanation: "Each opening bracket is closed in the correct order.",
      },
      {
        input: 's = "(]"',
        output: "false",
        explanation: "The closing bracket does not match the most recent opening bracket.",
      },
      {
        input: 's = "([{}])"',
        output: "true",
        explanation: "Brackets are properly nested and matched.",
      },
    ],
    constraints: ["1 ≤ s.length ≤ 10^4", "`s` consists only of brackets.", "Use O(n) time.", "Use a stack-like approach."],
  },
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "medium",
    tags: ["string", "sliding-window", "hashmap"],
    description:
      "Given a string `s`, find the length of the longest substring without repeating characters.\n\nReturn the maximum length of a substring that contains no duplicate characters.\n",
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 's = "pwwkew"',
        output: "3",
        explanation: 'The answer is "wke", with the length of 3.',
      },
    ],
    constraints: ["0 ≤ s.length ≤ 10^5", "`s` consists of English letters, digits, symbols and spaces.", "Aim for O(n) time using a sliding window.", "Use a map/set for last seen positions."],
  },
  {
    title: "Maximum Subarray (Kadane's Algorithm)",
    difficulty: "medium",
    tags: ["array", "dynamic-programming"],
    description:
      "Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.\n\nThis can be solved in O(n) time using Kadane's algorithm.\n",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum = 6.",
      },
      {
        input: "nums = [1]",
        output: "1",
        explanation: "Single element is the maximum subarray.",
      },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23",
        explanation: "The whole array sums to 23 and is the maximum subarray.",
      },
    ],
    constraints: ["1 ≤ nums.length ≤ 10^5", "-10^4 ≤ nums[i] ≤ 10^4", "Contiguous subarray must contain at least one element.", "Solve in O(n) time."],
  },
  {
    title: "Binary Search",
    difficulty: "medium",
    tags: ["array", "binary-search"],
    description:
      "Given a sorted array of integers `nums` and an integer `target`, return the index of `target` if it exists. Otherwise, return `-1`.\n\nYou must write an algorithm with O(log n) runtime complexity.\n",
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explanation: "9 exists at index 4." },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1", explanation: "2 does not exist in the array." },
      { input: "nums = [1], target = 1", output: "0", explanation: "Single-element match." },
    ],
    constraints: ["1 ≤ nums.length ≤ 10^5", "-10^4 ≤ nums[i] ≤ 10^4", "`nums` is sorted in ascending order.", "Use O(log n) time."],
  },
  {
    title: "Merge Intervals",
    difficulty: "medium",
    tags: ["array", "sorting", "intervals"],
    description:
      "Given an array of intervals where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.\n",
    examples: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
        explanation: "[1,3] and [2,6] overlap and are merged into [1,6].",
      },
      {
        input: "intervals = [[1,4],[4,5]]",
        output: "[[1,5]]",
        explanation: "Touching at 4 counts as overlap and should be merged.",
      },
      {
        input: "intervals = [[1,4],[0,2],[3,5]]",
        output: "[[0,5]]",
        explanation: "All intervals overlap when sorted and merged.",
      },
    ],
    constraints: ["1 ≤ intervals.length ≤ 10^4", "intervals[i].length == 2", "0 ≤ start_i ≤ end_i ≤ 10^4", "Return intervals in ascending order by start time."],
  },
  {
    title: "Trapping Rain Water",
    difficulty: "hard",
    tags: ["array", "two-pointers", "stack"],
    description:
      "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.\n\nA classic optimal solution runs in O(n) time using two pointers.\n",
    examples: [
      {
        input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        output: "6",
        explanation: "The elevation map can trap 6 units of water.",
      },
      {
        input: "height = [4,2,0,3,2,5]",
        output: "9",
        explanation: "Water trapped totals 9.",
      },
    ],
    constraints: ["n == height.length", "1 ≤ n ≤ 2 * 10^4", "0 ≤ height[i] ≤ 10^5", "Solve in O(n) time and O(1) extra space if possible."],
  },
  {
    title: "LRU Cache",
    difficulty: "hard",
    tags: ["design", "hashmap", "linked-list"],
    description:
      "Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.\n\nImplement the `LRUCache` class:\n\n- `LRUCache(int capacity)` initializes the LRU cache with positive size capacity.\n- `int get(int key)` returns the value of the key if the key exists, otherwise returns -1.\n- `void put(int key, int value)` update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity, evict the least recently used key.\n\nEach operation must run in **O(1)** average time complexity.\n",
    examples: [
      {
        input:
          "capacity = 2\nput(1,1)\nput(2,2)\nget(1)\nput(3,3)\nget(2)\nput(4,4)\nget(1)\nget(3)\nget(4)",
        output: "1\n-1\n-1\n3\n4",
        explanation:
          "Key 2 is evicted after inserting key 3. Key 1 is evicted after inserting key 4.",
      },
      {
        input: "capacity = 1\nput(1,1)\nput(2,2)\nget(1)\nget(2)",
        output: "-1\n2",
        explanation: "Capacity 1 means only the most recent key remains.",
      },
    ],
    constraints: ["1 ≤ capacity ≤ 3000", "0 ≤ key ≤ 10^4", "0 ≤ value ≤ 10^5", "At most 2 * 10^5 calls will be made.", "Each operation must be O(1) average time."],
  },
];

async function seed() {
  await connectDB(process.env.MONGODB_URI || "");

  const interviewerEmail = "interviewer@codex.local";
  let interviewer = await User.findOne({ email: interviewerEmail }).lean();
  if (!interviewer) {
    const hashed = await bcrypt.hash("Password123!", 10);
    interviewer = await User.create({
      name: "Seed Interviewer",
      email: interviewerEmail,
      password: hashed,
      role: "interviewer",
    });
  }

  await Question.deleteMany({ createdBy: interviewer._id });

  await Question.insertMany(
    questions.map((q) => ({
      ...q,
      createdBy: interviewer!._id,
    })),
  );

  // eslint-disable-next-line no-console
  console.log(`Seeded ${questions.length} questions.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });

