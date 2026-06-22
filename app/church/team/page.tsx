import type { Metadata } from "next";
import { KeyRound, ShieldCheck, UserPlus, Users } from "lucide-react";
import { CopyEmbedButton } from "@/app/admin/churches/CopyEmbedButton";
import { getBranchesForChurch } from "@/lib/branchRepository";
import {
  canManageTeamRole,
  churchTeamRoles,
  isChurchTeamRole,
} from "@/lib/churchPermissions";
import { getChurchTeamMembers } from "@/lib/churchTeamRepository";
import { requireChurchPermission } from "@/lib/currentChurch";
import { ChurchNav } from "../ChurchNav";
import {
  createTeamMemberAction,
  resetTeamMemberPasswordAction,
  setTeamMemberActiveAction,
  updateTeamMemberAction,
} from "./actions";

type TeamPageProps = {
  searchParams?: Promise<TeamSearchParams>;
};

type TeamSearchParams = {
  created?: string;
  updated?: string;
  activated?: string;
  deactivated?: string;
  reset?: string;
  name?: string;
  email?: string;
  password?: string;
  error?: string;
};

export const metadata: Metadata = { title: "Church Team" };
export const dynamic = "force-dynamic";

const roleDescriptions: Record<(typeof churchTeamRoles)[number], string> = {
  OWNER: "Full church and team access.",
  ADMIN: "Manage team, branches, settings, sessions, and analytics.",
  MEDIA: "Run live sessions, microphone capture, speaker output, display, and overlay.",
  TRANSLATOR: "Manage listener languages and manual sermon translations.",
  BRANCH_MANAGER: "Manage live work for one assigned branch.",
  VIEWER: "Read-only dashboard and analytics access.",
};

