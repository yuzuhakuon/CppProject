import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { commands, Disposable, ExtensionContext, extensions, QuickPickItem, Uri, window, workspace } from "vscode";
import { Commands } from "../commands";
import { createTasksFileString } from '../data/cppProjectConfig/tasksConfig';
import { createSettingFileString } from '../data/cppProjectConfig/settingConfig';
import { createConfiguration, createLaunchFileString } from '../data/cppProjectConfig/launchConfig';
import { createClangFormatFileString, createCmakeFileString, createCppHeaderFileString, createCppSourceFileString, createMainCppFileString } from '../data/cppProjectConfig/cppProjectConfig';
import { CompileCommandParser } from '../parser/compileCommandParser';
import { fileContainer } from '../data/specialFilesConfig/conanFiles';
import { mkdirRecursive } from '../common/utils';

export class ProjectController implements Disposable {

    private disposable: Disposable;

    dispose() {
        this.disposable.dispose();
    }

    public constructor(public readonly context: ExtensionContext) {
        this.disposable = Disposable.from(
            vscode.commands.registerCommand(Commands.KUON_CPPPROJECT_CREATECPPPROJECT, () => {
                this.createCppProject();
            }),
            vscode.commands.registerCommand(Commands.KUON_CPPPROJECT_CREATECPPCLASS, () => {
                this.createNewClass();
            }),
            vscode.commands.registerCommand(Commands.KUON_CPPPROJECT_CREATECOMPILECOMMANDJSON, () => {
                this.createCompileCommand();
            }),
            vscode.commands.registerCommand(Commands.KUON_CPPPROJECT_ADDSPECIALFILE, () => {
                this.addSpecialFile();
            }),
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
        // const tasksJsonPath = path.join(vscodeConfigFolder, 'tasks.json');
        // this.createTasksJsonFile(tasksJsonPath, forceReplace);

        // settings.json
        const settingJsonPath = path.join(vscodeConfigFolder, 'settings.json');
        this.createSettingsJsonFile(settingJsonPath, "c++20", "c17", forceReplace);

        // main.cpp
        const mainCppDir = path.join(workspaceFolder.uri.fsPath, "src");
        if (!fs.existsSync(mainCppDir)) {
            fs.mkdirSync(mainCppDir);
        }
        const mainCppPath = path.join(mainCppDir, 'main.cpp');
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

        // create bin folder
        const binFolder = path.join(workspaceFolder.uri.fsPath, 'bin');
        if (!fs.existsSync(binFolder)) {
            fs.mkdirSync(binFolder);
        }

        // create lib folder
        const libFolder = path.join(workspaceFolder.uri.fsPath, 'lib');
        if (!fs.existsSync(libFolder)) {
            fs.mkdirSync(libFolder);
        }

        // create include folder
        const includeFolder = path.join(workspaceFolder.uri.fsPath, 'include');
        if (!fs.existsSync(includeFolder)) {
            fs.mkdirSync(includeFolder);
        }
    }

    public async createNewClass() {
        const workspaceFolder = workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            window.showErrorMessage('No workspace folder is open.');
            return;
        }

        const className: string | undefined = await window.showInputBox({
            prompt: "Input a class name",
            placeHolder: "ClassName",
            value: "ClassName",
            ignoreFocusOut: true,
            validateInput: async (name: string): Promise<string> => {
                if (name && !name.match(/^[^*~/\\]+$/)) {
                    return "Please input a valid class name";
                }
                return "";
            },
        });

        if (!className) {
            vscode.window.showWarningMessage("Class creation canceled");
            return;
        }

        this.createClassFile(workspaceFolder.uri.fsPath, className);

        const headerFilePath = path.join(workspaceFolder.uri.fsPath, `${className}.h`);
        const headerFileUri = Uri.file(headerFilePath);
        vscode.workspace.openTextDocument(headerFileUri).then(document => {
            vscode.window.showTextDocument(document);
        });
    }

