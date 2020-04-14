import { UserRole } from '../../user/models/user-role.enum';

export interface JwtPayload {
    email: string;
    role: UserRole;
    jobTitle: string;
    iat?: Date;
}
