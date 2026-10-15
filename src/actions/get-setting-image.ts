'use server'

import { prisma } from "@/lib/prisma";

export async function getSettingImages(settingKey: string) {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: settingKey },
      include: {
        images: {
          select: {
            imageId: true
          },
        }
      }
    });

    // console.log('setting', setting);

    if (!setting) {
      return { success: false, error: '找不到对应的设置项' };
    }

    const imageIds = setting.images.map(img => img.imageId);

    return { 
      success: true, 
      imageIds 
    };
  } catch (error) {
    console.error('Failed to get setting images:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '获取设置图片失败' 
    };
  }
}
