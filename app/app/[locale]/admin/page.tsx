import Link from "next/link";
import { requireAdmin } from "@/lib/auth/requireUser";
import { getDictionary, isLocale } from "@/lib/i18n/dictionaries";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) redirect("/");
  const dict = getDictionary(params.locale);
  await requireAdmin(params.locale);

  const supabase = getSupabaseServerClient();
  const { data: rows } = await supabase
    .from("questionnaires")
    .select("id, client_name, client_company, client_email, status, created_at, completed_at, drive_folder_url")
    .order("created_at", { ascending: false })
    .limit(200);

  const statusLabel = (s: string) => {
    switch (s) {
      case "draft": return dict.app.admin.statusDraft;
      case "sent": return dict.app.admin.statusSent;
      case "in_progress": return dict.app.admin.statusInProgress;
      case "completed": return dict.app.admin.statusCompleted;
      case "cancelled": return dict.app.admin.statusCancelled;
      default: return s;
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{dict.app.admin.title}</h1>
          <div aria-hidden className="mt-2 h-px w-12 bg-[#c9a040]" />
        </div>
        <Link
          href={`/${params.locale}/admin/nuevo`}
          className="rounded border border-[#c9a040] bg-[#c9a040] px-4 py-2 text-sm font-medium text-black transition hover:bg-[#d8b257] hover:border-[#d8b257]"
        >
          {dict.app.admin.newCta}
        </Link>
      </header>

      {!rows || rows.length === 0 ? (
        <p className="text-sm text-white/60">{dict.app.admin.empty}</p>
      ) : (
        <div className="overflow-hidden rounded border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-4 py-3 text-left">{dict.app.admin.colClient}</th>
                <th className="px-4 py-3 text-left">{dict.app.admin.colStatus}</th>
                <th className="px-4 py-3 text-left">{dict.app.admin.colCreated}</th>
                <th className="px-4 py-3 text-left">{dict.app.admin.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.client_company || r.client_name}</div>
                    <div className="text-xs text-white/50">{r.client_name} · {r.client_email}</div>
                  </td>
                  <td className="px-4 py-3">{statusLabel(r.status)}</td>
                  <td className="px-4 py-3 text-white/60">
                    {new Date(r.created_at).toLocaleString(params.locale)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/${params.locale}/admin/${r.id}`}
                      className="text-white/80 underline-offset-2 hover:underline"
                    >
                      {params.locale === "en" ? "Open" : "Abrir"}
                    </Link>
                    {r.drive_folder_url && (
                      <>
                        {" · "}
                        <a
                          href={r.drive_folder_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/80 underline-offset-2 hover:underline"
                        >
                          Drive
                        </a>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
