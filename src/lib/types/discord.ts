export interface Contributor {
    id: string;
    username: string;
    globalname: string | null;
    avatar: string;
    roles: string[];
}

export interface GuildMember {
    roles: string[];
    user: {
        id: string;
        username: string;
        global_name: string | null;
        avatar: string;
    };
}

export interface DiscordAPIResponse {
    success: boolean;
    status: string;
    path: string;
    messages: DiscordMessage[];
}
export interface DiscordMessage {
    type: number;
    content: string;
    mentions: DiscordUser[];
    mention_roles: string[];
    attachments: any[];
    embeds: any[];
    timestamp: string;
    edited_timestamp: string | null;
    flags: number;
    components: any[];
    id: string;
    channel_id: string;
    author: DiscordUser;
    pinned: boolean;
    mention_everyone: boolean;
    tts: boolean;
    reactions?: DiscordReaction[];
    message_reference?: MessageReference;
    referenced_message?: DiscordMessage;
    position?: number;
}

export interface DiscordUser {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    public_flags: number;
    flags: number;
    banner: string | null;
    accent_color: number | null;
    global_name: string | null;
    avatar_decoration_data: AvatarDecorationData | null;
    banner_color: string | null;
    clan: any | null;
}

export interface AvatarDecorationData {
    asset: string;
    sku_id: string;
    expires_at: string | null;
}

export interface DiscordReaction {
    emoji: {
        id: string | null;
        name: string;
        animated?: boolean;
    };
    count: number;
    count_details: {
        burst: number;
        normal: number;
    };
    burst_colors: any[];
    me_burst: boolean;
    burst_me: boolean;
    me: boolean;
    burst_count: number;
}

export interface MessageReference {
    type: number;
    channel_id: string;
    message_id: string;
    guild_id: string;
}
