import { getLines } from "../../common/utils";

enum CppStandardEnum {
    // cpp98 = "c++98",
    // cpp03 = "c++03",
    cpp11 = "c++11",
    cpp14 = "c++14",
    cpp17 = "c++17",
    // cpp20 = "c++20",
    // cppLatest = "c++20",

    // gun98 = "gnu++98",
    // gun03 = "gnu++03",
    // gun11 = "gnu++11",
    // gun14 = "gnu++14",
    // gun17 = "gnu++17",
    // gun20 = "gnu++20",
    // gunLatest = "gnu++20",
}

enum CStandardEnum {
    c89 = "c89",
    c99 = "c99",
    c11 = "c11",
    c17 = "c17",
    cLatest = "c17",

    gnu89 = "gnu89",
    gnu99 = "gnu99",
    gnu11 = "gnu11",
    gnu17 = "gnu17",
    gnuLatest = "gnu17",
}

interface CCppKeyValue {
    cStandard: {
        key: string[];
        value: string[]
    };
    cppStandard: {
        key: string[];
        value: string[]
    };
}

type CppStandard = keyof typeof CppStandardEnum;
type CStandard = keyof typeof CStandardEnum;

export interface ICppProjectConfig {
    projectName: string;
    cppStandard: string;
    cStandard: string;
}

// get string from enum
export function getCCppStandardString(): CCppKeyValue {
    const cKeys = Object.keys(CStandardEnum);
    const cppKeys = Object.keys(CppStandardEnum);
    const cValues: string[] = [];
    const cppValues: string[] = [];
    for (const key of cKeys) {
        cValues.push(CStandardEnum[key as CStandard]);
    }
    for (const key of cppKeys) {
        cppValues.push(CppStandardEnum[key as CppStandard]);
    }
    return {
        cStandard: {
            key: cKeys,
            value: cValues,
        },
        cppStandard: {
            key: cppKeys,
            value: cppValues,
        },
    };
}

export function createCmakeFileString(programName: string, cppStandard: string): string {
    const generation = cppStandard.replace(/[^\d]/g, '');
    const cppStandardString = `
    ${generation ? '' : '# '}set(CMAKE_CXX_STANDARD ${generation})
    ${generation ? '' : '# '}set(CMAKE_CXX_STANDARD_REQUIRED ON)`;

    const cmake = `
        # cmake minimum required version
        cmake_minimum_required(VERSION 3.13)
        
        # project name
        project(${programName})
        
        
        ${cppStandardString}
        # set(CMAKE_C_STANDARD 17)
        # set(CMAKE_C_STANDARD_REQUIRED True)


        # cuda tips
        # project(${programName} LANGUAGES CXX CUDA)
        # enable_language(CUDA)

        # # if use conan
        # include(\${PROJECT_SOURCE_DIR}/build/conanbuildinfo.cmake)
        # conan_basic_setup()
        
        # build type
        if(CMAKE_BUILD_TYPE AND (CMAKE_BUILD_TYPE STREQUAL "Debug"))
        set(CMAKE_C_FLAGS_DEBUG "\${CMAKE_C_FLAGS_DEBUG} -Wall -O0")
        add_definitions(-DDEBUG -D_DEBUG -DDEBUG_MODE)
        message("Debug mode:\${CMAKE_C_FLAGS_DEBUG}")
        elseif(CMAKE_BUILD_TYPE AND (CMAKE_BUILD_TYPE STREQUAL "Release"))
        set(CMAKE_C_FLAGS_RELEASE "\${CMAKE_C_FLAGS_RELEASE} -Wall -O3")
        add_definitions(-DNDEBUG -DRELEASE_MODE -DNDEBUG_MODE)
        message("Release mode:\${CMAKE_C_FLAGS_RELEASE}")
        endif()

            
        message("Identifying the OS...")
        if (CMAKE_SYSTEM_NAME MATCHES "Windows")
        message("This is Windows.")
        add_compile_options(/utf-8)
        add_definitions(-D_CRT_SECURE_NO_WARNINGS -DUNICODE -D_UNICODE)
        elseif (CMAKE_SYSTEM_NAME MATCHES "Linux")
        message("This is Linux.")
        # add_compile_options(-fPIC)
        elseif (CMAKE_SYSTEM_NAME MATCHES "Darwin")
        message("This is Mac OS X.")
        endif()


        aux_source_directory(src DIR_SRCS)


        add_executable(\${PROJECT_NAME})
        # target_compile_definitions(\${PROJECT_NAME} PRIVATE FOO)
        target_sources(\${PROJECT_NAME} PRIVATE \${DIR_SRCS})
        # target_link_directories(foo PUBLIC \${PROJECT_SOURCE_DIR}/lib)
        # target_link_libraries(\${PROJECT_NAME} \${CONAN_LIBS})


        foreach(_target \${PROJECT_NAME})
            # target_sources({_target} PRIVATE )
            target_include_directories(\${_target} PUBLIC \${PROJECT_SOURCE_DIR}/include)
            set_target_properties(\${_target} PROPERTIES 
                ARCHIVE_OUTPUT_DIRECTORY "\${CMAKE_BINARY_DIR}/../lib"
                LIBRARY_OUTPUT_DIRECTORY "\${CMAKE_BINARY_DIR}/../lib"
                RUNTIME_OUTPUT_DIRECTORY "\${CMAKE_BINARY_DIR}/../bin"
                RUNTIME_OUTPUT_DIRECTORY_DEBUG "\${CMAKE_BINARY_DIR}/../bin"
                RUNTIME_OUTPUT_DIRECTORY_RELEASE "\${CMAKE_BINARY_DIR}/../bin"
                LIBRARY_OUTPUT_DIRECTORY_DEBUG "\${CMAKE_BINARY_DIR}/../bin"
                LIBRARY_OUTPUT_DIRECTORY_RELEASE "\${CMAKE_BINARY_DIR}/../bin"
                ARCHIVE_OUTPUT_DIRECTORY_DEBUG "\${CMAKE_BINARY_DIR}/../bin"
                ARCHIVE_OUTPUT_DIRECTORY_RELEASE "\${CMAKE_BINARY_DIR}/../bin"
            )
        endforeach()
    `;

    return getLines(cmake).join('\n');
}

