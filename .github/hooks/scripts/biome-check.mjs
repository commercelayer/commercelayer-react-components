#!/usr/bin/env node

import { execSync } from "node:child_process"
import { createInterface } from "node:readline"

const SUPPORTED_EXTENSIONS = /\.(ts|tsx|js|jsx|json)$/
const FILE_TOOLS = new Set(["edit", "create"])

async function readStdin() {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, terminal: false })
    const lines = []
    rl.on("line", (line) => lines.push(line))
    rl.on("close", () => resolve(lines.join("\n")))
  })
}

const raw = await readStdin()
const input = JSON.parse(raw)

if (!FILE_TOOLS.has(input.toolName)) process.exit(0)

const toolArgs = JSON.parse(input.toolArgs)
const filePath = toolArgs.path

if (!filePath || !SUPPORTED_EXTENSIONS.test(filePath)) process.exit(0)

try {
  execSync(`pnpm biome check "${filePath}"`, {
    stdio: "inherit",
  })
} catch {
  process.exit(1)
}
