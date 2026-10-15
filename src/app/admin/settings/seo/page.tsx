"use client";

import { useState, useEffect } from 'react';
import { toast, Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/components/admin/header";
import { revalidateData } from "@/actions/revalidate-data";
const defaultSettings = {
  siteTitle: '',
  author: '',
  ogImage: '',
  robots: 'index, follow',
  // websiteName: "",
  description: "",
  keywords: "",
  siteUrl: "",
};


export default function SeoSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/settings?group=seo');
        if (!response.ok) {
          throw new Error('加载设置失败');
        }
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          ...data
        }));
      } catch (error) {
        toast.error("加载设置失败");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证网站 URL 格式
    try {
      if (settings.siteUrl) {
        // 去除首尾空格和多余斜杠
        const cleanUrl = settings.siteUrl.trim().replace(/\/+$/, '');
        
        const url = new URL(cleanUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('网站地址必须以 http:// 或 https:// 开头');
        }
        
        // 验证域名格式
        if (!url.hostname) {
          throw new Error('请输入有效的域名');
        }

        // 更新为清理后的 URL
        settings.siteUrl = cleanUrl;
      } else {
        throw new Error('请输入网站地址');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '网站地址格式不正确');
      return;
    }

    try {
      setLoading(true);
      const saveSettingPromises = [];



      // 添加基本设置保存到 saveSettingPromises
      saveSettingPromises.push(
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...settings,
            group: 'seo'
          }),
        }).then(async response => {
          if (!response.ok) {
            const errorData = await response.json();
            console.error("API error response:", errorData);
            throw new Error(errorData.error || "保存失败");
          }
          return response.json();
        }).then(result => {
          console.log("Save success:", result); // 调试日志
        })
      );

      // 并行处理所有操作
      await Promise.all(saveSettingPromises);

      revalidateData();

      toast.success("搜索优化设置已保存");
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(error instanceof Error ? error.message : "保存设置失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-[#f9f9f9]">
      <Toaster />
      <AdminHeader title="搜索引擎优化设置" />

      <div className="mx-auto px-4 py-12 bg-[#f9f9f9]">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-8">
            {/* SEO 设置 */}
            <div className="space-y-4">
              <div className="space-y-4">
                {/* 基础 SEO */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-normal">基础搜索优化</p>
                  <Card className="border bg-white">
                    <CardContent className="grid gap-4 p-6">
                      {([['siteTitle','网站标题'],['author','作者'],['ogImage','社交分享图片地址']] as const).map(([name,label]) => <label key={name} className="grid gap-2 font-medium">{label}<Input name={name} value={settings[name]} onChange={handleChange} /></label>)}
                      <label className="grid gap-2 font-medium">搜索引擎收录<select name="robots" value={settings.robots} onChange={e => setSettings(prev => ({ ...prev, robots:e.target.value }))} className="rounded-lg border p-2"><option value="index, follow">允许收录</option><option value="noindex, nofollow">禁止收录</option></select></label>
                      <div className="grid gap-2">
                        <label htmlFor="siteUrl" className="font-medium">
                          网站地址
                        </label>
                        <Input
                          id="siteUrl"
                          name="siteUrl"
                          value={settings.siteUrl}
                          onChange={handleChange}
                          placeholder="请输入完整的网站地址"
                        />
                        <p className="text-sm text-muted-foreground">
                          例如：http://localhost:3000
                        </p>
                      </div>

                      {/* <div className="grid gap-2">
                        <label htmlFor="websiteName" className="font-medium">
                          Website Title
                        </label>
                        <Input
                          id="websiteName"
                          name="websiteName"
                          value={settings.websiteName}
                          onChange={handleChange}
                          placeholder="Enter website title"
                        />
                      </div> */}

                      <div className="grid gap-2">
                        <label htmlFor="description" className="font-medium">
                          网站描述
                        </label>
                        <Textarea
                          id="description"
                          name="description"
                          value={settings.description}
                          onChange={handleChange}
                          placeholder="请输入网站描述"
                          rows={3}
                        />
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor="keywords" className="font-medium">
                          关键词
                        </label>
                        <Input
                          id="keywords"
                          name="keywords"
                          value={settings.keywords}
                          onChange={handleChange}
                          placeholder="请输入关键词，用逗号分隔"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>


              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "保存中…" : "保存设置"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
