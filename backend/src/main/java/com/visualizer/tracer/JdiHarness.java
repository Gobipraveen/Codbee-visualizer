package com.visualizer.tracer;

import com.sun.jdi.ArrayReference;
import com.sun.jdi.BooleanValue;
import com.sun.jdi.ByteValue;
import com.sun.jdi.CharValue;
import com.sun.jdi.DoubleValue;
import com.sun.jdi.Field;
import com.sun.jdi.FloatValue;
import com.sun.jdi.IntegerValue;
import com.sun.jdi.LocalVariable;
import com.sun.jdi.Location;
import com.sun.jdi.LongValue;
import com.sun.jdi.ObjectReference;
import com.sun.jdi.PrimitiveValue;
import com.sun.jdi.ShortValue;
import com.sun.jdi.StackFrame;
import com.sun.jdi.StringReference;
import com.sun.jdi.ThreadReference;
import com.sun.jdi.Value;
import com.sun.jdi.VirtualMachine;
import com.sun.jdi.Bootstrap;
import com.sun.jdi.connect.Connector;
import com.sun.jdi.connect.LaunchingConnector;
import com.sun.jdi.event.ClassPrepareEvent;
import com.sun.jdi.event.Event;
import com.sun.jdi.event.EventIterator;
import com.sun.jdi.event.EventQueue;
import com.sun.jdi.event.EventSet;
import com.sun.jdi.event.ExceptionEvent;
import com.sun.jdi.event.StepEvent;
import com.sun.jdi.event.VMDeathEvent;
import com.sun.jdi.event.VMDisconnectEvent;
import com.sun.jdi.request.ClassPrepareRequest;
import com.sun.jdi.request.EventRequestManager;
import com.sun.jdi.request.ExceptionRequest;
import com.sun.jdi.request.StepRequest;
import com.visualizer.tracer.compiler.JavaCompilerUtil;
import com.visualizer.tracer.model.HeapObjectDto;
import com.visualizer.tracer.model.StackFrameDto;
import com.visualizer.tracer.model.TraceStep;
import com.visualizer.tracer.model.ValueDto;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

public class JdiHarness {

    private static final int MAX_STEPS = 1000;

    /** Holds the last uncaught exception message (type: message @ line) if any. */
    private volatile String lastRuntimeException = null;

    public String getLastRuntimeException() {
        return lastRuntimeException;
    }

