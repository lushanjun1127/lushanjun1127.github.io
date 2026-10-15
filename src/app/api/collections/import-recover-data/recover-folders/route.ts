import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import pLimit from "p-limit";
import { ExportedFolder } from "../../[id]/export/route";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(
  request: Request
) {
  try {
    const { name, description, folders, collectionId, folderMap, isPublic } =
      await request.json();

    let targetCollection;
    let insideFolderMap: { [key: string]: string }[] = folderMap || [];

    // Handle collection (create new or use existing)
    if (collectionId) {
      targetCollection = await prisma.collection.findUnique({
        where: { id: collectionId },
      });

      if (!targetCollection) {
        throw new Error("集合不存在");
      }
    } else {
      // Check if collection with the same name already exists
      const existingCollection = await prisma.collection.findFirst({
        where: { name: name },
      });

      if (existingCollection) {
        throw new Error("集合名称已存在");
      }

      // Create new collection
      targetCollection = await prisma.collection.create({
        data: {
          name: name,
          description: description,
          isPublic: isPublic ?? true,
        },
      });

      // Update database with collectionId as slug
      await prisma.collection.update({
        where: { id: targetCollection.id },
        data: {
          slug: targetCollection.id,
        },
      });
    }

    // Use p-limit to control concurrency, set to 10 concurrent operations
    const limit = pLimit(10);

    // Parallel import of folders, immediately update insideFolderMap
    const folderPromises = folders.map((folder: ExportedFolder) => 
      limit(async () => {
        // Find parent folder ID
        const parentId = folder.parentTempId
          ? insideFolderMap.find(item => item.tempId === folder.parentTempId)?.id
          : undefined;

        // Create folder
        const createdFolder = await prisma.folder.create({
          data: {
            name: folder.name,
            icon: folder.icon,
            sortOrder: folder.sortOrder,
            parentId: parentId,
            collectionId: targetCollection.id,
            isPublic: true,
          },
        });

        // Immediately update insideFolderMap
        const newFolderMap = { tempId: folder.tempId, id: createdFolder.id };
        insideFolderMap.push(newFolderMap);

        return createdFolder;
      })
    );

    // Wait for all folders to be created
    await Promise.all(folderPromises);

    return NextResponse.json({
      message: "文件夹导入成功",
      collectionId: targetCollection.id,
      insideFolderMap: insideFolderMap,
      itemsImported: folders.length,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "导入文件夹失败", details: String(error) },
      { status: 500 }
    );
  }
}