    public async createCompileCommand() {
        const workspaceFolder = workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            window.showErrorMessage('No workspace folder is open.');
            return;
        }

        const buildFolder = path.join(workspaceFolder.uri.fsPath, 'build');
        if (!fs.existsSync(buildFolder)) {
            fs.mkdirSync(buildFolder);
        }

        const compileCommandsFilePath = path.join(buildFolder, 'compile_commands.json');
        if (fs.existsSync(compileCommandsFilePath)) {
            window.showInformationMessage('compile_commands.json already exists.');
        }

        const compileCommands = this.createCompileCommandJsonFile(buildFolder);
        if (Object.keys(compileCommands).length === 0) {
            window.showWarningMessage('Can not parse the project.');
        }

        const typeOfCommand: string | undefined = await window.showQuickPick(Object.keys(compileCommands), {
            placeHolder: "Select the config to create compile_commands.json",
            ignoreFocusOut: true,
        });
        if (!typeOfCommand) {
            vscode.window.showWarningMessage("Cpp project creation canceled");
            return;
        }

        fs.writeFileSync(compileCommandsFilePath, JSON.stringify(compileCommands[typeOfCommand], null, 4));

        const compileCommandsFileUri = Uri.file(compileCommandsFilePath);
        vscode.workspace.openTextDocument(compileCommandsFileUri).then(document => {
            vscode.window.showTextDocument(document);
        });
    }

    public async addSpecialFile() {
        const workspaceFolder = workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            window.showErrorMessage('No workspace folder is open.');
            return;
        }

        const fileTypes = fileContainer.map((x) => { return x.displayName; });
        const fileTypeList = await window.showQuickPick(fileTypes, {
            placeHolder: "Select the files you want to add to workspace.",
            ignoreFocusOut: true,
            canPickMany: true
        });

        fileContainer.filter((x) => { return fileTypeList?.includes(x.displayName); })
            .map((obj) => {
                obj.files.forEach((file) => {
                    const absoultePath = path.join(workspaceFolder.uri.fsPath, file.path);
                    if (!fs.existsSync(absoultePath) || file.overwrite) {
                        mkdirRecursive(path.dirname(absoultePath));
                        fs.writeFileSync(absoultePath, file.text);
                    }
                });
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

    private createClassFile(workDir: string, className: string) {
        const headerFilePath = path.join(workDir, `${className}.h`);
        const sourceFilePath = path.join(workDir, `${className}.cpp`);
        if (!fs.existsSync(headerFilePath)) {
            const content = createCppHeaderFileString(className);
            fs.writeFileSync(headerFilePath, content);
        }
        if (!fs.existsSync(sourceFilePath)) {
            const content = createCppSourceFileString(className);
            fs.writeFileSync(sourceFilePath, content);
        }
    }

    private createCompileCommandJsonFile(buildPath: string) {
        const slnFile = fs.readdirSync(buildPath).filter(function (file) {
            return fs.statSync(path.join(buildPath, file)).isFile() && file.endsWith(".sln");
        });
        if (slnFile.length === 0) {
            return {};
        }

        const fileNameWithoutExtension = slnFile[0].split('.')[0];
        const vsxprojFilePath = path.join(buildPath, `${fileNameWithoutExtension}.vcxproj`);
        const filterFilePath = path.join(buildPath, `${fileNameWithoutExtension}.vcxproj.filters`);
        if (!fs.existsSync(vsxprojFilePath)) {
            return {};
        }
        if (!fs.existsSync(filterFilePath)) {
            return {};
        }

        const vsxprojFileContent = fs.readFileSync(vsxprojFilePath, 'utf8');
        const filterFileContent = fs.readFileSync(filterFilePath, 'utf8');
        const parser = new CompileCommandParser(buildPath, vsxprojFileContent, filterFileContent);
        const compileCommands = parser.parse();

        return compileCommands;
    }
}