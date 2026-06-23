function bounds(content: string, marker: string) {
  const lines = content.split("\n")
  const start = lines.findIndex((l) => l.includes(`@${marker} start`))
  const end = lines.findIndex((l) => l.includes(`@${marker} end`))
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Marqueurs introuvables pour ${marker}`)
  }
  return { lines, start, end }
}

export function replaceBetweenMarkers(content: string, marker: string, value: string): string {
  const { lines, start, end } = bounds(content, marker)
  const next = [...lines.slice(0, start + 1), value, ...lines.slice(end)]
  return next.join("\n")
}

export function insertLineBetweenMarkers(content: string, marker: string, line: string): string {
  const { lines, start, end } = bounds(content, marker)
  const inside = lines.slice(start + 1, end)
  if (inside.includes(line)) return content
  const next = [...lines.slice(0, end), line, ...lines.slice(end)]
  return next.join("\n")
}

export function removeLineBetweenMarkers(content: string, marker: string, line: string): string {
  const { lines, start, end } = bounds(content, marker)
  const next = lines.filter((l, i) => !(i > start && i < end && l === line))
  return next.join("\n")
}

export function ensureImport(content: string, importLine: string): string {
  if (content.includes(importLine)) return content
  const lines = content.split("\n")
  // A "use client" / "use server" directive must stay the first line of the
  // file, so insert the import right after it instead of above it.
  const isDirective = /^\s*["']use (client|server)["'];?\s*$/
  if (lines.length > 0 && isDirective.test(lines[0])) {
    return [lines[0], importLine, ...lines.slice(1)].join("\n")
  }
  return `${importLine}\n${content}`
}

export function removeImport(content: string, importLine: string): string {
  return content
    .split("\n")
    .filter((l) => l !== importLine)
    .join("\n")
}
