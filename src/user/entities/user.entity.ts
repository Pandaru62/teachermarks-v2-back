import { profile, user } from "@prisma/client";

export class User {}


export interface UserWithProfile extends user {
  profile: Partial<profile>
}