import { cookies } from "next/headers";

export async function getServerLocale() {
  return (await cookies()).get("avoocado-locale")?.value === "en" ? "en" : "fa";
}
