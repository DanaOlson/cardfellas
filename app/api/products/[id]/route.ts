import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...product,
    price: Number(product.price),
    buyCashPrice: product.buyCashPrice ? Number(product.buyCashPrice) : null,
    buyCreditPrice: product.buyCreditPrice
      ? Number(product.buyCreditPrice)
      : null,
  });
}
