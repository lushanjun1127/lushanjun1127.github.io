import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { canReadCollection, visibleFolderIds } from '@/lib/auth/collection-access';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await Promise.resolve(params);
  
  try {
    if (!await canReadCollection(id)) return NextResponse.json({ error: '集合不存在或无权访问' }, { status: 404 });
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";
    const parentId = searchParams.get("parentId");
    const visibleIds = await visibleFolderIds(id);

    const folders = await prisma.folder.findMany({
      where: {
        collectionId: id,
        ...(visibleIds ? { id: { in: visibleIds } } : {}),
        ...(all ? {} : { parentId: parentId || null }),
      },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json(folders.map(folder => ({ ...folder, password: undefined })));
  } catch (error) {
    console.error("Failed to get folders:", error);
    return NextResponse.json(
      { error: "获取文件夹失败" },
      { status: 500 }
    );
  }
}
