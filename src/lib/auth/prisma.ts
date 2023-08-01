import { PrismaClient } from "@prisma/client";

declare global {
    const __prisma: PrismaClient | undefined;
}

const __prisma = new PrismaClient();

export default __prisma;
