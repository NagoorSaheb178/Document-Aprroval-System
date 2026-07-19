import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { SearchProvider } from "@/components/SearchContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <SearchProvider>
      <div className="app-shell bg-background">
        <Sidebar user={session} />
        <div className="main-wrap">
          <Topbar user={session} />
          <main className="content" id="mainContent">
            {children}
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}
