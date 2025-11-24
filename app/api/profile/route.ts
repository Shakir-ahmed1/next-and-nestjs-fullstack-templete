
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/auth-helpers";
import { notFoundError, unauthorizedError } from "@/lib/errors";
import { withErrorHandler } from "@/lib/withErrorHandler";

async function userPutHandler(req: Request) {
    const { name, image } = await req.json();
    const session = await getServerSession();
    if (!session) {
        throw unauthorizedError()
    }
    const user = session.user;

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            name,
            image,
            updatedAt: new Date(),
        },
    });

    return NextResponse.json(updatedUser );
}


async function userGetHandler(req: Request) {
    const session = await getServerSession();
    if (!session) {
        throw unauthorizedError()
    }
    const id = session.user.id
    if (!session) {
        throw unauthorizedError()
    }

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw notFoundError("User Not found")
    }

    return NextResponse.json(user );

}

export const PUT = withErrorHandler(userPutHandler)
export const GET = withErrorHandler(userGetHandler)