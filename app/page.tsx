import { permanentRedirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n/dictionaries";

export default function RootIndex() {
  permanentRedirect(`/${DEFAULT_LOCALE}`);
}
