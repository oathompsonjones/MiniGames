/* eslint-disable no-console */
import readline from "readline/promises";

/**
 * Reads from the console.
 *
 * @param prompt The question to get the answer to.
 * @returns The value read.
 */
async function readLine(prompt: string = ""): Promise<string> {
    const reader = readline.createInterface(process.stdin, process.stdout);
    const input = await reader.question(prompt);

    reader.close();

    return input;
}

/**
 * Writes to the console.
 * @param text The text to write.
 */
function writeLine(...text: string[]): void {
    console.log(...text);
}

/** Clears the console. */
function clear(): void {
    console.clear();
}

export default { clear, readLine, writeLine };
