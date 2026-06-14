import { getChurches, toChurchView } from "./churchRepository";

export async function getCurrentChurchView() {
  const churches = await getChurches();
  const church = churches[0];

  return church ? toChurchView(church) : null;
}

