export type NavItem = { label: string; href: string }

// Menu minimal. "Réglages" pointe vers /dashboard/compte qui arrive au Plan 3 ;
// les écrans produit du client s'ajouteront ici selon le plan.
export const navItems: NavItem[] = [
  { label: "Accueil", href: "/dashboard" },
  { label: "Réglages", href: "/dashboard/compte" },
]
