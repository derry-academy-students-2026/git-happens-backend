import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	await prisma.jobrole.createMany({
		data: [
			{ 
                roleName: "", 
                location: "",
                capabilityId: "",
                bandId: "",
                closingDate: "",
                status: ""
            },
		],
		skipDuplicates: true,
	});

    await prisma.capability.createMany({
		data: [
			{ 
                capabilityName: ""
            },
		],
		skipDuplicates: true,
	});

    await prisma.band.createMany({
		data: [
			{ 
                bandName: ""
            },
		],
		skipDuplicates: true,
	});
}

main().finally(() => prisma.$disconnect());
