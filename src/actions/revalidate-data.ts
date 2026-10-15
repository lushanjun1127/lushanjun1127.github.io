'use server';

import { revalidatePath } from 'next/cache';
import { revalidateTag } from 'next/cache';
import { requireAuth } from '@/lib/auth/utils';

/**
 * Revalidate data for a specific path or entire cache
 * @param path Optional path to revalidate
 * @param type Optional revalidation type (path or layout)
 */
export async function revalidateData(path?: string, type: 'path' | 'layout' = 'path') {
  await requireAuth();
  try {
    if (path) {
      if (type === 'path') {
        revalidatePath(path);
      } else {
        revalidatePath(path, 'layout');
      }
      return { success: true, message: `缓存已刷新：${path}` };
    } else {
      // If no path is provided, revalidate entire cache
      revalidatePath('/', 'layout');
      return { success: true, message: '全部缓存已刷新' };
    }
  } catch (error) {
    console.error('Revalidation error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : '刷新缓存时发生未知错误' 
    };
  }
}
