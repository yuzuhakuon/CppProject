import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { commands, Disposable, ExtensionContext, extensions, QuickPickItem, Uri, window, workspace } from "vscode";
import { Commands } from "../commands";
import { createTasksFileString } from '../data/cppProjectConfig/tasksConfig';
import { createSettingFileString } from '../data/cppProjectConfig/settingConfig';
import { createConfiguration, createLaunchFileString } from '../data/cppProjectConfig/launchConfig';
import { createClangFormatFileString, createCmakeFileString, createMainCppFileString } from '../data/cppProjectConfig/cppProjectConfig';

export class ProjectController implements Disposable {

    private disposable: Disposable;

    dispose() {
        this.disposable.dispose();
    }

    public constructor(public readonly context: ExtensionContext) {
        this.disposable = Disposable.from(
            vscode.commands.registerCommand(Commands.KUON_CPPPROJECT_CREATECPPPROJECT, () => {
                this.createCppProject();
            })
        );
    }

    public async createCppProject() {

        const workspaceFolder = workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            window.showErrorMessage('No workspace folder is open.');
            return;
        }

        const projectName: string | undefined = await window.showInputBox({
            prompt: "Input a Cpp project name",
            placeHolder: "CppProjectName",
            value: "CppProject",
            ignoreFocusOut: true,
            validateInput: async (name: string): Promise<string> => {
                if (name && !name.match(/^[^*~/\\]+$/)) {
                    return "Please input a valid project name";
                }
                return "";
            },
        });

        if (!projectName) {
            vscode.window.showWarningMessage("Cpp project creation canceled");
            return;
        }

        const cppStandard: string | undefined = await window.showQuickPick(["c++17", "c++14", "c++11", "Not explicitly set cpp standard"], {
            placeHolder: "Select a C++ standard",
            ignoreFocusOut: true,

        });
        if (!cppStandard) {
            vscode.window.showWarningMessage("Cpp project creation canceled");
            return;
        }

        const forceReplaceFile: string | undefined = await window.showQuickPick(["No", "Yes"], {
            placeHolder: "Do you want to replace the existing files?",
            ignoreFocusOut: true,
        });
        if (!forceReplaceFile) {
            vscode.window.showWarningMessage("Cpp project creation canceled");
            return;
        }
        const forceReplace: boolean = forceReplaceFile === "Yes";

        // create .vscode configuration
        const vscodeConfigFolder = path.join(workspaceFolder.uri.fsPath, '.vscode');
        if (!fs.existsSync(vscodeConfigFolder)) {
            fs.mkdirSync(vscodeConfigFolder);
        }

        // launch.json
        const launchJsonPath = path.join(vscodeConfigFolder, 'launch.json');
        this.createLaunchJsonFile(launchJsonPath, projectName, forceReplace);

        // tasks.json
        const tasksJsonPath = path.join(vscodeConfigFolder, 'tasks.json');
        this.createTasksJsonFile(tasksJsonPath, forceReplace);

        // settings.json
        const settingJsonPath = path.join(vscodeConfigFolder, 'settings.json');
        this.createSettingsJsonFile(settingJsonPath, "c++20", "c17", forceReplace);

        // main.cpp
        const mainCppPath = path.join(workspaceFolder.uri.fsPath, 'main.cpp');
        this.createMainCppFile(mainCppPath, forceReplace);

        // cmake
        const cmakePath = path.join(workspaceFolder.uri.fsPath, 'CMakeLists.txt');
        this.createCmakeFile(cmakePath, projectName, cppStandard, forceReplace);

        // clang-format
        const clangFormatPath = path.join(workspaceFolder.uri.fsPath, '.clang-format');
        this.createClangFormatFile(clangFormatPath, forceReplace);

        // create build folder
        const buildFolder = path.join(workspaceFolder.uri.fsPath, 'build');
        if (!fs.existsSync(buildFolder)) {
            fs.mkdirSync(buildFolder);
        }

        // open cpp file
        const mainFiletUri = Uri.file(mainCppPath);
        vscode.workspace.openTextDocument(mainFiletUri).then(document => {
            vscode.window.showTextDocument(document);
        });
    }

    private createTasksJsonFile(tasksJsonPath: string, force: boolean = false) {
        if (!fs.existsSync(tasksJsonPath) || force) {
            const content = createTasksFileString();
            fs.writeFileSync(tasksJsonPath, content);
        }
    }

    private createSettingsJsonFile(settingJsonPath: string, cppStandard: string, cStandard: string, force: boolean = false) {
        if (!fs.existsSync(settingJsonPath) || force) {
            const content = createSettingFileString(cppStandard, cStandard);
            fs.writeFileSync(settingJsonPath, content);
        }
    }

    private createLaunchJsonFile(launchJsonPath: string, projectName: string, force: boolean = false) {
        if (!fs.existsSync(launchJsonPath) || force) {
            const content = createLaunchFileString(createConfiguration(projectName));
            fs.writeFileSync(launchJsonPath, content);
        }
    }

    private createMainCppFile(mainCppPath: string, force: boolean = false) {
        if (!fs.existsSync(mainCppPath) || force) {
            const content = createMainCppFileString();
            fs.writeFileSync(mainCppPath, content);
        }
    }

    private createCmakeFile(cmakePath: string, projectName: string, cppStandard: string, force: boolean = false) {
        if (!fs.existsSync(cmakePath) || force) {
            const content = createCmakeFileString(projectName, cppStandard);
            fs.writeFileSync(cmakePath, content);
        }
    }

    private createClangFormatFile(clangFormatPath: string, force: boolean = false) {
        if (!fs.existsSync(clangFormatPath) || force) {
            const content = createClangFormatFileString();
            fs.writeFileSync(clangFormatPath, content);
        }
    }
}