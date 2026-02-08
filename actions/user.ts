'use server'

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { client } from '@/lib/db'

export const onAuthenticatedUser = async () => {
    const user = await currentUser()
    if (!user) redirect('/sign-in')

    const userExist = await client.user.findUnique({
        where: {
            clerkId: user.id,
        },
        include: {
            subscription: true,
            integrations: {
                select: {
                    id: true,
                    token: true,
                    expiresAt: true,
                    name: true,
                },
            },
        },
    })

    if (userExist) {
        if (userExist.firstname && userExist.lastname) return userExist

        const completion = await client.user.update({
            where: {
                clerkId: user.id,
            },
            data: {
                firstname: user.firstName,
                lastname: user.lastName,
            },
            include: {
                subscription: true,
                integrations: {
                    select: {
                        id: true,
                        token: true,
                        expiresAt: true,
                        name: true,
                    },
                },
            },
        })

        return completion
    }

    const newUser = await client.user.create({
        data: {
            clerkId: user.id,
            email: user.emailAddresses[0].emailAddress,
            firstname: user.firstName,
            lastname: user.lastName,
            subscription: {
                create: {},
            },
        },
        include: {
            subscription: true,
            integrations: {
                select: {
                    id: true,
                    token: true,
                    expiresAt: true,
                    name: true,
                },
            },
        },
    })

    if (newUser) return newUser
    return null
}
