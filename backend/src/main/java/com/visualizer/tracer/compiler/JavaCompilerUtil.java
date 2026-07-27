package com.visualizer.tracer.compiler;

import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;

public class JavaCompilerUtil {

    public static Path compileSource(String javaSourceCode, String className) throws IOException {
        Path tempDir = Files.createTempDirectory("codbee_build_");
        Path sourceFile = tempDir.resolve(className + ".java");
        Files.writeString(sourceFile, javaSourceCode);

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) {
            throw new IllegalStateException("System JavaCompiler not available. Ensure JDK (not JRE) is being used.");
        }

        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        try (StandardJavaFileManager fileManager = compiler.getStandardFileManager(diagnostics, null, null)) {
            Iterable<? extends JavaFileObject> compilationUnits = fileManager.getJavaFileObjectsFromFiles(List.of(sourceFile.toFile()));
            List<String> options = Arrays.asList("-g", "-d", tempDir.toAbsolutePath().toString());

            JavaCompiler.CompilationTask task = compiler.getTask(
                    null,
                    fileManager,
                    diagnostics,
                    options,
                    null,
                    compilationUnits
            );

            boolean success = task.call();
            if (!success) {
                StringBuilder errorMsg = new StringBuilder("Compilation failed for " + className + ":\n");
                for (Diagnostic<? extends JavaFileObject> diagnostic : diagnostics.getDiagnostics()) {
                    errorMsg.append(diagnostic.toString()).append("\n");
                }
                throw new RuntimeException(errorMsg.toString());
            }
        }

        return tempDir;
    }
}
