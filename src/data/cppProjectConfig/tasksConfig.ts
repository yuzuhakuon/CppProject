interface ITaskConfiguration {
    version: string;
    tasks: ITask[];
}

interface ITask {
    label: string;
    type: string;
    dependsOrder?: string
    command: string;
    args: string[];
    options: {
        cwd: string;
    };
    dependsOn?: string[];
    group?: {
        kind: "build" | "test" | "none";
        isDefault: boolean;
    }
}

function createDefaultTask(label: string): ITask {
    return {
        label: label,
        type: "shell",
        command: "",
        args: [],
        options: {
            cwd: "${workspaceFolder}/build",
        },
    };
}

function createDebugMsvcTask(): ITask[] {
    const tasks: ITask[] = [];

    const generateTask: ITask = createDefaultTask("build:cmake:debug:msvc");
    generateTask.command = "cmake";
    generateTask.args = [
        "-G",
        "\"Visual Studio 16 2019\"",
        "-A",
        "x64",
        "-DCMAKE_BUILD_TYPE=Debug",
        "-DCMAKE_INSTALL_PREFIX=${workspaceFolder}/bin",
        "-DCMAKE_EXPORT_COMPILE_COMMANDS:BOOL=TRUE",
        "${workspaceFolder}",
    ];

    const buildTask: ITask = createDefaultTask("build:make:debug:msvc");
    buildTask.command = "cmake --build . --config Debug";

    const sequenceTask: ITask = createDefaultTask("build:debug:msvc");
    sequenceTask.dependsOrder = "sequence";
    sequenceTask.dependsOn = [
        "build:cmake:debug:msvc",
        "build:make:debug:msvc",
    ];
    sequenceTask.group = {
        kind: "build",
        isDefault: true,
    };

    tasks.push(generateTask, buildTask, sequenceTask);

    return tasks;
}

function createDebugGccTask(): ITask[] {
    const tasks: ITask[] = [];

    const generateTask: ITask = createDefaultTask("build:cmake:debug:gcc");
    generateTask.command = "cmake";
    generateTask.args = [
        "-DCMAKE_EXPORT_COMPILE_COMMANDS:BOOL=TRUE",
        "-DCMAKE_BUILD_TYPE:STRING=Debug",
        "${workspaceFolder}",
    ];

    const buildTask: ITask = createDefaultTask("build:make:debug:gcc");
    buildTask.command = "make";
    buildTask.args = ["-Wfatal-errors", "-j", "4"];

    const sequenceTask: ITask = createDefaultTask("build:debug:gcc");
    sequenceTask.dependsOrder = "sequence";
    sequenceTask.dependsOn = [
        "build:cmake:debug:gcc",
        "build:make:debug:gcc",
    ];
    sequenceTask.group = {
        kind: "build",
        isDefault: true,
    };

    tasks.push(generateTask, buildTask, sequenceTask);

    return tasks;
}

function createDebugMingwTask(): ITask[] {
    const tasks: ITask[] = [];

    const generateTask: ITask = createDefaultTask("build:cmake:debug:mingw");
    generateTask.command = "cmake";
    generateTask.args = [
        "-G",
        "\"MinGW Makefiles\"",
        "-DCMAKE_EXPORT_COMPILE_COMMANDS:BOOL=TRUE",
        "-DCMAKE_BUILD_TYPE:STRING=Debug",
        "${workspaceFolder}",
    ];

    const buildTask: ITask = createDefaultTask("build:make:debug:mingw");
    buildTask.command = "mingw32-make";
    buildTask.args = ["-Wfatal-errors", "-j", "4"];

    const sequenceTask: ITask = createDefaultTask("build:debug:mingw");
    sequenceTask.dependsOrder = "sequence";
    sequenceTask.dependsOn = [
        "build:cmake:debug:mingw",
        "build:make:debug:mingw",
    ];
    sequenceTask.group = {
        kind: "build",
        isDefault: false,
    };

    tasks.push(generateTask, buildTask, sequenceTask);

    return tasks;
}

function createReleaseMsvcTask(): ITask[] {
    const tasks: ITask[] = [];

    const generateTask: ITask = createDefaultTask("build:cmake:release:msvc");
    generateTask.command = "cmake";
    generateTask.args = [
        "-G",
        "\"Visual Studio 16 2019\"",
        "-A",
        "x64",
        "-DCMAKE_BUILD_TYPE=Release",
        "-DCMAKE_INSTALL_PREFIX=${workspaceFolder}/bin",
        "-DCMAKE_EXPORT_COMPILE_COMMANDS:BOOL=TRUE",
        "${workspaceFolder}",
    ];

    const buildTask: ITask = createDefaultTask("build:make:release:msvc");
    buildTask.command = "cmake --build . --config Release";

    const sequenceTask: ITask = createDefaultTask("build:release:msvc");
    sequenceTask.dependsOrder = "sequence";
    sequenceTask.dependsOn = [
        "build:cmake:release:msvc",
        "build:make:release:msvc",
    ];

    tasks.push(generateTask, buildTask, sequenceTask);

    return tasks;
}

function createReleaseGccTask(): ITask[] {
    const tasks: ITask[] = [];

    const generateTask: ITask = createDefaultTask("build:cmake:release:gcc");
    generateTask.command = "cmake";
    generateTask.args = [
        "-DCMAKE_EXPORT_COMPILE_COMMANDS:BOOL=TRUE",
        "-DCMAKE_BUILD_TYPE:STRING=Release",
        "${workspaceFolder}",
    ];

    const buildTask: ITask = createDefaultTask("build:make:release:gcc");
    buildTask.command = "make";
    buildTask.args = ["-j", "4"];

    const sequenceTask: ITask = createDefaultTask("build:release:gcc");
    sequenceTask.dependsOrder = "sequence";
    sequenceTask.dependsOn = [
        "build:cmake:release:gcc",
        "build:make:release:gcc",
    ];

    tasks.push(generateTask, buildTask, sequenceTask);

    return tasks;
}

function createReleaseMingwTask(): ITask[] {
    const tasks: ITask[] = [];

    const generateTask: ITask = createDefaultTask("build:cmake:release:mingw");
    generateTask.command = "cmake";
    generateTask.args = [
        "-G",
        "\"MinGW Makefiles\"",
        "-DCMAKE_EXPORT_COMPILE_COMMANDS:BOOL=TRUE",
        "-DCMAKE_BUILD_TYPE:STRING=Release",
        "${workspaceFolder}",
    ];

    const buildTask: ITask = createDefaultTask("build:make:release:mingw");
    buildTask.command = "mingw32-make";
    buildTask.args = ["-j", "4"];

    const sequenceTask: ITask = createDefaultTask("build:release:mingw");
    sequenceTask.dependsOrder = "sequence";
    sequenceTask.dependsOn = [
        "build:cmake:release:mingw",
        "build:make:release:mingw",
    ];

    tasks.push(generateTask, buildTask, sequenceTask);

    return tasks;
}

// if use windows, use msvc and mingw
// if use linux, use gcc
export function createTasks(): ITask[] {
    const tasks: ITask[] = [];

    tasks.push(...createDebugMsvcTask(), ...createReleaseMsvcTask());
    tasks.push(...createDebugMingwTask(), ...createReleaseMingwTask());
    tasks.push(...createDebugGccTask(), ...createReleaseGccTask());

    return tasks;
}

export function createTasksFileString(): string {
    const tasks: ITask[] = createTasks();
    const tasksConfig: ITaskConfiguration = {
        tasks,
        version: "2.0.0",
    };
    const tasksFileString: string = JSON.stringify(tasksConfig, null, 4);
    return tasksFileString;
}
