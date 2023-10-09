/* eslint-disable no-console */
import readline from "readline/promises";

/**
 * Reads from the console.
 *
 * @async
 * @param {string} [prompt=""] The question to get the answer to.
 * @returns {string} The value read.
 */
async function readLine(prompt: string = ""): Promise<string> {
    const reader = readline.createInterface(process.stdin, process.stdout);
    const input = await reader.question(prompt);
    reader.close();
    return input;
}

/**
 * Writes to the console.
 *
 * @param {...unknown[]} text The text to write.
 */
function writeLine(...text: unknown[]): void {
    return console.log(...text);
}

/**
 * Clears the console.
 */
function clear(): void {
    return console.clear();
}

export const Console = { clear, readLine, writeLine };
