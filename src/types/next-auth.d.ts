import { Role } from "@/lib/auth"
import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      avatar?: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: Role
    avatar?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    avatar?: string | null
  }
}
