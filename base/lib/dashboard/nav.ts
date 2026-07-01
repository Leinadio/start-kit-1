export type NavItem = { label: string; href: string }

// Menu minimal : on ne met que ce qui existe. Les écrans produit du client
// s'ajouteront ici plus tard.
export const navItems: NavItem[] = [
  { label: "Accueil", href: "/dashboard" },
  { label: "Réglages", href: "/dashboard/compte" },
]
