import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateVendorForm } from "@/lib/validation";
import { deleteVendor } from "@/app/vendors/actions";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const vendor = await db.vendor.findUnique({ where: { id } });

    if (!vendor) {
      return NextResponse.json({ success: false, error: "Vendor not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      vendor: {
        ...vendor,
        rating: vendor.rating != null ? Number(vendor.rating) : null,
        totalSpend: Number(vendor.totalSpend),
      },
    });
  } catch (err) {
    console.error("[GET /api/vendors/[id]]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch vendor." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validation = validateVendorForm(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.errors }, { status: 422 });
    }

    const form = validation.data!;
    const existing = await db.vendor.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Vendor not found." }, { status: 404 });
    }

    const vendor = await db.vendor.update({
      where: { id },
      data: {
        companyName: form.companyName,
        category: form.category,
        status: form.status,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        gstNumber: form.gstNumber,
        panNumber: form.panNumber,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        country: form.country,
        pincode: form.pincode,
        bankName: form.bankName,
        bankAccountNo: form.bankAccountNo,
        bankIfsc: form.bankIfsc,
        notes: form.notes,
      },
    });

    return NextResponse.json({ success: true, vendor: { id: vendor.id } });
  } catch (err) {
    console.error("[PUT /api/vendors/[id]]", err);
    return NextResponse.json({ success: false, error: "Failed to update vendor." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = await db.vendor.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Vendor not found." }, { status: 404 });
    }

    await deleteVendor(id);
    return NextResponse.json({ success: true, message: "Vendor deactivated." });
  } catch (err) {
    console.error("[DELETE /api/vendors/[id]]", err);
    return NextResponse.json({ success: false, error: "Failed to delete vendor." }, { status: 500 });
  }
}
