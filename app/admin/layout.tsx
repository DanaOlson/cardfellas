import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";

export const metadata = {
  title: { default: "Admin", template: "%s | Admin — CardFellas" },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 128px)" }}>
      <AdminSidebar />
      <div className="flex-1 min-w-0 overflow-auto p-6">{children}</div>
    </div>
  );
}