    public List<TraceStep> trace(String javaSourceCode, String className) throws Exception {
        lastRuntimeException = null;
        Path buildDir = JavaCompilerUtil.compileSource(javaSourceCode, className);
        VirtualMachine vm = launchVirtualMachine(buildDir, className);

        StringBuilder stdoutBuffer = new StringBuilder();
        AtomicBoolean isProcessAlive = new AtomicBoolean(true);
        Thread stdoutReader = startStdoutReader(vm.process(), stdoutBuffer, isProcessAlive);

        List<TraceStep> traceSteps = new ArrayList<>();

        try {
            EventRequestManager erm = vm.eventRequestManager();
            ClassPrepareRequest cpr = erm.createClassPrepareRequest();
            cpr.addClassFilter(className);
            cpr.enable();

            // Also prepare request for inner classes (e.g. className$Node)
            ClassPrepareRequest innerCpr = erm.createClassPrepareRequest();
            innerCpr.addClassFilter(className + "$*");
            innerCpr.enable();

            // Capture uncaught exceptions
            ExceptionRequest excReq = erm.createExceptionRequest(null, false, true);
            excReq.setSuspendPolicy(ExceptionRequest.SUSPEND_ALL);
            excReq.enable();

            vm.resume();

            EventQueue queue = vm.eventQueue();
            int stepCounter = 0;
            boolean connected = true;

            while (connected && stepCounter < MAX_STEPS) {
                EventSet eventSet = queue.remove(2000);
                if (eventSet == null) {
                    continue;
                }

                EventIterator it = eventSet.eventIterator();
                while (it.hasNext()) {
                    Event event = it.nextEvent();

                    if (event instanceof ClassPrepareEvent cpe) {
                        ThreadReference thread = cpe.thread();
                        if (thread != null) {
                            boolean hasStepRequest = erm.stepRequests().stream()
                                    .anyMatch(sr -> sr.thread().equals(thread));
                            if (!hasStepRequest) {
                                StepRequest sr = erm.createStepRequest(thread, StepRequest.STEP_LINE, StepRequest.STEP_INTO);
                                sr.addClassExclusionFilter("java.*");
                                sr.addClassExclusionFilter("javax.*");
                                sr.addClassExclusionFilter("sun.*");
                                sr.addClassExclusionFilter("com.sun.*");
                                sr.addClassExclusionFilter("jdk.*");
                                sr.enable();
                            }
                        }
                    } else if (event instanceof ExceptionEvent ee) {
                        // Capture uncaught exception details
                        ObjectReference exc = ee.exception();
                        if (exc != null) {
                            String excType = exc.referenceType().name();
                            String excMsg = "";
                            try {
                                // Try to get the message via getMessage()
                                com.sun.jdi.Method msgMethod = exc.referenceType().methodsByName("getMessage").stream().findFirst().orElse(null);
                                if (msgMethod != null) {
                                    Value msgVal = exc.invokeMethod(ee.thread(), msgMethod, new java.util.ArrayList<>(), ObjectReference.INVOKE_SINGLE_THREADED);
                                    if (msgVal instanceof StringReference sr) {
                                        excMsg = sr.value();
                                    }
                                }
                            } catch (Exception ignored) {}
                            int excLine = ee.location() != null ? ee.location().lineNumber() : -1;
                            lastRuntimeException = excType + ": " + excMsg + " (at line " + excLine + ")";
                        }
                        connected = false;
                    } else if (event instanceof StepEvent se) {
                        Location loc = se.location();
                        String declaringTypeName = loc.declaringType().name();

                        if (declaringTypeName.equals(className) || declaringTypeName.startsWith(className + "$")) {
                            stepCounter++;
                            TraceStep step = captureStep(se.thread(), stepCounter, loc, stdoutBuffer.toString());
                            traceSteps.add(step);
                        }
                    } else if (event instanceof VMDeathEvent || event instanceof VMDisconnectEvent) {
                        connected = false;
                    }
                }

                vm.resume();
            }

        } finally {
            isProcessAlive.set(false);
            try {
                vm.dispose();
            } catch (Exception ignored) {
            }
            deleteDirectory(buildDir.toFile());
        }

        return traceSteps;
    }

    private VirtualMachine launchVirtualMachine(Path buildDir, String mainClassName) throws Exception {
        LaunchingConnector connector = Bootstrap.virtualMachineManager().defaultConnector();
        Map<String, Connector.Argument> arguments = connector.defaultArguments();

        Connector.Argument mainArg = arguments.get("main");
        if (mainArg != null) {
            mainArg.setValue(mainClassName);
        }

        Connector.Argument optionsArg = arguments.get("options");
        if (optionsArg != null) {
            optionsArg.setValue("-cp \"" + buildDir.toAbsolutePath().toString() + "\"");
        }

        return connector.launch(arguments);
    }

