export interface User {
    id: string;
    avatar_url: string | null;
    banner_url: string | null;
    username: string;
    username_colour: string;
    bio: string | null;
    pronouns: string | null;
    verified: number;
    date_joined: string;
    role: string;
}
