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
    options: string[],
    cppStandard?: string,
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
                const additionOptions: string[] = [];
                let cppStandard: string = "c++17";

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
                }
                if (itemDefinitionGroup[i].ResourceCompile.PreprocessorDefinitions) {
                    const define = itemDefinitionGroup[i].ResourceCompile.PreprocessorDefinitions;
                    if (define._text) {
                        define._text.split(';').filter((element: string) => {
                            var reg = /^[a-zA-Z0-9_]+$/;
                            reg.test(element.trim()) && defines.push(element.trim());
                        });
                    }
                }

                if (itemDefinitionGroup[i].ClCompile.LanguageStandard) {
                    const languageStandard = itemDefinitionGroup[i].ClCompile.LanguageStandard._text;
                    const generation = languageStandard.replace(/[^\d]/g, '');
                    if (generation) {
                        cppStandard = `c++${generation}`;
                    }
                }

                // CUDA Compile
                if (itemDefinitionGroup[i].CudaCompile) {
                    if (itemDefinitionGroup[i].CudaCompile.Include) {
                        const include = itemDefinitionGroup[i].CudaCompile.Include;
                        if (include._text) {
                            include._text.split(';').forEach((element: string) => {
                                fs.existsSync(element.trim()) && includes.push(element.trim());
                            });
                        }
                    }

                    if (itemDefinitionGroup[i].CudaCompile.Defines) {
                        const define = itemDefinitionGroup[i].CudaCompile.Defines;
                        if (define._text) {
                            define._text.split(';').filter((element: string) => {
                                var reg = /^[a-zA-Z0-9_]+$/;
                                reg.test(element.trim()) && defines.push(element.trim());
                            });
                        }
                    }
                }

                if (name) {
                    const item: ItemDefinition = {
                        name: name,
                        includes: [...new Set(includes)],
                        defines: [...new Set(defines)],
                        options: [...new Set(additionOptions)],
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
            const compileFile = itemGroup[i].ClCompile || itemGroup[i].CudaCompile;
            if (compileFile) {
                if (compileFile._attributes) {
                    const file = compileFile._attributes.Include;
                    if (file) {
                        files.push(file);
                    }
                } else if (compileFile.length) {
                    for (let j = 0; j < compileFile.length; j++) {
                        const file = compileFile[j]._attributes.Include;
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
        if (cppStandard) {
            compileCommand.arguments.push("-std=" + cppStandard);
        }
        compileCommand.arguments.push(...["-c", "-o", fileNameWithoutExtension + ".o", file]);

        return compileCommand;
    }
}
