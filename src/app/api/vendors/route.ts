import { NextRequest, NextResponse } from "next/server";
import { getVendors, createVendor } from "@/app/vendors/actions";
import type { StatusTab } from "@/lib/vendors";
import type { VendorCategory } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? undefined;
    const category = (searchParams.get("category") ?? undefined) as VendorCategory | undefined;
    const status = (searchParams.get("status") ?? "ALL") as StatusTab;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);

    const result = await getVendors({
      search,
      category: category || "",
      statusTab: status,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[GET /api/vendors]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch vendors." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createVendor(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.errors },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, vendor: result.vendor }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/vendors]", err);
    return NextResponse.json({ success: false, error: "Failed to create vendor." }, { status: 500 });
  }
}
