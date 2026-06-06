import { NextResponse } from "next/server";
import { VENDOR_CATEGORIES, CATEGORY_LABELS } from "@/lib/vendors";

export async function GET() {
  return NextResponse.json({
    success: true,
    categories: VENDOR_CATEGORIES.map((value) => ({
      value,
      label: CATEGORY_LABELS[value],
    })),
  });
}
