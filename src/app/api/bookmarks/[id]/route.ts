import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "未登录或无权访问" }, { status: 401 });
    }

    await prisma.bookmark.delete({
      where: {
        id: params.id
      },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "删除书签失败" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "未登录或无权访问" }, { status: 401 });
    }

    const data = await request.json();
    const { title, description } = data;

    // 非空判断
    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
    }

    // 长度校验（与 POST 保持一致）
    if (title.length < 10 || title.length > 15) {
      return NextResponse.json({ error: "标题长度必须在10-15字之间" }, { status: 400 });
    }
    if (description && (description.length < 20 || description.length > 40)) {
      return NextResponse.json({ error: "描述长度必须在20-40字之间" }, { status: 400 });
    }

    const bookmark = await prisma.bookmark.update({
      where: {
        id: params.id,
      },
      data: {
        title: data.title,
        url: data.url,
        description: data.description,
        collectionId: data.collectionId,
        isFeatured: data.isFeatured,
        icon: data.icon,
      },
      include: {
        collection: {
          select: {
            name: true,
          },
        },
        folder: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(bookmark);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: "该网址已存在于书签中，请勿重复添加" }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "更新书签失败" }, { status: 500 });
  }
}

