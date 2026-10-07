import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

export async function loadTypeScriptModule(rootDir, relativePath) {
  const sourcePath = path.resolve(rootDir, relativePath);
  const source = fs.readFileSync(sourcePath, 'utf8');
  const { outputText, diagnostics } = ts.transpileModule(source, {
    fileName: sourcePath,
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      isolatedModules: true,
      sourceMap: false,
    },
  });
  const errors = diagnostics?.filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error) ?? [];
  if (errors.length) {
    const message = errors.map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')).join('\n');
    throw new Error(`Could not load ${relativePath}:\n${message}`);
  }
  const encoded = Buffer.from(outputText, 'utf8').toString('base64');
  return import(`data:text/javascript;base64,${encoded}`);
}
