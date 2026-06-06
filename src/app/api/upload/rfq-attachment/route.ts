import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
]);

const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rfqId = formData.get("rfqId") as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File must be under 10MB." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowedExt = ["pdf", "doc", "docx", "xls", "xlsx", "zip"];
    if (!ext || !allowedExt.includes(ext)) {
      return NextResponse.json(
        { success: false, error: "Unsupported file type." },
        { status: 400 }
      );
    }

    if (file.type && !ALLOWED_MIME.has(file.type) && file.type !== "application/octet-stream") {
      return NextResponse.json(
        { success: false, error: "Unsupported file type." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type || "application/octet-stream"};base64,${base64}`;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    let url: string;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn("[RFQ Upload] Cloudinary not configured — using demo URL.");
      url = `https://res.cloudinary.com/demo/raw/upload/v1/vendorbridge/rfq/${encodeURIComponent(file.name)}`;
    } else {
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: dataUrl,
            upload_preset: process.env.CLOUDINARY_RFQ_PRESET ?? "vendorbridge-rfq",
            folder: "vendorbridge/rfq-attachments",
            resource_type: "raw",
            api_key: apiKey,
          }),
        }
      );

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error("[Cloudinary RFQ Upload Error]", errText);
        return NextResponse.json(
          { success: false, error: "Upload failed." },
          { status: 502 }
        );
      }

      const data = await uploadRes.json();
      url = data.secure_url;
    }

    let attachment: { id: string } | null = null;

    if (rfqId) {
      const session = await auth();
      let uploadedBy = session?.user?.id;
      if (!uploadedBy) {
        const fallback = await db.user.findFirst({
          where: { role: "PROCUREMENT_OFFICER" },
          select: { id: true },
        });
        uploadedBy = fallback?.id;
      }

      if (uploadedBy) {
        const record = await db.rfqAttachment.create({
          data: {
            rfqId,
            fileName: file.name,
            fileUrl: url,
            fileSize: file.size,
            mimeType: file.type || null,
            uploadedBy,
          },
        });
        attachment = { id: record.id };
      }
    }

    return NextResponse.json({
      success: true,
      url,
      attachment,
    });
  } catch (err) {
    console.error("[POST /api/upload/rfq-attachment]", err);
    return NextResponse.json(
      { success: false, error: "Unexpected error during upload." },
      { status: 500 }
    );
  }
}
