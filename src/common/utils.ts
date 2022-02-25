/**
 * get each line of content and trim the space
 */
export function getLines(content: string): string[] {
    return content
        .split("\n")
        .map((line) => {
            return line.trim();
        });
}