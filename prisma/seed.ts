import "dotenv/config";
import type { Capability, Band } from "../src/generated/prisma/models.js";
import { PrismaClient } from "../src/generated/prisma/client.js";

// PrismaClient works fine with v6
const prisma = new PrismaClient();

async function main() {
	// Create capabilities first
	await prisma.capability.createMany({
		data: [
			{ capabilityName: "Administration" },
			{ capabilityName: "Workday HCM" },
			{ capabilityName: "Workday EDM" },
			{ capabilityName: "Dynamics 365" },
			{ capabilityName: "UX/Design" },
			{ capabilityName: "Software Engineering" },
			{ capabilityName: "Architecture" },
			{ capabilityName: "Product Management" },
		],
		skipDuplicates: true,
	});

	// Create bands
	await prisma.band.createMany({
		data: [
			{ bandName: "Band 1 - Associate" },
			{ bandName: "Band 2 - Mid-Level" },
			{ bandName: "Band 3 - Senior" },
			{ bandName: "Band 4 - Lead" },
			{ bandName: "Band 5 - Principal" },
			{ bandName: "Band 6 - Director" },
		],
		skipDuplicates: true,
	});

	// Fetch all capabilities and bands to get their IDs
	const allCapabilities: Capability[] = await prisma.capability.findMany();
	const allBands: Band[] = await prisma.band.findMany();

	// Create a map for easier lookup
	const capabilityMap = Object.fromEntries(
		allCapabilities.map((c: Capability) => [
			c.capabilityName,
			c.capabilityId.toString(),
		]),
	);
	const bandMap = Object.fromEntries(
		allBands.map((b: Band) => [b.bandName, b.bandId])
	);

	const closingDate1 = new Date("2024-09-30");
	const closingDate2 = new Date("2024-10-15");
	const closingDate3 = new Date("2024-11-30");

	await prisma.jobRole.createMany({
		data: [
			{
				roleName: "Executive Assistant",
				location: "New York, NY",
				capabilityId: capabilityMap["Administration"],
				bandId: bandMap["Band 2 - Mid-Level"],
				closingDate: closingDate1,
				status: "Open",
			},
			{
				roleName: "Account Executive Assistant, Workday Services",
				location: "San Francisco, CA",
				capabilityId: capabilityMap["Administration"],
				bandId: bandMap["Band 2 - Mid-Level"],
				closingDate: closingDate1,
				status: "Open",
			},
			{
				roleName: "Workday HCM Consultant",
				location: "Austin, TX",
				capabilityId: capabilityMap["Workday HCM"],
				bandId: bandMap["Band 3 - Senior"],
				closingDate: closingDate2,
				status: "Open",
			},
			{
				roleName: "UX Designer",
				location: "Seattle, WA",
				capabilityId: capabilityMap["UX/Design"],
				bandId: bandMap["Band 2 - Mid-Level"],
				closingDate: closingDate2,
				status: "Open",
			},
			{
				roleName: "Senior Dynamics 365 Engineer",
				location: "Chicago, IL",
				capabilityId: capabilityMap["Dynamics 365"],
				bandId: bandMap["Band 3 - Senior"],
				closingDate: closingDate3,
				status: "Open",
			},
			{
				roleName: "Software Engineer",
				location: "Remote",
				capabilityId: capabilityMap["Software Engineering"],
				bandId: bandMap["Band 1 - Associate"],
				closingDate: closingDate1,
				status: "Open",
			},
			{
				roleName: "Senior Software Engineer",
				location: "Remote",
				capabilityId: capabilityMap["Software Engineering"],
				bandId: bandMap["Band 3 - Senior"],
				closingDate: closingDate2,
				status: "Open",
			},
			{
				roleName: "Lead Software Engineer",
				location: "Boston, MA",
				capabilityId: capabilityMap["Software Engineering"],
				bandId: bandMap["Band 4 - Lead"],
				closingDate: closingDate3,
				status: "Open",
			},
			{
				roleName: "Principal Software Engineer",
				location: "San Francisco, CA",
				capabilityId: capabilityMap["Software Engineering"],
				bandId: bandMap["Band 5 - Principal"],
				closingDate: closingDate3,
				status: "Open",
			},
			{
				roleName: "Technical Architect",
				location: "Denver, CO",
				capabilityId: capabilityMap["Architecture"],
				bandId: bandMap["Band 4 - Lead"],
				closingDate: closingDate3,
				status: "Open",
			},
			{
				roleName: "Product Owner",
				location: "Portland, OR",
				capabilityId: capabilityMap["Product Management"],
				bandId: bandMap["Band 3 - Senior"],
				closingDate: closingDate2,
				status: "Open",
			},
			{
				roleName: "Workday EDM Consultant",
				location: "Atlanta, GA",
				capabilityId: capabilityMap["Workday EDM"],
				bandId: bandMap["Band 3 - Senior"],
				closingDate: closingDate2,
				status: "Open",
			},
			{
				roleName: "Product Manager - Workday Products",
				location: "San Francisco, CA",
				capabilityId: capabilityMap["Product Management"],
				bandId: bandMap["Band 4 - Lead"],
				closingDate: closingDate3,
				status: "Open",
			},
		],
		skipDuplicates: true,
	});
}

main().finally(() => prisma.$disconnect());
