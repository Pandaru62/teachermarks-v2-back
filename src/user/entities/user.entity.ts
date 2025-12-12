import { profile, user } from 'prisma/generated/browser';

export class User {}


export interface UserWithProfile extends user {
  profile: Partial<profile>
}