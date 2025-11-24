import { PrismaClient } from "@/app/generated/prisma/client";
import { NODE_ENV } from "@/config";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma =
  globalForPrisma.prisma || new PrismaClient()

if (NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;