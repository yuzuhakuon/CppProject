import * as vscode from 'vscode';
import { Disposable, ExtensionContext, Uri, commands, env } from "vscode";
import { Commands } from "../commands";

export class PathCopyCopyController implements Disposable {

    private disposable: Disposable;

    dispose() {
        this.disposable.dispose();
    }

    public constructor(public readonly context: ExtensionContext) {
        this.disposable = Disposable.from(
            commands.registerCommand(Commands.KUON_PATHCOPYCOPY_COPYUNIXPATH, (uri: Uri) => {
                const path = this.getUnixPath(uri.fsPath);
                env.clipboard.writeText(path);
            }),
            commands.registerCommand(Commands.KUON_PATHCOPYCOPY_COPYWINDOWSPATH, (uri: Uri) => {
                const path = this.getWindowsPath(uri.fsPath);
                env.clipboard.writeText(path);
            }),
            commands.registerCommand(Commands.KUON_PATHCOPYCOPY_COPYWSLPATH, (uri: Uri) => {
                const path = this.getWslPath(uri.fsPath);
                env.clipboard.writeText(path);
            }),
            commands.registerCommand(Commands.KUON_PATHCOPYCOPY_COPYUNIXPATH_RELATIVE, (uri: Uri) => {
                const relativePath = vscode.workspace.asRelativePath(uri);
                const path = this.getUnixPath(relativePath);
                env.clipboard.writeText(path);
            }),
            commands.registerCommand(Commands.KUON_PATHCOPYCOPY_COPYWINDOWSPATH_RELATIVE, (uri: Uri) => {
                const relativePath = vscode.workspace.asRelativePath(uri);
                const path = this.getWindowsPath(relativePath);
                env.clipboard.writeText(path);
            })
        );
    }

    public getUnixPath(path: string): string {
        return path.replace(/\\/g, "/");
    }

    public getWindowsPath(path: string): string {
        const unixPath = this.getUnixPath(path);
        return unixPath.replace(/\//g, "\\\\");
    }

    public getWslPath(path: string): string {
        const unixPath = this.getUnixPath(path).replace(":", "");
        return "/mnt/" + unixPath.replace(/\\/g, "/");
    }
}
