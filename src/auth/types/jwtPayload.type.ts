import { Role } from "src/roles/roles.model";

export type JwtPayload = {
  email: string;
  sub: number;
  roles: Role[];
}