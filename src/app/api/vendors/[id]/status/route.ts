import { NextRequest, NextResponse } from "next/server";
import { updateVendorStatus } from "@/app/vendors/actions";
import type { VendorStatus } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { status } = (await req.json()) as { status?: VendorStatus };

    if (!status) {
      return NextResponse.json({ success: false, error: "Status is required." }, { status: 400 });
    }

    const result = await updateVendorStatus(id, status);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/vendors/[id]/status]", err);
    return NextResponse.json({ success: false, error: "Failed to update status." }, { status: 500 });
  }
}
