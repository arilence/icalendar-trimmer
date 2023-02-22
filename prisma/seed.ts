import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const admin_username = process.env.ADMIN_USERNAME;
const admin_password = process.env.ADMIN_PASSWORD;
if (!admin_username || !admin_password) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set");
}

async function seed() {
    const userData = {
        username: admin_username,
        passwordHash: await bcrypt.hash(admin_password, 10),
    };
    var user = await prisma.user.findFirst({
        where: {
            username: userData.username,
        },
    });
    if (user === null) {
        user = await prisma.user.create({
            data: userData,
        });
    }

    const calendar = {
        id: "cl4uqo9cy000009ju2w47eqct",
        authorId: user.id,
        remoteUrl:
            "https://calendar.google.com/calendar/ical/en.canadian%23holiday%40group.v.calendar.google.com/public/basic.ics",
        events: ["New Year's Day", "Remembrance Day (regional holiday)"],
    };
    await prisma.calendar.upsert({
        where: {
            id: calendar.id,
        },
        update: calendar,
        create: calendar,
    });

    console.log(`Database has been seeded. 🌱`);
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
