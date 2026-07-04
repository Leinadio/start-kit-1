import type { AnchorHTMLAttributes, ReactNode } from "react"

type LinkMockProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  children?: ReactNode
}

export default function Link({ href, children, ...rest }: LinkMockProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}
