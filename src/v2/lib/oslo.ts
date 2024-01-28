import { alphabet, generateRandomString } from "oslo/crypto"

export function generateID(length: number = 15) {
    return generateRandomString(length, alphabet("a-z", "0-9")).toLowerCase()
}
