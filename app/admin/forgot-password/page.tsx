import Link from "next/link";
import { KeyRound } from "lucide-react";

type Props = { searchParams: Promise<{ sent?: string; link?: string }> };
export const metadata = { title: "Admin Password Recovery" };

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  return <main className="flex min-h-screen items-center justify-center bg-[#06110d] p-4 text-white"><section className="w-full max-w-lg rounded-lg border border-emerald-300/16 bg-white/[0.055] p-6"><div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-400 text-[#04120c]"><KeyRound className="h-6 w-6" /></div><h1 className="mt-5 text-3xl font-semibold">Admin password recovery</h1><p className="mt-2 text-sm leading-6 text-emerald-50/68">Enter the admin email address to create a secure one-hour reset link.</p>{params.sent ? <DevelopmentResult resetLink={params.link} /> : <form method="post" action="/admin/forgot-password/request" className="mt-6 grid gap-4"><EmailField /><SubmitButton /></form>}<Link href="/admin/login" className="mt-5 inline-block text-sm font-semibold text-emerald-200 hover:underline">Back to admin login</Link></section></main>;
}

function EmailField() { return <label className="grid gap-2 text-sm font-semibold text-emerald-100">Email<input name="email" type="email" required className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none" /></label>; }
function SubmitButton() { return <button className="min-h-12 rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] hover:bg-emerald-300">Send Reset Link</button>; }
function DevelopmentResult({ resetLink }: { resetLink?: string }) { return <div className="mt-6 rounded-md border border-emerald-300/20 bg-[#07140f] p-4"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">Development Mode</p><p className="mt-2 text-sm leading-6 text-emerald-50/72">If the email matches an admin account, a reset link has been created.</p>{resetLink ? <Link href={resetLink} className="mt-4 block break-all rounded-md bg-emerald-300/10 p-3 text-sm font-semibold text-emerald-200 hover:underline">{resetLink}</Link> : null}</div>; }
