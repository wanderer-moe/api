import { generateRandomString, alphabet } from "oslo/random"

export function generateID() {
    return generateRandomString(15, alphabet("a-z", "0-9")).toLowerCase()
}
