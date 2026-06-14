import { redirect } from "next/navigation";
import { clearChurchSession } from "@/lib/auth";

export async function POST() {
  await clearChurchSession();
  redirect("/church/login");
}
