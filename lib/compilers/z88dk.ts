// Copyright (c) 2022, Compiler Explorer Authors
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright notice,
//       this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

import path from 'path';

import {ExecutionOptions} from '../../types/compilation/compilation.interfaces';
import {ParseFilters} from '../../types/features/filters.interfaces';
import {BaseCompiler} from '../base-compiler';
import {AsmParserZ88dk} from '../parsers/asm-parser-z88dk';

export class z88dkCompiler extends BaseCompiler {
    static get key() {
        return 'z88dk';
    }

    constructor(compilerInfo, env) {
        super(compilerInfo, env);
        this.outputFilebase = 'example';
        this.asm = new AsmParserZ88dk(this.compilerProps);
    }

    public override getOutputFilename(dirPath: string, outputFilebase: string, key?: any): string {
        let filename;
        if (key && key.backendOptions && key.backendOptions.customOutputFilename) {
            filename = key.backendOptions.customOutputFilename;
        } else if (key && key.filters.binary) {
            filename = `${outputFilebase}.s`;
        } else {
            filename = `${outputFilebase}.c.asm`;
        }

        if (dirPath) {
            return path.join(dirPath, filename);
        } else {
            return filename;
        }
    }

    public override orderArguments(
        options,
        inputFilename,
        libIncludes,
        libOptions,
        libPaths,
        libLinks,
        userOptions,
        staticLibLinks,
    ) {
        return userOptions.concat(
            options,
            [this.filename(inputFilename)],
            libIncludes,
            libOptions,
            libPaths,
            libLinks,
            staticLibLinks,
        );
    }

    protected override optionsForFilter(filters: ParseFilters, outputFilename: string): string[] {
        if (!filters.binary) {
            return ['-S'];
        } else {
            return ['-o', outputFilename];
        }
    }

    override getDefaultExecOptions(): ExecutionOptions {
        const opts = super.getDefaultExecOptions();
        opts.env.ZCCCFG = path.join(path.dirname(this.compiler.exe), '../share/z88dk/lib/config');
        opts.env.PATH = process.env.PATH + path.delimiter + path.dirname(this.compiler.exe);

        return opts;
    }
}
