import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { canReadCollection, visibleFolderIds } from '@/lib/auth/collection-access';

export async function GET(
  request: Request,
  { params }: { params: { id: string; folderId: string } }
) {
  try {
    // 等待参数解析
    const { id, folderId } = await Promise.resolve(params);
    if (!await canReadCollection(id)) return NextResponse.json({ error: '集合不存在或无权访问' }, { status: 404 });
    const visibleIds = await visibleFolderIds(id);
    if (visibleIds && !visibleIds.includes(folderId)) return NextResponse.json({error:'文件夹不存在或无权访问'},{status:404});
    
    // 验证参数
    if (!id || !folderId) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const path = [];
    let currentFolder = await prisma.folder.findUnique({
      where: { 
        id: folderId,
        collectionId: id // 确保文件夹属于正确的集合
      }
    });

    while (currentFolder) {
      path.unshift({
        id: currentFolder.id,
        name: currentFolder.name
      });
      
      if (!currentFolder.parentId) break;
      
      currentFolder = await prisma.folder.findUnique({
        where: { 
          id: currentFolder.parentId,
          collectionId: id
        }
      });
    }

    return NextResponse.json(path);
  } catch (error) {
    console.error("Failed to get folder path:", error);
    return NextResponse.json(
      { error: "获取文件夹路径失败" },
      { status: 500 }
    );
  }
}
