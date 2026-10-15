import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await Promise.resolve(params);
    const session = await getServerSession(authOptions);
    
    const collection = await prisma.collection.findFirst({
      where: {
        slug,
        ...(!session ? { isPublic: true } : {})
      }
    });

    if (!collection) {
      return NextResponse.json(
        { error: "集合不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ...collection, password: undefined });
  } catch (error) {
    console.error("Failed to get collection:", error);
    return NextResponse.json(
      { error: "获取集合失败" },
      { status: 500 }
    );
  }
} 
