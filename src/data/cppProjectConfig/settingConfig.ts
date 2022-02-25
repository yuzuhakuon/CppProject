/* eslint-disable @typescript-eslint/naming-convention */

export function createSettingFileString(cppStandard: string, cStandard: string): string {
    const settings = {
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
