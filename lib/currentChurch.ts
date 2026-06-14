import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { churchSessionCookie, clearChurchSession } from "./auth";
import { getChurchById, toChurchView } from "./churchRepository";

export async function getCurrentChurchView() {
  const cookieStore = await cookies();
  const churchId = cookieStore.get(churchSessionCookie)?.value;

  if (!churchId) {
    redirect("/church/login");
  }

  const church = await getChurchById(churchId);

  if (!church) {
    await clearChurchSession();
    redirect("/church/login?error=invalid");
  }

  if (church.status !== "Active") {
    await clearChurchSession();
    redirect("/church/login?error=disabled");
  }

  return toChurchView(church);
}
