import { requireAuth } from "@/lib/auth/utils";
import { AdminSidebar } from "@/components/admin/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

// 后台页面一律服务端渲染：鉴权与密钥校验只在请求期执行，不参与构建期预渲染
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <SidebarProvider>
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
