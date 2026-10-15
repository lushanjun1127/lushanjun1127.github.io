"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface EditCollectionDialogProps {
  collection: {
    id: string;
    name: string;
    description: string;
    isPublic?: boolean;
    /* viewStyle: "list" | "card";
    sortStyle: "alpha" | "time" | "manual"; */
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function EditCollectionDialog({
  collection,
  open,
  onOpenChange,
  onUpdate
}: EditCollectionDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: collection.name,
    description: collection.description,
    isPublic: collection.isPublic ?? true,
    /* viewStyle: collection.viewStyle,
    sortStyle: collection.sortStyle, */
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/collections/${collection.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "更新失败",
          description: data.error || "更新集合失败"
        });
        return;
      }

      onOpenChange(false);
      onUpdate?.();

      toast({
        title: "更新成功",
        description: "集合已更新"
      });

      if (window.location.pathname.includes('/admin/bookmarks')) {
        router.push(`/admin/bookmarks?collection=${collection.id}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast({
        variant: "destructive",
        title: "更新失败",
        description: error instanceof Error ? error.message : "更新集合时发生错误"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑书签集合</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">名称</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="请输入集合名称"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ 
                  ...prev,
                description: e.target.value.slice(0, 140) 
              }))}
              placeholder="请输入集合描述"
              rows={3}
              className="resize-none"
              maxLength={140}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div><Label>公开访问</Label><p className="text-sm text-muted-foreground">关闭后，仅登录的管理员可查看此集合。</p></div>
            <Switch checked={formData.isPublic} onCheckedChange={(isPublic) => setFormData(prev => ({ ...prev, isPublic }))} />
          </div>
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中…" : "保存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
