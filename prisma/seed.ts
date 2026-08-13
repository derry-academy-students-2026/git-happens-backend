import "dotenv/config";
import argon2 from "argon2";
import { PrismaClient } from "../src/generated/prisma/client.js";
import type {
	BandModel,
	CapabilityModel,
	StatusModel,
} from "../src/generated/prisma/models.js";

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

	// Create statuses
	await prisma.status.createMany({
		data: [{ statusName: "Open" }, { statusName: "Closed" }],
		skipDuplicates: true,
	});

	// Fetch all capabilities, bands and statuses to get their IDs
	const allCapabilities: CapabilityModel[] = await prisma.capability.findMany();
	const allBands: BandModel[] = await prisma.band.findMany();
	const allStatuses: StatusModel[] = await prisma.status.findMany();

	// Create a map for easier lookup
	const capabilityMap = Object.fromEntries(
		allCapabilities.map((c: CapabilityModel) => [
			c.capabilityName,
			c.capabilityId,
		]),
    );
	// Create auth roles used by login and registration tickets.
	await prisma.userRole.createMany({
		data: [{ roleName: "user" }, { roleName: "admin" }],
		skipDuplicates: true,
	});

	const bandMap = Object.fromEntries(
		allBands.map((b: BandModel) => [b.bandName, b.bandId]),
	);
	const statusMap = Object.fromEntries(
		allStatuses.map((s: StatusModel) => [s.statusName, s.statusId]),
	);

	const closingDate1 = new Date("2024-09-30");
	const closingDate2 = new Date("2024-10-15");
	const closingDate3 = new Date("2024-11-30");

	await prisma.jobRole.createMany({
		data: [
			{
				roleName: "Executive Assistant",
				location: "New York, NY",
				capabilityId: capabilityMap.Administration,
				bandId: bandMap["Band 2 - Mid-Level"],
				closingDate: closingDate1,
				description:
					"Provide high-level administrative support to senior leadership, managing schedules, travel and correspondence.",
				responsibilities:
					"Manage executive calendars; coordinate travel and expenses; prepare briefing documents; act as first point of contact for stakeholders.",
				sharepointUrl:
					"https://sharepoint.example.com/job-roles/executive-assistant",
				statusId: statusMap.Open,
				numberOfOpenPositions: 2,
			},
			{
				roleName: "Account Executive Assistant, Workday Services",
				location: "San Francisco, CA",
				capabilityId: capabilityMap.Administration,
				bandId: bandMap["Band 2 - Mid-Level"],
				closingDate: closingDate1,
				description:
					"Support the Workday Services account team with client administration, reporting and coordination.",
				responsibilities:
					"Maintain client records; prepare account reports; coordinate internal and client meetings; track contract renewals.",
				sharepointUrl:
					"https://sharepoint.example.com/job-roles/account-executive-assistant",
				statusId: statusMap.Open,
				numberOfOpenPositions: 1,
			},
			{
				roleName: "Workday HCM Consultant",
				location: "Austin, TX",
				capabilityId: capabilityMap["Workday HCM"],
				bandId: bandMap["Band 3 - Senior"],
				closingDate: closingDate2,
				description:
					"Configure and deliver Workday HCM solutions for enterprise clients through the full implementation lifecycle.",
				responsibilities:
					"Gather client requirements; configure Workday HCM modules; run testing cycles; deliver client training and handover.",
				sharepointUrl:
					"https://sharepoint.example.com/job-roles/workday-hcm-consultant",
				statusId: statusMap.Open,
				numberOfOpenPositions: 3,
			},
			{
				roleName: "UX Designer",
				location: "Seattle, WA",
				capabilityId: capabilityMap["UX/Design"],
				bandId: bandMap["Band 2 - Mid-Level"],
				closingDate: closingDate2,
				description:
					"Design accessible, user-centred digital experiences from research through to high-fidelity prototypes.",
				responsibilities:
					"Run user research and usability testing; produce wireframes and prototypes; maintain design systems; ensure WCAG compliance.",
				sharepointUrl: "https://sharepoint.example.com/job-roles/ux-designer",
				statusId: statusMap.Open,
				numberOfOpenPositions: 2,
			},
			{
				roleName: "Senior Dynamics 365 Engineer",
				location: "Chicago, IL",
				capabilityId: capabilityMap["Dynamics 365"],
				bandId: bandMap["Band 3 - Senior"],
				closingDate: closingDate3,
				description:
					"Build and extend Microsoft Dynamics 365 solutions, integrating them with wider client systems.",
				responsibilities:
					"Develop Dynamics 365 customisations; build Power Platform integrations; review code; mentor junior engineers.",
				sharepointUrl:
					"https://sharepoint.example.com/job-roles/senior-dynamics-365-engineer",
				statusId: statusMap.Open,
				numberOfOpenPositions: 1,
			},
			{
				roleName: "Software Engineer",
				location: "Remote",
				capabilityId: capabilityMap["Software Engineering"],
				bandId: bandMap["Band 1 - Associate"],
				closingDate: closingDate1,
				description:
					"Develop and maintain software across the stack as part of an agile delivery team.",
				responsibilities:
					"Write and test application code; participate in code review; fix defects; contribute to sprint planning and retrospectives.",
				sharepointUrl:
					"https://sharepoint.example.com/job-roles/software-engineer",
				statusId: statusMap.Open,
				numberOfOpenPositions: 5,
			},
			{
				roleName: "Senior Software Engineer",
				location: "Remote",
				capabilityId: capabilityMap["Software Engineering"],
				bandId: bandMap["Band 3 - Senior"],
				closingDate: closingDate2,
				description:
					"Lead delivery of complex software components and raise engineering standards across the team.",
				responsibilities:
					"Design and build application features; lead technical design discussions; mentor engineers; own quality and non-functional requirements.",
				sharepointUrl:
					"https://sharepoint.example.com/job-roles/senior-software-engineer",
				statusId: statusMap.Open,
				numberOfOpenPositions: 3,
			},
			{
				roleName: "Lead Software Engineer",
				location: "Boston, MA",
				capabilityId: capabilityMap["Software Engineering"],
				bandId: bandMap["Band 4 - Lead"],
				closingDate: closingDate3,
				description:
					"Lead an engineering team, owning technical direction and delivery for a client engagement.",
				responsibilities:
					"Set technical direction; manage and develop engineers; own delivery commitments; engage with client stakeholders.",
				sharepointUrl:
					"https://sharepoint.example.com/job-roles/lead-software-engineer",
				statusId: statusMap.Open,
				numberOfOpenPositions: 1,
			},
			{
				roleName: "Principal Software Engineer",
				location: "San Francisco, CA",
				capabilityId: capabilityMap["Software Engineering"],
				bandId: bandMap["Band 5 - Principal"],
				closingDate: closingDate3,
				description:
					"Shape engineering strategy and technical standards across multiple teams and engagements.",
				responsibilities:
					"Define engineering standards; lead architecture across programmes; support pre-sales and technical bids; coach senior engineers.",
				sharepointUrl:
					"https://sharepoint.example.com/job-roles/principal-software-engineer",
				statusId: statusMap.Open,
				numberOfOpenPositions: 1,
			},
			{
				roleName: "Technical Architect",
				location: "Denver, CO",
				capabilityId: capabilityMap.Architecture,
				bandId: bandMap["Band 4 - Lead"],
				closingDate: closingDate3,
				description:
					"Own end-to-end solution architecture for large-scale client systems.",
				responsibilities:
					"Produce solution designs; assure architectural quality; evaluate technology choices; advise client stakeholders on trade-offs.",
				sharepointUrl:
					"https://sharepoint.example.com/job-roles/technical-architect",
				statusId: statusMap.Open,
				numberOfOpenPositions: 2,
			},
			{
				roleName: "Product Owner",
				location: "Portland, OR",
				capabilityId: capabilityMap["Product Management"],
				bandId: bandMap["Band 3 - Senior"],
				closingDate: closingDate2,
				description:
					"Own the product backlog and maximise the value delivered by an agile team.",
				responsibilities:
					"Maintain and prioritise the backlog; write user stories and acceptance criteria; manage stakeholders; accept completed work.",
				sharepointUrl: "https://sharepoint.example.com/job-roles/product-owner",
				statusId: statusMap.Open,
				numberOfOpenPositions: 1,
			},
			{
				roleName: "Workday EDM Consultant",
				location: "Atlanta, GA",
				capabilityId: capabilityMap["Workday EDM"],
				bandId: bandMap["Band 3 - Senior"],
				closingDate: closingDate2,
				description:
					"Deliver Workday Enterprise Data Management solutions, covering data migration and integration.",
				responsibilities:
					"Design data migration approaches; build and test integrations; resolve data quality issues; support client go-live.",
				sharepointUrl:
					"https://sharepoint.example.com/job-roles/workday-edm-consultant",
				statusId: statusMap.Closed,
				numberOfOpenPositions: 1,
			},
			{
				roleName: "Product Manager - Workday Products",
				location: "San Francisco, CA",
				capabilityId: capabilityMap["Product Management"],
				bandId: bandMap["Band 4 - Lead"],
				closingDate: closingDate3,
				description:
					"Define and drive the product strategy and roadmap for the Workday product portfolio.",
				responsibilities:
					"Own product vision and roadmap; conduct market and user research; define success measures; work with engineering on delivery.",
				sharepointUrl:
					"https://sharepoint.example.com/job-roles/product-manager-workday-products",
				statusId: statusMap.Open,
				numberOfOpenPositions: 1,
			},
		],
		skipDuplicates: true,
	});

	// Seed an example login user with an argon2 password hash.
	const passwordHash = await argon2.hash("password123!");

	await prisma.user.upsert({
		where: { email: "test1@example.com" },
		update: { passwordHash },
		create: {
			email: "test1@example.com",
			passwordHash,
			role: { connect: { roleName: "user" } },
		},
	});
}

main()
	.catch((error) => {
		console.error("Seeding failed:", error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
