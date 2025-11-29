export interface UserInfo {
  displayUsername?: string;
  email: string;
  image?: string | null;
  name: string;
  id: string;
  username?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
