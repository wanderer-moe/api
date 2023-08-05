export interface User {
    id: string;
    username: string;
    username_colour: string | null;
    avatar_url: string | null;
    banner_url: string | null;
    email: string;
    email_verified: number;
    pronouns: string | null;
    verified: number;
    bio: string | null;
    role_flags: number;
    self_assignable_role_flags: number;
    date_joined: Date;
}
