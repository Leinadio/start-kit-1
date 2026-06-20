export function addEnvVars(content: string, names: string[]): string {
  let out = content.endsWith("\n") ? content : content + "\n"
  for (const name of names) {
    const re = new RegExp(`^${name}=`, "m")
    if (!re.test(out)) out += `${name}=\n`
  }
  return out
}

export function removeEnvVars(content: string, names: string[]): string {
  return content
    .split("\n")
    .filter((l) => !names.some((n) => l.startsWith(`${n}=`)))
    .join("\n")
}
