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

/**
 * Capitalize the first letter of the string
 */
export function capitalize(str: string): string {
    if(str.length === 0) {
        return str;
    }else{
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
