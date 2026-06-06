import { NextRequest, NextResponse } from "next/server";
import { getRFQs } from "@/app/rfqs/actions";
import { createRfqDraft } from "@/app/rfqs/new/actions";
import type { RfqStatusTab } from "@/lib/rfqs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? undefined;
    const status = (searchParams.get("status") ?? "ALL") as RfqStatusTab;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);

    const result = await getRFQs({
      search,
      status,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[GET /api/rfqs]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch RFQs." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createRfqDraft(body);

    if (!result.success) {
      if ("errors" in result && result.errors) {
        return NextResponse.json(
          { success: false, errors: result.errors },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === "Unauthorized." ? 401 : 400 }
      );
    }

    return NextResponse.json({ success: true, rfq: result.rfq }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/rfqs]", err);
    return NextResponse.json(
      { success: false, error: "Failed to create RFQ." },
      { status: 500 }
    );
  }
}
