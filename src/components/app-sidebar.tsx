import * as React from "react"
import { GalleryVerticalEnd, Minus, Plus } from "lucide-react"

import { SearchForm } from "@/components/search-form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  navMain: [
    {
      title: "快速入门",
      url: "#",
      items: [
        {
          title: "安装",
          url: "#",
        },
        {
          title: "项目结构",
          url: "#",
        },
      ],
    },
    {
      title: "构建应用",
      url: "#",
      items: [
        {
          title: "路由",
          url: "#",
        },
        {
          title: "数据获取",
          url: "#",
          isActive: true,
        },
        {
          title: "渲染",
          url: "#",
        },
        {
          title: "缓存",
          url: "#",
        },
        {
          title: "样式",
          url: "#",
        },
        {
          title: "优化",
          url: "#",
        },
        {
          title: "配置",
          url: "#",
        },
        {
          title: "测试",
          url: "#",
        },
        {
          title: "身份验证",
          url: "#",
        },
        {
          title: "部署",
          url: "#",
        },
        {
          title: "升级",
          url: "#",
        },
        {
          title: "示例",
          url: "#",
        },
      ],
    },
    {
      title: "接口参考",
      url: "#",
      items: [
        {
          title: "组件",
          url: "#",
        },
        {
          title: "文件约定",
          url: "#",
        },
        {
          title: "函数",
          url: "#",
        },
        {
          title: "Next.js 配置选项",
          url: "#",
        },
        {
          title: "命令行工具",
          url: "#",
        },
        {
          title: "边缘运行环境",
          url: "#",
        },
      ],
    },
    {
      title: "架构",
      url: "#",
      items: [
        {
          title: "无障碍",
          url: "#",
        },
        {
          title: "快速刷新",
          url: "#",
        },
        {
          title: "Next.js 编译器",
          url: "#",
        },
        {
          title: "支持的浏览器",
          url: "#",
        },
        {
          title: "Turbopack",
          url: "#",
        },
      ],
    },
    {
      title: "社区",
      url: "#",
      items: [
        {
          title: "贡献指南",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-200/50 hover:bg-gray-200/50 active:bg-gray-200/50 text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">使用文档</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item, index) => (
              <Collapsible
                key={item.title}
                defaultOpen={index === 1}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      {item.title}{" "}
                      <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.items?.length ? (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={item.isActive}
                            >
                              <a href={item.url}>{item.title}</a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
