// types used for the /contributor endpoint
export interface Contributor {
	id: string
	username: string
	globalname: string | null
	avatar: string
	roles: string[]
}

export interface GuildMember {
	roles: string[]
	user: {
		id: string
		username: string
		global_name: string | null
		avatar: string
	}
}
