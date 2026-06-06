import { PrismaClient, UserRole, VendorStatus, RfqStatus } from "@prisma/client";

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
      passwordHash: "$2b$10$7LCF5MOe2ILtr049h2Op/uFVSPhAmIKvNBtytSichM.MT38MTUiFm", // bcrypt hash for 'password'
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
      passwordHash: "$2b$10$7LCF5MOe2ILtr049h2Op/uFVSPhAmIKvNBtytSichM.MT38MTUiFm",
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
      passwordHash: "$2b$10$7LCF5MOe2ILtr049h2Op/uFVSPhAmIKvNBtytSichM.MT38MTUiFm",
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
      passwordHash: "$2b$10$7LCF5MOe2ILtr049h2Op/uFVSPhAmIKvNBtytSichM.MT38MTUiFm",
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
      passwordHash: "$2b$10$7LCF5MOe2ILtr049h2Op/uFVSPhAmIKvNBtytSichM.MT38MTUiFm",
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

  // Additional demo vendors (various categories & statuses)
  const extraVendors = [
    {
      companyName: "OfficeNeed Co.",
      category: "STATIONERY" as const,
      gstNumber: "07AAACO1234C1Z5",
      contactEmail: "orders@officeneed.co",
      contactPhone: "+91 99887 76655",
      addressLine1: "Sector 18, Noida",
      city: "Noida",
      state: "Uttar Pradesh",
      pincode: "201301",
      status: VendorStatus.ACTIVE,
      rating: 3.8,
      totalPos: 12,
      totalSpend: 89000,
    },
    {
      companyName: "Infra Solutions Pvt Ltd",
      category: "FACILITY" as const,
      gstNumber: "24AAACI5678D1Z9",
      contactEmail: "contact@infrasolutions.in",
      contactPhone: "+91 91234 56789",
      addressLine1: "GIFT City, Gandhinagar",
      city: "Gandhinagar",
      state: "Gujarat",
      pincode: "382355",
      status: VendorStatus.ACTIVE,
      rating: 4.0,
      totalPos: 8,
      totalSpend: 245000,
    },
    {
      companyName: "CloudStack Software",
      category: "IT_SOFTWARE" as const,
      gstNumber: "36AAACC9012E1Z3",
      contactEmail: "sales@cloudstack.io",
      contactPhone: "+91 88776 65544",
      addressLine1: "HITEC City, Madhapur",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500081",
      status: VendorStatus.PENDING_VERIFICATION,
      rating: 0,
      totalPos: 0,
      totalSpend: 0,
    },
    {
      companyName: "Premier Furniture Works",
      category: "FURNITURE" as const,
      gstNumber: "09AAACP3456F1Z7",
      contactEmail: "info@premierfurniture.com",
      contactPhone: "+91 77665 54433",
      addressLine1: "Okhla Industrial Area",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110020",
      status: VendorStatus.ACTIVE,
      rating: 4.1,
      totalPos: 5,
      totalSpend: 178000,
    },
    {
      companyName: "BrightMark Agency",
      category: "MARKETING" as const,
      gstNumber: "19AAACM7890G1Z1",
      contactEmail: "hello@brightmark.in",
      contactPhone: "+91 66554 43322",
      addressLine1: "Salt Lake, Sector V",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700091",
      status: VendorStatus.PENDING_VERIFICATION,
      rating: 0,
      totalPos: 0,
      totalSpend: 0,
    },
    {
      companyName: "SecurePay Finance Services",
      category: "FINANCE" as const,
      gstNumber: "11AAACF2345H1Z8",
      contactEmail: "support@securepay.co.in",
      contactPhone: "+91 55443 32211",
      addressLine1: "Bandra Kurla Complex",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400051",
      status: VendorStatus.ACTIVE,
      rating: 4.6,
      totalPos: 3,
      totalSpend: 520000,
    },
    {
      companyName: "Reliable Parts Ltd",
      category: "IT_HARDWARE" as const,
      gstNumber: "33AAACR6789I1Z4",
      contactEmail: "procurement@reliableparts.com",
      contactPhone: "+91 44332 21100",
      addressLine1: "Guindy Industrial Estate",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600032",
      status: VendorStatus.INACTIVE,
      rating: 2.5,
      totalPos: 2,
      totalSpend: 45000,
    },
    {
      companyName: "Shady Supplies Co.",
      category: "OTHER" as const,
      gstNumber: "06AAACS0123J1Z6",
      contactEmail: "blocked@shadysupplies.com",
      contactPhone: "+91 33221 10099",
      addressLine1: "Unknown Industrial Zone",
      city: "Faridabad",
      state: "Haryana",
      pincode: "121001",
      status: VendorStatus.BLACKLISTED,
      rating: 1.2,
      totalPos: 1,
      totalSpend: 12000,
    },
  ];

  for (const v of extraVendors) {
    const exists = await prisma.vendor.findFirst({
      where: { companyName: v.companyName },
    });
    if (!exists) {
      await prisma.vendor.create({ data: v });
    }
  }

  console.log("✅ Additional vendors seeded");

  // ------------------------------------------------------------------
  // 3. Sample RFQ
  // ------------------------------------------------------------------
  const rfq = await prisma.rfq.upsert({
    where: { rfqNumber: "RFQ-2026-001" },
    update: {},
    create: {
      rfqNumber: "RFQ-2026-001",
      title: "Office IT Equipment Procurement Q3",
      category: "IT_HARDWARE",
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
