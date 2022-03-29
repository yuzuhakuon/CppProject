/* eslint-disable @typescript-eslint/naming-convention */

export function createSettingFileString(cppStandard: string, cStandard: string): string {
    const settings = {
        // because of using changd, disable the C/C++ intellisense.
        // if you want to use C/C++ intellisense, you can remove the following three line.
        // if C/Cpp and clangd are in conflict, you can disable C/Cpp intelli sense engine.
        "C_Cpp.intelliSenseEngine": "Default",
        "C_Cpp.autocomplete": "Disabled",
        "C_Cpp.errorSquiggles": "Disabled",
        "C_Cpp.clang_format_fallbackStyle": "LLVM",
        "C_Cpp.clang_format_sortIncludes": true,
        "C_Cpp.default.cppStandard": cppStandard,
        "C_Cpp.default.cStandard": cStandard,
        "C_Cpp.intelliSenseCacheSize": 0,
        "C_Cpp.autoAddFileAssociations": false,
        "editor.detectIndentation": false,
        "editor.tabSize": 4,
        "C_Cpp.default.includePath": [
            "${workspaceFolder}/include",
            "${workspaceFolder}"
        ],
        "C_Cpp.default.macFrameworkPath": [
            "${workspaceFolder}/Frameworks"
        ],
        "C_Cpp.default.defines": [
            "EXAMPLE"
        ]
    };

    return JSON.stringify(settings, null, 4);
}
