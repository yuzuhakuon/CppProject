# C++ Project Manager

## Introduction

Some useful operations for C++ project.

## Features

- `Create Cpp Project` Create new c++ project. For this project, a `CmakeLists.txt` file is created and already contains the basic information, we can easily run and debug with configured vscode tasks.
- `Create Cpp Class` Create new c++ class. Input a valid class name, a `.h` and `.cpp` file are created in current working directory.

## How to use

1. Go to command pallete(`Ctrl + Shift + P`).
2. Select the command what you want to do. For example, `Create Cpp Project`.

## Requirements

- If you want to use this project, you need to install [Cmake](https://cmake.org/download/). It would be best if you install the latest version.
- If you are on windows, you need to install [Visual Studio](https://visualstudio.microsoft.com/downloads/), or need to install [MinGW](https://www.mingw.org/download/).
- If you are on linux, you need to install [GCC](https://gcc.gnu.org/install/).
- Saddly, we don't have a way to use on mac, or you can submit a pull request about mac support.

In fact, this extension depends on other extension [C/C++](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools), it would be better if you install it first.
