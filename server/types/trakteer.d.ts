declare module "trakteerjs" {
	export interface Donation {
		supporter_name: string
		supporter_message: string
	}

	export interface Goal {
		target: number | string
	}

	export interface LeaderboardSupporter {
		supporter_name: string
		sum: number
	}

	export interface Leaderboard {
		supporter: LeaderboardSupporter[]
	}

	export interface Supporter {
		display_name: string
		quantity: number
	}

	export interface StreamAPI {
		on: ((event: "connect", listener: (ts: Date) => void) => this)
			& ((event: "donation", listener: (donation: Donation) => void) => this)
			& ((event: "error", listener: (error: any) => void) => this)
		getGoal: () => Promise<Goal>
		getLeaderboard: () => Promise<Leaderboard>
		getSupporter: (count: number) => Promise<Supporter[]>
	}

	export const streamAPI: {
		new(pageId: string, streamKey: string): StreamAPI
	};

	export type streamKey = string;
}
