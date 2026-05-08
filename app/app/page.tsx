import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n/dictionaries";

export default function AppRoot() {
  redirect(`/${DEFAULT_LOCALE}`);
}
