import { redirect } from 'next/navigation'

// Admin layout guards this route — any authenticated ADMIN reaching here
// came from an old bookmark. Send them home.
export default function AdminLoginRedirect() {
  redirect('/admin/dashboard')
}
