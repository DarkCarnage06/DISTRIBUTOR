import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "ADMIN" | "CUSTOMER";
      username: string;
      isApproved: boolean;
    };
  }

  interface User {
    role: "ADMIN" | "CUSTOMER";
    username: string;
    isApproved: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "CUSTOMER";
    username: string;
    isApproved: boolean;
  }
}
