'use server'

import { currentUser } from "@clerk/nextjs/server"


export const onServerAction = async (data: any) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: "Unauthorized" }

  try {
    // Database logic here
    // const result = await client.user.create(...)
    
    return { status: 200, message: "Success" }
  } catch (error) {
    return { status: 500, message: "Server Error" }
  }
}