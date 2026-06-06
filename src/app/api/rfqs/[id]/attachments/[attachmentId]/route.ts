import { NextRequest, NextResponse } from "next/server";
import { deleteRfqAttachment } from "@/app/rfqs/new/actions";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  try {
    const { id, attachmentId } = await params;
    const result = await deleteRfqAttachment(id, attachmentId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === "Unauthorized." ? 401 : 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/rfqs/[id]/attachments/[attachmentId]]", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete attachment." },
      { status: 500 }
    );
  }
}
