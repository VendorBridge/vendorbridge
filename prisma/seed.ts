import { PrismaClient, UserRole, VendorStatus, RfqStatus, QuotationStatus, ApprovalStatus, DocStatus } from "@prisma/client";
import { randomUUID } from "crypto";

// ---------------------------------------------------------------------------
// Seed Script — npx prisma db seed
// ---------------------------------------------------------------------------
// Creates realistic demo data so the app is immediately usable after setup.
// Safe to re-run: checks for existing data before inserting.
// ---------------------------------------------------------------------------

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding VendorBridge database...\n");

  // ------------------------------------------------------------------
  // 1. Users
  // ------------------------------------------------------------------
  const admin = await prisma.user.upsert({
    where: { email: "admin@vendorbridge.com" },
    update: {},
    create: {
      email: "admin@vendorbridge.com",
      passwordHash: "$2b$12$placeholder_admin_hash", // Replace with bcrypt hash
      name: "System Admin",
      role: UserRole.ADMIN,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@vendorbridge.com" },
    update: {},
    create: {
      email: "manager@vendorbridge.com",
      passwordHash: "$2b$12$placeholder_manager_hash",
      name: "Rajesh Sharma",
      role: UserRole.MANAGER,
    },
  });

  const officer = await prisma.user.upsert({
    where: { email: "procurement@vendorbridge.com" },
    update: {},
    create: {
      email: "procurement@vendorbridge.com",
      passwordHash: "$2b$12$placeholder_officer_hash",
      name: "Priya Patel",
      role: UserRole.PROCUREMENT_OFFICER,
    },
  });

  const vendorUser1 = await prisma.user.upsert({
    where: { email: "vendor1@techsupply.com" },
    update: {},
    create: {
      email: "vendor1@techsupply.com",
      passwordHash: "$2b$12$placeholder_vendor1_hash",
      name: "Amit Kumar",
      role: UserRole.VENDOR,
    },
  });

  const vendorUser2 = await prisma.user.upsert({
    where: { email: "vendor2@logistics.com" },
    update: {},
    create: {
      email: "vendor2@logistics.com",
      passwordHash: "$2b$12$placeholder_vendor2_hash",
      name: "Sneha Reddy",
      role: UserRole.VENDOR,
    },
  });

  console.log("✅ Users created");

  // ------------------------------------------------------------------
  // 2. Vendors
  // ------------------------------------------------------------------
  const vendor1 = await prisma.vendor.upsert({
    where: { gstNumber: "27AABCT1234A1ZP" },
    update: {},
    create: {
      userId: vendorUser1.id,
      companyName: "TechSupply India Pvt Ltd",
      category: "IT Hardware",
      gstNumber: "27AABCT1234A1ZP",
      email: "sales@techsupply.com",
      phone: "+91 98765 43210",
      address: "Plot 42, MIDC Industrial Area",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411018",
      status: VendorStatus.ACTIVE,
      rating: 4.5,
    },
  });

  const vendor2 = await prisma.vendor.upsert({
    where: { gstNumber: "29BBBCL5678B2ZQ" },
    update: {},
    create: {
      userId: vendorUser2.id,
      companyName: "FastTrack Logistics",
      category: "Logistics",
      gstNumber: "29BBBCL5678B2ZQ",
      email: "info@fasttracklogistics.com",
      phone: "+91 87654 32109",
      address: "Whitefield Industrial Estate",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560066",
      status: VendorStatus.ACTIVE,
      rating: 4.2,
    },
  });

  console.log("✅ Vendors created");

  // ------------------------------------------------------------------
  // 3. Sample RFQ
  // ------------------------------------------------------------------
  const rfq = await prisma.rfq.upsert({
    where: { rfqNumber: "RFQ-2026-001" },
    update: {},
    create: {
      rfqNumber: "RFQ-2026-001",
      title: "Office IT Equipment Procurement Q3",
      description:
        "Procurement of laptops, monitors, and peripherals for the new Pune office expansion.",
      deadline: new Date("2026-07-15"),
      status: RfqStatus.OPEN,
      creatorId: officer.id,
      invitedVendors: {
        connect: [{ id: vendor1.id }, { id: vendor2.id }],
      },
      items: {
        create: [
          { productName: "Laptop - Dell Latitude 5540", quantity: 25, unit: "Units" },
          { productName: "Monitor - LG 27\" 4K", quantity: 25, unit: "Units" },
          { productName: "Wireless Keyboard + Mouse Combo", quantity: 25, unit: "Units" },
        ],
      },
    },
  });

  console.log("✅ RFQ created");

  // ------------------------------------------------------------------
  // 4. Activity Log
  // ------------------------------------------------------------------
  await prisma.activityLog.create({
    data: {
      userId: officer.id,
      action: "RFQ_CREATED",
      entityType: "RFQ",
      entityId: rfq.id,
      details: `Priya Patel created RFQ-2026-001 for IT equipment procurement.`,
    },
  });

  console.log("✅ Activity log created");

  console.log("\n🎉 Seed complete!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
