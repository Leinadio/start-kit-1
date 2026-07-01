import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"

// Valeurs de démonstration statiques : le fondateur branchera ses vraies
// données à la place. Ce sont des exemples pour montrer la mise en page.
export default function DashboardHomePage() {
  return (
    <div>
      <PageHeader title="Accueil" description="Vue d'ensemble de votre activité." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Utilisateurs" value="1 248" hint="+12% ce mois" />
        <StatCard label="Revenu" value="8 430 €" hint="+4% ce mois" />
        <StatCard label="Abonnements actifs" value="312" />
      </div>
    </div>
  )
}
