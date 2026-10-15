import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';

export async function canReadCollection(id: string) {
  const collection = await prisma.collection.findUnique({ where: { id }, select: { isPublic: true } });
  return !!collection && (collection.isPublic || !!await getServerSession(authOptions));
}

// A child of a private folder remains private, even when its own flag is public.
export async function visibleFolderIds(collectionId?: string): Promise<string[] | null> {
  if (await getServerSession(authOptions)) return null;
  const folders = await prisma.folder.findMany({
    where: { ...(collectionId ? { collectionId } : {}), collection: { isPublic: true }, isPublic: true },
    select: { id: true, parentId: true },
  });
  const visible = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const folder of folders) if (!visible.has(folder.id) && (!folder.parentId || visible.has(folder.parentId))) { visible.add(folder.id); changed = true; }
  }
  return [...visible];
}
