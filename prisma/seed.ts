import { PrismaClient, UserRole, VendorStatus, RfqStatus, QuotationStatus, ApprovalStatus } from "@prisma/client";
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
      firstName: "System",
      lastName: "Admin",
      role: UserRole.ADMIN,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@vendorbridge.com" },
    update: {},
    create: {
      email: "manager@vendorbridge.com",
      passwordHash: "$2b$12$placeholder_manager_hash",
      firstName: "Rajesh",
      lastName: "Sharma",
      role: UserRole.MANAGER,
    },
  });

  const officer = await prisma.user.upsert({
    where: { email: "procurement@vendorbridge.com" },
    update: {},
    create: {
      email: "procurement@vendorbridge.com",
      passwordHash: "$2b$12$placeholder_officer_hash",
      firstName: "Priya",
      lastName: "Patel",
      role: UserRole.PROCUREMENT_OFFICER,
    },
  });

  const vendorUser1 = await prisma.user.upsert({
    where: { email: "vendor1@techsupply.com" },
    update: {},
    create: {
      email: "vendor1@techsupply.com",
      passwordHash: "$2b$12$placeholder_vendor1_hash",
      firstName: "Amit",
      lastName: "Kumar",
      role: UserRole.VENDOR,
    },
  });

  const vendorUser2 = await prisma.user.upsert({
    where: { email: "vendor2@logistics.com" },
    update: {},
    create: {
      email: "vendor2@logistics.com",
      passwordHash: "$2b$12$placeholder_vendor2_hash",
      firstName: "Sneha",
      lastName: "Reddy",
      role: UserRole.VENDOR,
    },
  });

  console.log("✅ Users created");

  // ------------------------------------------------------------------
  // 2. Vendors
  // ------------------------------------------------------------------
  // Since gstNumber is not unique in the database schema, query first
  let vendor1 = await prisma.vendor.findFirst({
    where: { companyName: "TechSupply India Pvt Ltd" },
  });
  if (!vendor1) {
    vendor1 = await prisma.vendor.create({
      data: {
        userId: vendorUser1.id,
        companyName: "TechSupply India Pvt Ltd",
        category: "IT_HARDWARE",
        gstNumber: "27AABCT1234A1ZP",
        contactEmail: "sales@techsupply.com",
        contactPhone: "+91 98765 43210",
        addressLine1: "Plot 42, MIDC Industrial Area",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411018",
        status: VendorStatus.ACTIVE,
        rating: 4.5,
      },
    });
  }

  let vendor2 = await prisma.vendor.findFirst({
    where: { companyName: "FastTrack Logistics" },
  });
  if (!vendor2) {
    vendor2 = await prisma.vendor.create({
      data: {
        userId: vendorUser2.id,
        companyName: "FastTrack Logistics",
        category: "LOGISTICS",
        gstNumber: "29BBBCL5678B2ZQ",
        contactEmail: "info@fasttracklogistics.com",
        contactPhone: "+91 87654 32109",
        addressLine1: "Whitefield Industrial Estate",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560066",
        status: VendorStatus.ACTIVE,
        rating: 4.2,
      },
    });
  }

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
      status: RfqStatus.PUBLISHED,
      createdBy: officer.id,
    },
  });

  // Create RFQ items manually since no nested relation is defined
  const rfqItemsCount = await prisma.rfqItem.count({
    where: { rfqId: rfq.id },
  });

  if (rfqItemsCount === 0) {
    await prisma.rfqItem.createMany({
      data: [
        { rfqId: rfq.id, itemName: "Laptop - Dell Latitude 5540", quantity: 25, unit: "Units" },
        { rfqId: rfq.id, itemName: "Monitor - LG 27\" 4K", quantity: 25, unit: "Units" },
        { rfqId: rfq.id, itemName: "Wireless Keyboard + Mouse Combo", quantity: 25, unit: "Units" },
      ],
    });
  }

  // Invite vendors via RfqVendor junction table
  await prisma.rfqVendor.upsert({
    where: { rfqId_vendorId: { rfqId: rfq.id, vendorId: vendor1.id } },
    update: {},
    create: { rfqId: rfq.id, vendorId: vendor1.id },
  });

  await prisma.rfqVendor.upsert({
    where: { rfqId_vendorId: { rfqId: rfq.id, vendorId: vendor2.id } },
    update: {},
    create: { rfqId: rfq.id, vendorId: vendor2.id },
  });

  console.log("✅ RFQ created");

  // ------------------------------------------------------------------
  // 4. Activity Log
  // ------------------------------------------------------------------
  await prisma.activityLog.create({
    data: {
      actorId: officer.id,
      action: "CREATED",
      entityType: "RFQ",
      entityId: rfq.id,
      description: `Priya Patel created RFQ-2026-001 for IT equipment procurement.`,
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
