import { NextRequest, NextResponse } from "next/server";
import { getRfqById, updateRfqDraft } from "@/app/rfqs/new/actions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rfq = await getRfqById(id);

    if (!rfq) {
      return NextResponse.json({ success: false, error: "RFQ not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, rfq });
  } catch (err) {
    console.error("[GET /api/rfqs/[id]]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch RFQ." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await updateRfqDraft(id, body);

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

    return NextResponse.json({ success: true, rfq: result.rfq });
  } catch (err) {
    console.error("[PUT /api/rfqs/[id]]", err);
    return NextResponse.json(
      { success: false, error: "Failed to update RFQ." },
      { status: 500 }
    );
  }
}
