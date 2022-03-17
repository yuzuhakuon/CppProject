import * as fs from 'fs';
import * as path from 'path';
var convert = require('xml-js');

export interface ICompileCommand {
    directory: string,
    arguments: string[],
    file: string,
}

interface ItemDefinition {
    name: string,
    includes: string[],
    defines: string[],
    cppStandard: string,
}

interface CompileCommandConfig {
    [key: string]: ICompileCommand[];
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

    public parse(): CompileCommandConfig {
        const compileCommandsGroup: CompileCommandConfig = {};
        const items = this.parseVcxproj();
        const files = this.parseFilter();

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const compileCommandArray: ICompileCommand[] = [];
            for (let j = 0; j < files.length; j++) {
                const file = path.basename(files[j]);
                const compileCommand = this.createCompileCommand(file, this.directory, item);
                compileCommandArray.push(compileCommand);
            }

            compileCommandsGroup[item.name] = compileCommandArray;
        }

        return compileCommandsGroup;
    }

    private parseVcxproj(): ItemDefinition[] {
        const items: ItemDefinition[] = [];
        const json = convert.xml2js(this.vcxprojContent, { compact: true, spaces: 4 });

        const itemDefinitionGroup = json.Project.ItemDefinitionGroup;
        if (itemDefinitionGroup.length) {
            for (let i = 0; i < itemDefinitionGroup.length; i++) {
                let name: string = "";
                const includes: string[] = [];
                const defines: string[] = [];
                let cppStandard: string = "c++11";

                if (itemDefinitionGroup[i]._attributes.Condition) {
                    const rawName = itemDefinitionGroup[i]._attributes.Condition.split("==")[1].trim();
                    name = rawName.substring(1, rawName.length - 1);
                }
                if (itemDefinitionGroup[i].ClCompile.AdditionalIncludeDirectories) {
                    const include = itemDefinitionGroup[i].ClCompile.AdditionalIncludeDirectories;
                    if (include._text) {
                        include._text.split(';').forEach((element: string) => {
                            fs.existsSync(element.trim()) && includes.push(element.trim());
                        });
                    }
                }

                if (itemDefinitionGroup[i].ClCompile.PreprocessorDefinitions) {
                    const define = itemDefinitionGroup[i].ClCompile.PreprocessorDefinitions;
                    if (define._text) {
                        define._text.split(';').filter((element: string) => {
                            var reg = /^[a-zA-Z0-9_]+$/;
                            reg.test(element.trim()) && defines.push(element.trim());
                        });
                    }

                    if(name.indexOf("Debug") >= 0) {
                        defines.push("DEBUG");
                        defines.push("_DEBUG");
                    }
                }

                if (itemDefinitionGroup[i].ClCompile.LanguageStandard) {
                    const languageStandard = itemDefinitionGroup[i].ClCompile.LanguageStandard._text;
                    const generation = languageStandard.replace(/[^\d]/g, '');
                    if (generation) {
                        cppStandard = `c++${generation}`;
                    }
                }

                if (name) {
                    const item: ItemDefinition = {
                        name: name,
                        includes: [...new Set(includes)],
                        defines: [...new Set(defines)],
                        cppStandard: cppStandard,
                    };
                    items.push(item);
                }
            }
        }

        return items;
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

    private createCompileCommand(file: string, directory: string, item: ItemDefinition): ICompileCommand {
        const fileNameWithoutExtension = path.basename(file, path.extname(file));
        const compileCommand: ICompileCommand = {
            directory: directory,
            arguments: ["g++"],
            file: file,
        };
        const includes = item.includes;
        const defines = item.defines;
        const cppStandard = item.cppStandard;

        for (let i = 0; i < includes.length; i++) {
            compileCommand.arguments.push("-I" + includes[i]);
        }
        for (let i = 0; i < defines.length; i++) {
            compileCommand.arguments.push("-D" + defines[i]);
        }
        compileCommand.arguments.push("-std=" + cppStandard);
        compileCommand.arguments.push(...["-c", "-o", fileNameWithoutExtension + ".o", file]);

        return compileCommand;
    }
}