export function createClangFormatFileString() {
    const clangFormat = `
# https://clang.llvm.org/docs/ClangFormatStyleOptions.html
# https://www.bbsmax.com/A/VGzlMjexJb/

---
Language: Cpp
BasedOnStyle: LLVM
AccessModifierOffset: -4 # -2
AlignAfterOpenBracket: Align
AlignConsecutiveAssignments: false
AlignConsecutiveDeclarations: false
AlignEscapedNewlines: Right
AlignOperands: true
AlignTrailingComments: true
AllowAllParametersOfDeclarationOnNextLine: true
AllowShortBlocksOnASingleLine: false
AllowShortCaseLabelsOnASingleLine: false
AllowShortFunctionsOnASingleLine: All
AllowShortIfStatementsOnASingleLine: false
AllowShortLoopsOnASingleLine: false
AlwaysBreakAfterDefinitionReturnType: None
AlwaysBreakAfterReturnType: None
AlwaysBreakBeforeMultilineStrings: false
AlwaysBreakTemplateDeclarations: true # false
BinPackArguments: true
BinPackParameters: true
BraceWrapping:
    AfterClass: true # false
    AfterControlStatement: true # false
    AfterEnum: true # false
    AfterFunction: true # false
    AfterNamespace: true # false
    AfterObjCDeclaration: true # false
    AfterStruct: true # false
    AfterUnion: true # false
    AfterExternBlock: true # false
    BeforeCatch: true # false
    BeforeElse: true # false
    IndentBraces: true # false
    SplitEmptyFunction: true
    SplitEmptyRecord: true
    SplitEmptyNamespace: true
BreakBeforeBinaryOperators: None
BreakBeforeBraces: Allman # Attach
BreakBeforeInheritanceComma: false
BreakBeforeTernaryOperators: true
BreakConstructorInitializersBeforeComma: false
BreakConstructorInitializers: BeforeColon
BreakAfterJavaFieldAnnotations: false
BreakStringLiterals: true
ColumnLimit: 120
CommentPragmas: "^ IWYU pragma:"
CompactNamespaces: false
ConstructorInitializerAllOnOneLineOrOnePerLine: false
ConstructorInitializerIndentWidth: 4
ContinuationIndentWidth: 4
Cpp11BracedListStyle: true
DerivePointerAlignment: false
DisableFormat: false
ExperimentalAutoDetectBinPacking: false
FixNamespaceComments: true
ForEachMacros:
    - foreach
    - Q_FOREACH
    - BOOST_FOREACH
IncludeBlocks: Preserve
IncludeCategories:
    - Regex: '^"(llvm|llvm-c|clang|clang-c)/'
      Priority: 2
    - Regex: '^(<|"(gtest|gmock|isl|json)/)'
      Priority: 3
    - Regex: ".*"
      Priority: 1
IncludeIsMainRegex: "(Test)?$"
IndentCaseLabels: true # false
IndentPPDirectives: None
IndentWidth: 4 #2
IndentWrappedFunctionNames: false
JavaScriptQuotes: Leave
JavaScriptWrapImports: true
KeepEmptyLinesAtTheStartOfBlocks: true
MacroBlockBegin: ""
MacroBlockEnd: ""
MaxEmptyLinesToKeep: 1
NamespaceIndentation: None
ObjCBlockIndentWidth: 2
ObjCSpaceAfterProperty: false
ObjCSpaceBeforeProtocolList: true
PenaltyBreakAssignment: 2
PenaltyBreakBeforeFirstCallParameter: 19
PenaltyBreakComment: 300
PenaltyBreakFirstLessLess: 120
PenaltyBreakString: 1000
PenaltyExcessCharacter: 1000000
PenaltyReturnTypeOnItsOwnLine: 60
PointerAlignment: Left # Right
ReflowComments: true
SortIncludes: true
SortUsingDeclarations: true
SpaceAfterCStyleCast: false
SpaceAfterTemplateKeyword: true
SpaceBeforeAssignmentOperators: true
SpaceBeforeParens: ControlStatements
SpaceInEmptyParentheses: false
SpacesBeforeTrailingComments: 1
SpacesInAngles: false
SpacesInContainerLiterals: true
SpacesInCStyleCastParentheses: false
SpacesInParentheses: false
SpacesInSquareBrackets: false
Standard: Cpp11
TabWidth: 8
UseTab: Never
`;
    return clangFormat;
}

export function createMainCppFileString() {
    const mainCpp = `#include <iostream>

int main(int argc, char* argv[])
{
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
`;
    return mainCpp;
}

/**
 * create c++ header file string
 */
export function createCppHeaderFileString(name: string) {
    const words = name.split('_');
    const className = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    const cppHeader = `#ifndef INCLUDE_${name.toUpperCase()}_H
#define INCLUDE_${name.toUpperCase()}_H

class ${className}
{
public:
    ${className}();
    ~${className}();
};

#endif // !INCLUDE_${name.toUpperCase()}_H
`;

    return cppHeader;
}

/**
 * create c++ source file string
 */
export function createCppSourceFileString(name: string) {
    const words = name.split('_');
    const className = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    const cppSourceFile = `#include "${name}.h"

${className}::${className}()
{
}

${className}::~${className}()
{
}

`;

    return cppSourceFile;
}