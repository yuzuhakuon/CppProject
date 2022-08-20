export interface FileContainer {
    displayName: string;
    files: { path: string; text: string, overwrite?: boolean }[];
}