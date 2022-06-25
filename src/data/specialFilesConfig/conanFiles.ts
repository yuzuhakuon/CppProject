import { FileContainer } from "../../types/types"

interface ConanProfile {
    os: "Windows" | "Linux"
    arch: "x86" | "x86_64"
    compiler: "gcc" | "MinGW" | "Visual Studio"
    compilerVersion: string
    buildType: "Debug" | "Release"
}

function createConanProfile(profile: ConanProfile) {
    const text =
        `[settings]
os=${profile.os}
os_build=${profile.os}
arch=${profile.arch}
compiler=${profile.compiler}
compiler.version=${profile.compilerVersion}
build_type=${profile.buildType}
[options]
[build_requires]
[env]
`;

    return text;
}

function creatConanFile() {
    const text =
        `[requires]

[generators]
cmake

[imports]
bin, * -> ../bin
lib, *.a -> ../lib
bin, *.so -> ../lib
`;

    return text;
}

function createConanDevPy() {
    const text = `# -*- coding: utf-8 -*-
import subprocess
import argparse
import platform
import json
import os
import re

parser = argparse.ArgumentParser(description='help to build project.')
parser.add_argument('type',
                    default="install",
                    choices=["install", "info"],
                    help='project type')
parser.add_argument('--build_type',
                    default="Debug",
                    choices=["Debug", "Release"],
                    help='build type')
parser.add_argument('--arch',
                    default="x86",
                    choices=["x86", "x86_64"],
                    help='architecture')
parser.add_argument('--os',
                    default="Windows",
                    choices=["Windows", "Linux"],
                    help='operation system')

parser.add_argument('--src', default=".", type=str, help='source')
parser.add_argument('--dst', default=".", type=str, help='destination')

args = parser.parse_args()


def run():
    if args.type == "install":
        install_conan_deps()
    elif args.type == "info":
        set_info()
    elif args.type == "build":
        # build()
        ...


def install_conan_deps():
    conan_profile = None
    if (platform.system() == "Windows"):
        if args.arch == "x86" and args.build_type == "Debug":
            conan_profile = "./conan_profile/debug_win32"
        elif args.arch == "x86" and args.build_type == "Release":
            conan_profile = "./conan_profile/release_win32"
        elif args.arch == "x86_64" and args.build_type == "Debug":
            conan_profile = "./conan_profile/debug_win64"
        elif args.arch == "x86_64" and args.build_type == "Release":
            conan_profile = "./conan_profile/release_win64"
    elif (platform.system() == "Linux"):
        if args.arch == "x86_64" and args.build_type == "Debug":
            conan_profile = "./conan_profile/debug_linux"
        elif args.arch == "x86_64" and args.build_type == "Release":
            conan_profile = "./conan_profile/release_linux"

    if (conan_profile == None):
        raise Exception("Unknown profile")

    subprocess.check_call("conan remove plugin_core -f", shell=True)

    subprocess.check_call(
        "conan install . --install-folder=conan_deps -pr={0} -r=stable".format(
            conan_profile),
        shell=True)

    subprocess.check_call(
        "conan info . -r stable --graph ./conan_deps/info.html", shell=True)


def set_info():
    if platform.system() != "Windows":
        return

    info = None
    with open("package.json", encoding="utf-8") as fn:
        info = json.load(fn)

    exe = info["rcedit"]["exe"]
    icon = info["rcedit"]["options"]["icon"]
    file_version = info["rcedit"]["options"]["file-version"]
    product_version = info["rcedit"]["options"]["product-version"]
    product_name = info["rcedit"]["options"]["version-string"]["ProductName"]
    file_description = info["rcedit"]["options"]["version-string"][
        "FileDescription"]
    company_name = info["rcedit"]["options"]["version-string"]["CompanyName"]
    legal_copyright = info["rcedit"]["options"]["version-string"][
        "LegalCopyright"]

    subprocess.check_call(
        "rcedit \\"{exe}\\" --set-product-version \\"{product_ver}\\" --set-file-version \\"{file_ver}\\" --set-icon \\"{icon}\\""
        .format(exe=exe,
                product_ver=product_version,
                file_ver=file_version,
                icon=icon),
        shell=True)

    subprocess.check_call(
        "rcedit \\"{exe}\\" --set-version-string \\"ProductName\\" \\"{0}\\"".format(
            product_name, exe=exe),
        shell=True)
    subprocess.check_call(
        "rcedit \\"{exe}\\" --set-version-string \\"FileDescription\\" \\"{0}\\"".
        format(file_description, exe=exe),
        shell=True)
    subprocess.check_call(
        "rcedit \\"{exe}\\" --set-version-string \\"CompanyName\\" \\"{0}\\"".format(
            company_name, exe=exe),
        shell=True)
    subprocess.check_call(
        "rcedit \\"{exe}\\" --set-version-string \\"LegalCopyright\\" \\"{0}\\"".
        format(legal_copyright, exe=exe),
        shell=True)

def exclude_files(root, exclude_regex):
    for root, dirs, files in os.walk(root):
        for file in files:
            if re.match(exclude_regex, file):
                os.remove(os.path.join(root, file))


if __name__ == "__main__":
    run()

`;

    return text;
}

function createConanContainer(): FileContainer {
    const files: { path: string; text: string, overwrite?: boolean }[] = [];
    const debugWin32: ConanProfile = {
        os: "Windows",
        arch: "x86",
        compiler: "Visual Studio",
        compilerVersion: "16",
        buildType: "Debug",
    };
    const releaseWin32: ConanProfile = {
        os: "Windows",
        arch: "x86",
        compiler: "Visual Studio",
        compilerVersion: "16",
        buildType: "Release",
    };
    const debugWin64: ConanProfile = {
        os: "Windows",
        arch: "x86_64",
        compiler: "Visual Studio",
        compilerVersion: "16",
        buildType: "Debug",
    };
    const releaseWin64: ConanProfile = {
        os: "Windows",
        arch: "x86_64",
        compiler: "Visual Studio",
        compilerVersion: "16",
        buildType: "Release",
    };
    const debugLinux: ConanProfile = {
        os: "Linux",
        arch: "x86_64",
        compiler: "gcc",
        compilerVersion: "9.3",
        buildType: "Debug",
    };
    const releaseLinux: ConanProfile = {
        os: "Linux",
        arch: "x86_64",
        compiler: "gcc",
        compilerVersion: "9.3",
        buildType: "Release",
    };

    const displayName = "conan";
    {
        files.push({ path: "conan_profile/debug_win32", text: createConanProfile(debugWin32) });
        files.push({ path: "conan_profile/release_win32", text: createConanProfile(releaseWin32) });
        files.push({ path: "conan_profile/debug_win64", text: createConanProfile(debugWin64) });
        files.push({ path: "conan_profile/release_win64", text: createConanProfile(releaseWin64) });
        files.push({ path: "conan_profile/debug_linux", text: createConanProfile(debugLinux) });
        files.push({ path: "conan_profile/release_linux", text: createConanProfile(releaseLinux) });
        files.push({ path: "conanfile.txt", text: creatConanFile() });
        files.push({ path: "conan_dev.py", text: createConanDevPy() });
    }

    return {
        displayName,
        files
    };
}

export const fileContainer: FileContainer[] = [
    createConanContainer(),
];
