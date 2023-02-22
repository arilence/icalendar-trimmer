import bcrypt from "bcryptjs";
import { prisma } from "~/db.server";

import type { User } from "@prisma/client";
export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
    return prisma.user.findUnique({ where: { id } });
}

export async function verifyLogin(
    username: User["username"],
    password: User["passwordHash"]
) {
    const user = await prisma.user.findUnique({
        where: { username },
    });
    if (!user) {
        return null;
    }

    const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!passwordCorrect) {
        return null;
    }

    return { id: user.id, username };
}
