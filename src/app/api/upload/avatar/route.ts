import { NextRequest, NextResponse } from "next/server";

// ── POST /api/upload/avatar ────────────────────────────
// Receives base64 image, uploads to Cloudinary
// Cloudinary credentials must be in .env:
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
export async function POST(req: NextRequest) {
  try {
    const { dataUrl, fileName } = await req.json();

    if (!dataUrl || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json({ success: false, error: "Invalid image data." }, { status: 400 });
    }

    // Validate format
    const mimeMatch = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,/);
    if (!mimeMatch) {
      return NextResponse.json(
        { success: false, error: "Only JPEG, PNG, or WEBP images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (~2MB limit on base64 → ~2.7MB string)
    const base64Data = dataUrl.split(",")[1];
    const sizeBytes = Math.round((base64Data.length * 3) / 4);
    if (sizeBytes > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Image must be under 2MB." },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      // Demo mode — return a placeholder avatar URL
      console.warn("[Avatar Upload] Cloudinary not configured — using placeholder avatar.");
      return NextResponse.json({
        success: true,
        url: `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(fileName ?? "user")}&backgroundColor=6C3FF5`,
      });
    }

    // Upload to Cloudinary via their unsigned Upload API
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: dataUrl,
          upload_preset: "vendorbridge-avatars",
          folder: "vendorbridge/avatars",
          transformation: "w_200,h_200,c_fill,g_face",
          api_key: apiKey,
        }),
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("[Cloudinary Upload Error]", errText);
      return NextResponse.json(
        { success: false, error: "Upload failed. Using no avatar." },
        { status: 502 }
      );
    }

    const data = await uploadRes.json();
    return NextResponse.json({ success: true, url: data.secure_url });
  } catch (err) {
    console.error("[Avatar Upload Error]", err);
    return NextResponse.json(
      { success: false, error: "Unexpected error during upload." },
      { status: 500 }
    );
  }
}
