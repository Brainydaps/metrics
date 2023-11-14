// Imports
import { bgWhite, black, brightGreen, brightRed, brightYellow, gray, cyan, white, yellow } from "std/fmt/colors.ts"
import * as YAML from "std/yaml/stringify.ts"

/** Compatibility report */
export class Report {
  /** Messages */
  readonly messages = [] as Array<{ type: string; message: string }>

  /** Register error message */
  error(message: string) {
    this.messages.push({ type: "error", message })
  }

  /** Register warning message */
  warning(message: string) {
    this.messages.push({ type: "warning", message })
  }

  /** Register info message */
  info(message: string) {
    this.messages.push({ type: "info", message })
  }

  /** Register debug message */
  debug(message: string) {
    this.messages.push({ type: "debug", message })
  }

  /** Print messages to console */
  console() {
    for (const { type, message } of this.messages) {
      const icon = { error: "❌", warning: "⚠️", info: "💡", debug:"📟" }[type]
      const text = `${icon} ${message}`
        .replaceAll(/^```\w*([\s\S]+?)```/gm, (_, text: string) => text.split("\n").map((line) => `   ${line}`).join("\n"))
        .replaceAll(/`([\s\S]+?)`/g, (_, text) => bgWhite(` ${black(text)} `))
        .split("\n").map((line) => `▓ ${line}`).join("\n")
      const color = { error: brightRed, warning: brightYellow, info: brightGreen, debug:gray }[type]!
      console.log(color(text))
    }
  }

  /** Print messages to markdown */
  markdown() {
    // TODO(@lowlighter): Implement markdown report
    return ""
  }
}

/** YAML formatter for console */
export function yaml(content: Record<PropertyKey, unknown>) {
  const regex = {
    kv: /^(?<indent>\s*)(?<array>\-\s+)?'?(?<key>\w[.\w-]*)'?(?:(?<kv>:)(?<value>\s.+)?)?$/,
  }
  const lines = []
  for (const line of YAML.stringify(content, {skipInvalid:true}).split("\n")) {
    if (regex.kv.test(line)) {
      let { indent, array = "", kv, key, value } = line.match(regex.kv)!.groups!
      let color = white
      if (!kv) {
        value = key
      }
      value = value?.trim()
      switch (true) {
        case ["null"].includes(value):
          color = gray
          break
        case ["{}", "[]", "true", "false"].includes(value):
          color = yellow
          break
        case !Number.isNaN(Number(value)):
          color = yellow
          break
        case /^'.+'$/.test(value):
          value = value.replace(/^'|'$/g, "")
          color = yellow
          break
      }
      lines.push(`${indent}${array}${kv ? `${cyan(key)}: ${color(value ?? "")}` : color(value ?? "")}`)
      continue
    }
    lines.push(line)
  }
  return lines.join("\n")
}