export type ColourType = `#${string}`

export function isValidColour(colour: string): colour is ColourType {
    return /^#[0-9A-F]{6}$/i.test(colour)
}
