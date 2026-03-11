'use server'

import { auth } from "@/lib/auth"

export const onServerAction = async (data: any) => {
  const { userId } = await auth()
  if (!userId) return { status: 401, message: "Unauthorized" }

  try {
    // Database logic here
    // const result = await client.user.create(...)

    return { status: 200, message: "Success" }
  } catch (error) {
    return { status: 500, message: "Server Error" }
  }
}