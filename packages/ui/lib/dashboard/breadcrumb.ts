import { navItems } from "@/lib/dashboard/nav"

export type Crumb = { label: string; href: string }

const labelFor = (href: string, segment: string): string => {
  const known = navItems.find((item) => item.href === href)
  if (known) return known.label
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

export function buildBreadcrumb(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean)
  const crumbs: Crumb[] = []
  let href = ""
  for (const segment of segments) {
    href += `/${segment}`
    if (href === "/dashboard") {
      crumbs.push({ label: "Accueil", href })
    } else {
      crumbs.push({ label: labelFor(href, segment), href })
    }
  }
  return crumbs
}
