import { PageHeader } from "@/components/dashboard/page-header"
import { ProfileForm } from "@/components/account/profile-form"
import { EmailForm } from "@/components/account/email-form"
import { PasswordForm } from "@/components/account/password-form"
import { DeleteAccount } from "@/components/account/delete-account"

export default function ComptePage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="Réglages" description="Gérez votre compte." />
      <div className="space-y-10">
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Profil</h2>
          <ProfileForm />
        </section>
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Email</h2>
          <EmailForm />
        </section>
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Mot de passe</h2>
          <PasswordForm />
        </section>
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Supprimer le compte</h2>
          <DeleteAccount />
        </section>
      </div>
    </div>
  )
}
