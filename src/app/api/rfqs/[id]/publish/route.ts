import { NextRequest, NextResponse } from "next/server";
import { publishRfq } from "@/app/rfqs/new/actions";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await publishRfq(id, body);

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
    console.error("[POST /api/rfqs/[id]/publish]", err);
    return NextResponse.json(
      { success: false, error: "Failed to publish RFQ." },
      { status: 500 }
    );
  }
}
