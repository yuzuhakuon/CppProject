interface ILaunchConfiguration {
    name: string;
    type: string;
    request: string;
    program: string;
    cwd: string;
    args: string[];
    environment: { [key: string]: string }[];
    preLaunchTask: string;
    stopAtEntry: boolean;
    console: string;
    consoleArgs: string[];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    MIMode?: string;
    miDebuggerPath?: string;
}

interface ILaunch {
    version: string;
    configurations: ILaunchConfiguration[];
}

function createDefaultLaunchConfiguration(): ILaunchConfiguration {
    return {
        name: "",
        type: "",
        request: "launch",
        program: "",
        args: [],
        stopAtEntry: true,
        cwd: "${workspaceFolder}",
        environment: [
            {
                "name": "PATH",
                "value": "${env:PATH}"
            }
        ],
        console: "internalConsole",
        preLaunchTask: "",
        consoleArgs: [],
    };
}

function createDebugMsvcConfiguration(programName: string): ILaunchConfiguration {
    if (programName.endsWith(".exe")) {
        programName = programName.substring(0, programName.length - 4);
    }
    const program = "${workspaceFolder}/bin/" + `${programName}.exe`;
    const config: ILaunchConfiguration = createDefaultLaunchConfiguration();

    config.name = "Debug:msvc";
    config.type = "cppvsdbg";
    config.program = program;
    config.preLaunchTask = "build:debug:msvc";

    return config;
}

function createDebugGccConfiguration(programName: string): ILaunchConfiguration {
    const program = "${workspaceFolder}/bin/" + `${programName}`;
    const config: ILaunchConfiguration = createDefaultLaunchConfiguration();

    config.name = "Debug:gcc";
    config.type = "cppdbg";
    config.program = program;
    config.preLaunchTask = "build:debug:gcc";

    return config;
}

function createDebugMingwConfiguration(programName: string): ILaunchConfiguration {
    const program = "${workspaceFolder}/bin/" + `${programName}`;
    const config: ILaunchConfiguration = createDefaultLaunchConfiguration();

    config.name = "Debug:mingw";
    config.type = "cppdbg";
    config.program = program;
    config.preLaunchTask = "build:debug:mingw";

    return config;
}

function createReleaseMsvcConfiguration(programName: string): ILaunchConfiguration {
    if (programName.endsWith(".exe")) {
        programName = programName.substring(0, programName.length - 4);
    }
    const program = "${workspaceFolder}/bin/" + `${programName}.exe`;
    const config: ILaunchConfiguration = createDefaultLaunchConfiguration();

    config.name = "Release:msvc";
    config.type = "cppvsdbg";
    config.program = program;
    config.preLaunchTask = "build:release:msvc";

    return config;
}

function createReleaseGccConfiguration(programName: string): ILaunchConfiguration {
    const program = "${workspaceFolder}/bin/" + `${programName}`;
    const config: ILaunchConfiguration = createDefaultLaunchConfiguration();

    config.name = "Release:gcc";
    config.type = "cppdbg";
    config.program = program;
    config.preLaunchTask = "build:release:gcc";

    return config;
}

function createReleaseMingwConfiguration(programName: string): ILaunchConfiguration {
    const program = "${workspaceFolder}/bin/" + `${programName}`;
    const config: ILaunchConfiguration = createDefaultLaunchConfiguration();

    config.name = "Release:mingw";
    config.type = "cppdbg";
    config.program = program;
    config.preLaunchTask = "build:release:mingw";

    return config;
}

// if use windows, use msvc and mingw
// if use linux, use gcc
export function createConfiguration(programName: string): ILaunchConfiguration[] {
    const configs: ILaunchConfiguration[] = [];

    configs.push(createDebugMsvcConfiguration(programName));
    configs.push(createDebugMingwConfiguration(programName));
    configs.push(createReleaseMsvcConfiguration(programName));
    configs.push(createReleaseMingwConfiguration(programName));
    configs.push(createDebugGccConfiguration(programName));
    configs.push(createReleaseGccConfiguration(programName));

    return configs;
}

export function createLaunchFileString(configs: ILaunchConfiguration[]): string {
    const launch: ILaunch = {
        version: "0.2.0",
        configurations: configs
    };
    return JSON.stringify(launch, null, 4);
}
