import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
    const firstUserData = {
        id: "clef3m9rj000008jt6dxb5ixu",
        username: "admin",
        // this is a hashed version of "twixrox"
        passwordHash:
            "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
    };
    const firstUser = await prisma.user.upsert({
        where: {
            id: firstUserData.id,
        },
        update: {},
        create: firstUserData,
    });

    const calendar = {
        id: "cl4uqo9cy000009ju2w47eqct",
        authorId: firstUser.id,
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
