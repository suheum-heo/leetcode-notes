#!/usr/bin/env node
// Generate a LeetCode problem note in content/problems from a number, slug,
// title, or LeetCode URL. Known problems (content/problem-registry.json) get
// starter/reference content; unknown problems get a blank, fill-me template.
//
// The actual generation logic lives in lib/problem-generator.mjs, which is
// shared with the frontend "Add Problem" form. This file is just the CLI shell.
//
// Usage:
//   npm run new:problem 217
//   npm run new:problem contains-duplicate
//   npm run new:problem "https://leetcode.com/problems/contains-duplicate/"
//   npm run new:problem 217 -- --force        # overwrite an existing note

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createProblemNote,
  NoteExistsError,
  InvalidInputError,
} from "../lib/problem-generator.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function fail(message) {
  console.error(`\u2717 ${message}`);
  process.exit(1);
}

const VERBS = {
  "generated-starter": "Generated starter note (registry)",
  "leetcode-metadata": "Generated note from LeetCode metadata",
  "manual-needed": "Generated blank template",
};

async function main() {
  const argv = process.argv.slice(2);
  const force = argv.includes("--force") || argv.includes("-f");
  const positional = argv.filter((a) => !a.startsWith("-"));

  if (positional.length === 0) {
    fail(
      "Provide a problem number, slug, title, or LeetCode URL.\n  e.g. npm run new:problem 217"
    );
  }

  const raw = positional.join(" ");

  try {
    const result = await createProblemNote(raw, { force, rootDir: ROOT });
    const { meta, relativePath } = result;

    const verb = VERBS[meta.source] ?? "Generated note";
    console.log(`\u2713 ${verb}: ${relativePath}`);
    console.log(`  title:   ${meta.title}`);
    console.log(`  pattern: ${meta.pattern}`);
    console.log(`  status:  ${meta.status} (source: ${meta.source})`);
    if (meta.source === "manual-needed") {
      console.log(
        "  note:    no registry entry or LeetCode metadata — fill in the sections by hand."
      );
    }
  } catch (error) {
    if (error instanceof NoteExistsError) {
      fail(
        `Note already exists: ${error.relativePath}\n  Pass --force to overwrite, e.g. npm run new:problem ${raw} -- --force`
      );
    }
    if (error instanceof InvalidInputError) {
      fail(error.message);
    }
    throw error;
  }
}

main();