    private Thread startStdoutReader(Process process, StringBuilder stdoutBuffer, AtomicBoolean isProcessAlive) {
        Thread thread = new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                char[] buffer = new char[1024];
                int read;
                while ((read = reader.read(buffer)) != -1) {
                    synchronized (stdoutBuffer) {
                        stdoutBuffer.append(buffer, 0, read);
                    }
                }
            } catch (Exception ignored) {
            }
        });
        thread.setDaemon(true);
        thread.start();
        return thread;
    }

    private TraceStep captureStep(ThreadReference thread, int stepNum, Location location, String currentStdout) {
        List<StackFrameDto> stackList = new ArrayList<>();
        Map<String, HeapObjectDto> heapMap = new LinkedHashMap<>();

        try {
            List<StackFrame> frames = thread.frames();
            for (StackFrame frame : frames) {
                Location frameLoc = frame.location();
                String declaringType = frameLoc.declaringType().name();

                // Only include stack frames belonging to user code
                if (!declaringType.startsWith("java.") && !declaringType.startsWith("jdk.") && !declaringType.startsWith("sun.")) {
                    String methodName = frameLoc.method().name();
                    int line = frameLoc.lineNumber();

                    Map<String, ValueDto> variables = new LinkedHashMap<>();
                    try {
                        List<LocalVariable> visVars = frame.visibleVariables();
                        for (LocalVariable var : visVars) {
                            Value val = frame.getValue(var);
                            ValueDto valDto = inspectValue(val, heapMap);
                            variables.put(var.name(), valDto);
                        }
                    } catch (Exception ignored) {
                    }

                    stackList.add(new StackFrameDto(methodName, declaringType, line, variables));
                }
            }
        } catch (Exception ignored) {
        }

        return new TraceStep(stepNum, location.lineNumber(), stackList, heapMap, currentStdout);
    }

    private ValueDto inspectValue(Value value, Map<String, HeapObjectDto> heapMap) {
        if (value == null) {
            return new ValueDto("null", null);
        }

        if (value instanceof PrimitiveValue pv) {
            return new ValueDto("primitive", extractPrimitive(pv));
        }

        if (value instanceof StringReference sr) {
            return new ValueDto("string", sr.value());
        }

        if (value instanceof ArrayReference ar) {
            String refId = "ref_" + ar.uniqueID();
            if (!heapMap.containsKey(refId)) {
                HeapObjectDto arrayObj = new HeapObjectDto(refId, ar.referenceType().name(), new LinkedHashMap<>());
                heapMap.put(refId, arrayObj);

                List<Value> elements = ar.getValues();
                for (int i = 0; i < elements.size(); i++) {
                    Value elementValue = elements.get(i);
                    ValueDto elementDto = inspectValue(elementValue, heapMap);
                    arrayObj.getFields().put("[" + i + "]", elementDto);
                }
            }
            return new ValueDto("reference", refId);
        }

        if (value instanceof ObjectReference objRef) {
            String refId = "ref_" + objRef.uniqueID();
            if (!heapMap.containsKey(refId)) {
                HeapObjectDto heapObj = new HeapObjectDto(refId, objRef.referenceType().name(), new LinkedHashMap<>());
                heapMap.put(refId, heapObj);

                try {
                    List<Field> fields = objRef.referenceType().allFields();
                    for (Field field : fields) {
                        if (!field.isStatic()) {
                            Value fieldValue = objRef.getValue(field);
                            ValueDto fieldDto = inspectValue(fieldValue, heapMap);
                            heapObj.getFields().put(field.name(), fieldDto);
                        }
                    }
                } catch (Exception ignored) {
                }
            }
            return new ValueDto("reference", refId);
        }

        return new ValueDto("unknown", value.toString());
    }

    private Object extractPrimitive(PrimitiveValue pv) {
        if (pv instanceof BooleanValue bv) return bv.value();
        if (pv instanceof IntegerValue iv) return iv.value();
        if (pv instanceof LongValue lv) return lv.value();
        if (pv instanceof DoubleValue dv) return dv.value();
        if (pv instanceof FloatValue fv) return fv.value();
        if (pv instanceof CharValue cv) return cv.value();
        if (pv instanceof ByteValue bv) return bv.value();
        if (pv instanceof ShortValue sv) return sv.value();
        return pv.toString();
    }

    private void deleteDirectory(File dir) {
        if (dir.exists()) {
            File[] files = dir.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory()) {
                        deleteDirectory(file);
                    } else {
                        file.delete();
                    }
                }
            }
            dir.delete();
        }
    }
}
