package com.visualizer.backend.service;

import com.visualizer.backend.dto.VisualizeRequest;
import com.visualizer.backend.dto.VisualizeResponse;
import com.visualizer.tracer.JdiHarness;
import com.visualizer.tracer.model.TraceStep;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Service
public class VisualizeService {

    private final JdiHarness jdiHarness = new JdiHarness();

    public VisualizeResponse visualize(VisualizeRequest request) {
        String code = request.getCode();
        String className = (request.getClassName() != null && !request.getClassName().trim().isEmpty())
                ? request.getClassName().trim()
                : "Main";

        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<List<TraceStep>> future = executor.submit(() -> jdiHarness.trace(code, className));

        try {
            List<TraceStep> steps = future.get(10, TimeUnit.SECONDS);
            String runtimeException = jdiHarness.getLastRuntimeException();
            return new VisualizeResponse(steps, runtimeException);
        } catch (TimeoutException e) {
            future.cancel(true);
            return new VisualizeResponse(new ArrayList<>(), "Execution timed out");
        } catch (ExecutionException e) {
            Throwable cause = e.getCause();
            String errorMsg = (cause != null && cause.getMessage() != null)
                    ? cause.getMessage()
                    : "Execution failed: " + e.getMessage();
            return new VisualizeResponse(new ArrayList<>(), errorMsg);
        } catch (Exception e) {
            return new VisualizeResponse(new ArrayList<>(), "Internal error: " + e.getMessage());
        } finally {
            executor.shutdownNow();
        }
    }
}
