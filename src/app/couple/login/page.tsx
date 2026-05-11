import { redirect } from 'next/navigation'

type Props = { searchParams: Promise<{ reset?: string }> }

export default async function CoupleLoginRedirect({ searchParams }: Props) {
  const { reset } = await searchParams
  redirect(reset === '1' ? '/login?reset=1' : '/login')
}
