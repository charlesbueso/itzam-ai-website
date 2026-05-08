import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/requireUser";

export default async function AppIndex({
  params,
}: {
  params: { locale: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect(`/${params.locale}/login`);
  if (user.isAdmin) redirect(`/${params.locale}/admin`);
  redirect(`/${params.locale}/login?reason=no-questionnaire`);
}
