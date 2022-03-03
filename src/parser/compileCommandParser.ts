import * as fs from 'fs';
import * as path from 'path';
var convert = require('xml-js');

export interface ICompileCommand {
    directory: string,
    arguments: string[],
    file: string,
}

export class CompileCommandParser {
    private directory: string;
    private vcxprojContent: string;
    private vcxprojFilterContent: string;
    constructor(directory: string, vcxprojContent: string, vcxprojFilterContent: string) {
        this.directory = directory;
        this.vcxprojContent = vcxprojContent;
        this.vcxprojFilterContent = vcxprojFilterContent;
    }

    public parse(): ICompileCommand[] {
        const compileCommandsArray: ICompileCommand[] = [];
        const includes = this.parseVcxproj();
        const files = this.parseFilter();

        for (let i = 0; i < files.length; i++) {
            const file = path.basename(files[i]);
            compileCommandsArray.push(this.createCompileCommand(file, this.directory, includes));
        }

        return compileCommandsArray;
    }

    private parseVcxproj(): string[] {
        const includes: string[] = [];
        const json = convert.xml2js(this.vcxprojContent, { compact: true, spaces: 4 });

        const itemDefinitionGroup = json.Project.ItemDefinitionGroup;
        if (itemDefinitionGroup.length) {
            for (let i = 0; i < itemDefinitionGroup.length; i++) {
                if (itemDefinitionGroup[i].ClCompile.AdditionalIncludeDirectories) {
                    const include = itemDefinitionGroup[i].ClCompile.AdditionalIncludeDirectories;
                    if (include._text) {
                        include._text.split(';').forEach((element: string) => {
                            fs.existsSync(element.trim()) && includes.push(element.trim());
                        });
                    }
                }

            }
        }

        return [...new Set(includes)];
    }

    private parseFilter(): string[] {
        const files: string[] = [];
        const json = convert.xml2js(this.vcxprojFilterContent, { compact: true, spaces: 4 });

        const itemGroup = json.Project.ItemGroup;
        for (let i = 0; i < itemGroup.length; i++) {
            const item = itemGroup[i];
            if (item.ClCompile) {
                if (item.ClCompile._attributes) {
                    const file = item.ClCompile._attributes.Include;
                    if (file) {
                        files.push(file);
                    }
                } else if (item.ClCompile.length) {
                    for (let j = 0; j < item.ClCompile.length; j++) {
                        const file = item.ClCompile[j]._attributes.Include;
                        if (file) {
                            files.push(file);
                        }
                    }
                }
            }
        }
        return files;
    }

    private createCompileCommand(file: string, directory: string, includes: string[]): ICompileCommand {
        const fileNameWithoutExtension = path.basename(file, path.extname(file));
        const compileCommand: ICompileCommand = {
            directory: directory,
            arguments: ["g++"],
            file: file,
        };
        for (let i = 0; i < includes.length; i++) {
            const include = includes[i];
            compileCommand.arguments.push("-I" + include);
        }
        compileCommand.arguments.push(...["-c", "-o", fileNameWithoutExtension + ".o", file]);

        return compileCommand;
    }
}
