# C++ Project Manager

## Introduction

Some useful operations for C++ project.

## Features

- `Create Cpp Project` Create new c++ project. For this project, a `CmakeLists.txt` file is created and already contains the basic information, we can easily run and debug with configured vscode tasks.
- `Create Cpp Class` Create new c++ class. Input a valid class name, a `.h` and `.cpp` file are created in current working directory.
- `Create Compile Commands Json` Create a `compile_commands.json` file for current project when you build the project with visual studio, but it's just a temporary solution. It's better to use `cmake` to generate compile_commands.json file.
- `Path Copy Copy` Copy the path of current file or folder which you select to clipboard. `Path Copy Copy` adds contextual menu items on all files and folders allowing the user to copy the path in various formats.
- `Add Special File` add some files into your workspase.

## How to use

1. Go to command pallete(`Ctrl + Shift + P`).
2. Select the command what you want to do. For example, `Create Cpp Project`.
3. Enter `cppp` to find commands quickly.

## Requirements

- If you want to use this project, you need to install [Cmake](https://cmake.org/download/). It would be best if you install the latest version.
- If you are on windows, you need to install [Visual Studio](https://visualstudio.microsoft.com/downloads/), or need to install [MinGW](https://www.mingw.org/download/).
- If you are on linux, you need to install [GCC](https://gcc.gnu.org/install/), or need to install [LLVM](https://github.com/llvm/llvm-project/releases).

In fact, this extension depends on other extensions [C/C++](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools),  [CMake Tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cmake-tools), it would be better if you install them first. For llvm debug support, it needs [CodeLLDB](https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb).
