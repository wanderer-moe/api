import { DrizzleInstance } from "@/v2/db/turso"
import { and, eq, sql } from "drizzle-orm"
import { requestArea, requestForm, requestFormUpvotes } from "@/v2/db/schema"

export class RequestFormManager {
    constructor(private drizzle: DrizzleInstance) {}

    public async getRequestFormEntries(offset: number = 0, limit: number = 50) {
        try {
            return await this.drizzle.query.requestForm.findMany({
                offset: offset,
                limit: limit,
                with: {
                    requestFormUpvotes,
                },
                extras: {
                    upvoteCount:
                        sql`SELECT COUNT(*) FROM ${requestFormUpvotes} WHERE ${requestForm.id} = ${requestFormUpvotes.requestFormId}`.as(
                            "upvoteCount"
                        ),
                },
            })
        } catch (e) {
            console.error(`Error getting request form entries`, e)
            throw new Error(`Error getting request form entries`)
        }
    }

    public async doesRequestFormEntryExist(id: string) {
        try {
            const [response] = await this.drizzle
                .select({ id: requestForm.id, userId: requestForm.userId })
                .from(requestForm)
                .where(eq(requestForm.id, id))
                .limit(1)

            return response
        } catch (e) {
            console.error(`Error checking if request form entry exists`, e)
            throw new Error(`Error checking if request form entry exists`)
        }
    }

    public async createRequestFormEntry(
        userId: string,
        title: string,
        area: requestArea,
        description: string
    ) {
        try {
            return await this.drizzle
                .insert(requestForm)
                .values({
                    userId,
                    title,
                    area,
                    description,
                })
                .returning()
        } catch (e) {
            console.error(`Error creating request form entry`, e)
            throw new Error(`Error creating request form entry`)
        }
    }

    public async checkIfUserUpvotedRequestFormEntry(
        requestFormId: string,
        userId: string
    ): Promise<boolean> {
        try {
            const response =
                await this.drizzle.query.requestFormUpvotes.findFirst({
                    where: and(
                        eq(requestFormUpvotes.requestFormId, requestFormId),
                        eq(requestFormUpvotes.userId, userId)
                    ),
                })

            return response !== null
        } catch (e) {
            console.error(
                `Error checking if user upvoted request form entry`,
                e
            )
            throw new Error(`Error checking if user upvoted request form entry`)
        }
    }

    public async deleteRequestFormEntry(id: string) {
        try {
            await this.drizzle.delete(requestForm).where(eq(requestForm.id, id))
        } catch (e) {
            console.error(`Error deleting request form entry`, e)
            throw new Error(`Error deleting request form entry`)
        }
    }

    public async upvoteRequestFormEntry(requestFormId: string, userId: string) {
        try {
            await this.drizzle.insert(requestFormUpvotes).values({
                requestFormId,
                userId,
            })
        } catch (e) {
            console.error(`Error upvoting request form entry`, e)
            throw new Error(`Error upvoting request form entry`)
        }
    }

    public async removeUpvoteRequestFormEntry(
        requestFormId: string,
        userId: string
    ) {
        try {
            await this.drizzle
                .delete(requestFormUpvotes)
                .where(
                    and(
                        eq(requestFormUpvotes.requestFormId, requestFormId),
                        eq(requestFormUpvotes.userId, userId)
                    )
                )
        } catch (e) {
            console.error(`Error removing upvote from request form entry`, e)
            throw new Error(`Error removing upvote from request form entry`)
        }
    }
}