export default async function ChurchTeamPage({ searchParams }: TeamPageProps) {
  const [{ church, actor }, params] = await Promise.all([
    requireChurchPermission("team:manage"),
    searchParams,
  ]);
  const [members, branches] = await Promise.all([
    getChurchTeamMembers(church.id),
    getBranchesForChurch(church.id),
  ]);
  const activeBranches = branches.filter((branch) => !branch.disabledAt);
  const assignableRoles = churchTeamRoles.filter((role) =>
    canManageTeamRole(actor, role),
  );
  const resetCredentials =
    params?.reset === "1" && params.name && params.email && params.password
      ? {
          name: params.name,
          email: params.email,
          password: params.password,
        }
      : null;
  const credentialsText = resetCredentials
    ? `SermonBridge team login\nName: ${resetCredentials.name}\nEmail: ${resetCredentials.email}\nTemporary password: ${resetCredentials.password}`
    : "";

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8"><ChurchNav /></section>
      <section className="section-shell pb-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Church team</p>
          <h1 className="mt-3 text-4xl font-semibold">Staff accounts and permissions</h1>
          <p className="mt-4 leading-7 text-emerald-50/72">
            Give each staff member an individual login, role, and optional branch assignment. Shared church passwords are no longer necessary.
          </p>
        </div>

        <StatusMessage params={params} />

        {resetCredentials ? (
          <section className="mb-6 rounded-lg border border-amber-300/28 bg-amber-300/10 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-200">Temporary password created</p>
                <h2 className="mt-2 text-2xl font-semibold">{resetCredentials.name}</h2>
                <p className="mt-2 text-sm text-amber-50/82">Shown only on this result screen. Existing sessions for this team member were revoked.</p>
              </div>
              <CopyEmbedButton embedCode={credentialsText} label="Copy credentials" copiedLabel="Credentials copied" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info label="Email" value={resetCredentials.email} />
              <Info label="Temporary password" value={resetCredentials.password} mono />
            </div>
          </section>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <form action={createTeamMemberAction} className="grid h-fit gap-4 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-400 text-[#04120c]"><UserPlus className="h-5 w-5" /></div>
            <div><h2 className="text-2xl font-semibold">Add team member</h2><p className="mt-2 text-sm text-emerald-50/66">Create a unique login with at least eight password characters.</p></div>
            <Field name="name" label="Name" required />
            <Field name="email" label="Email" type="email" required />
            <Field name="password" label="Initial password" type="password" minLength={8} required />
            <RoleSelect roles={assignableRoles} />
            <BranchSelect branches={activeBranches} />
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] hover:bg-emerald-300"><UserPlus className="h-5 w-5" />Add team member</button>
          </form>

          <section className="grid gap-4">
            {members.length === 0 ? (
              <div className="rounded-lg border border-dashed border-emerald-300/24 bg-white/[0.045] p-10 text-center"><Users className="mx-auto h-10 w-10 text-emerald-300" /><h2 className="mt-4 text-2xl font-semibold">No team members yet</h2><p className="mt-2 text-emerald-50/68">Add the first staff account to stop sharing the owner login.</p></div>
            ) : members.map((member) => {
              const memberRole = isChurchTeamRole(member.role) ? member.role : "VIEWER";
              const editable = canManageTeamRole(actor, memberRole);
              const isSelf = member.id === actor.teamMemberId;

              return (
                <article key={member.id} className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-semibold">{member.name}</h2><StatusBadge active={member.isActive} /></div><p className="mt-2 text-sm text-emerald-50/62">{member.email}</p><p className="mt-2 text-sm text-emerald-50/72">{roleDescriptions[memberRole]}</p></div>
                    <span className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-300/18 px-3 py-2 text-xs font-bold text-emerald-200"><ShieldCheck className="h-4 w-4" />{memberRole.replaceAll("_", " ")}</span>
                  </div>

                  <form action={updateTeamMemberAction} className="mt-5 grid gap-3 md:grid-cols-3">
                    <input type="hidden" name="memberId" value={member.id} />
                    <Field name="name" label="Name" defaultValue={member.name} required disabled={!editable} />
                    <RoleSelect roles={assignableRoles} value={memberRole} disabled={!editable || isSelf} />
                    <BranchSelect branches={activeBranches} value={member.branchId ?? ""} disabled={!editable} />
                    {editable ? <button className="min-h-10 rounded-md border border-emerald-300/22 px-4 text-sm font-semibold text-emerald-100 hover:bg-white/8 md:col-span-3">Save member changes</button> : null}
                  </form>

                  {editable ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <form action={setTeamMemberActiveAction}><input type="hidden" name="memberId" value={member.id} /><input type="hidden" name="isActive" value={String(!member.isActive)} /><button disabled={isSelf && member.isActive} className="min-h-10 rounded-md border border-amber-300/24 px-4 text-sm font-semibold text-amber-100 disabled:opacity-40">{member.isActive ? "Deactivate" : "Activate"}</button></form>
                      <form action={resetTeamMemberPasswordAction}><input type="hidden" name="memberId" value={member.id} /><button disabled={isSelf} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-emerald-300/22 px-4 text-sm font-semibold text-emerald-100 disabled:opacity-40"><KeyRound className="h-4 w-4" />Reset password</button></form>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </section>
        </div>
      </section>
    </main>
  );
}

function StatusMessage({ params }: { params?: TeamSearchParams }) {
  const message = params?.created ? "Team member created." : params?.updated ? "Team member updated." : params?.activated ? "Team member activated." : params?.deactivated ? "Team member deactivated and signed out." : params?.error ? errorMessage(params.error) : "";
  if (!message) return null;
  const error = Boolean(params?.error);
  return <p className={`mb-6 rounded-md border p-4 text-sm font-semibold ${error ? "border-amber-300/28 bg-amber-300/10 text-amber-50" : "border-emerald-300/24 bg-emerald-300/10 text-emerald-50"}`}>{message}</p>;
}

function errorMessage(error: string) {
  if (error === "email") return "That email already belongs to a church or team account.";
  if (error === "branch-required") return "Branch managers must be assigned to a branch.";
  if (error === "branch") return "Select a branch that belongs to this church.";
  if (error === "self") return "You cannot change your own role from this page.";
  if (error === "permission") return "You do not have permission to manage that account or role.";
  return "Check the team member details and try again.";
}

function Field({ name, label, type = "text", defaultValue, minLength, required, disabled }: { name: string; label: string; type?: string; defaultValue?: string; minLength?: number; required?: boolean; disabled?: boolean }) {
  return <label className="grid gap-2 text-sm font-semibold text-emerald-100">{label}<input name={name} type={type} defaultValue={defaultValue} minLength={minLength} required={required} disabled={disabled} className="min-h-11 rounded-md border border-emerald-300/18 bg-[#07140f] px-3 text-white outline-none disabled:opacity-50" /></label>;
}

function RoleSelect({ roles, value, disabled }: { roles: readonly (typeof churchTeamRoles)[number][]; value?: string; disabled?: boolean }) {
  return <label className="grid gap-2 text-sm font-semibold text-emerald-100">Role<select name="role" defaultValue={value ?? roles[0]} disabled={disabled} className="min-h-11 rounded-md border border-emerald-300/18 bg-[#07140f] px-3 text-white outline-none disabled:opacity-50">{roles.map((role) => <option key={role} value={role}>{role.replaceAll("_", " ")}</option>)}</select>{disabled && value ? <input type="hidden" name="role" value={value} /> : null}</label>;
}

function BranchSelect({ branches, value = "", disabled }: { branches: Array<{ id: string; name: string }>; value?: string; disabled?: boolean }) {
  return <label className="grid gap-2 text-sm font-semibold text-emerald-100">Assigned branch<select name="branchId" defaultValue={value} disabled={disabled} className="min-h-11 rounded-md border border-emerald-300/18 bg-[#07140f] px-3 text-white outline-none disabled:opacity-50"><option value="">All church locations</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select>{disabled ? <input type="hidden" name="branchId" value={value} /> : null}</label>;
}

function StatusBadge({ active }: { active: boolean }) { return <span className={`rounded-full px-3 py-1 text-xs font-bold ${active ? "bg-emerald-400 text-[#04120c]" : "bg-red-400/18 text-red-100"}`}>{active ? "ACTIVE" : "INACTIVE"}</span>; }
function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div className="rounded-md border border-amber-300/18 bg-[#07140f] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-200">{label}</p><p className={`mt-2 break-all text-sm text-white ${mono ? "font-mono" : "font-semibold"}`}>{value}</p></div>; }
