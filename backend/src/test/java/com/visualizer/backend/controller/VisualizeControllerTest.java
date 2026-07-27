package com.visualizer.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visualizer.backend.dto.VisualizeRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class VisualizeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/visualize with valid Java code returns HTTP 200 and trace steps")
    void testVisualizeSuccess() throws Exception {
        String code = """
                public class Main {
                    public static void main(String[] args) {
                        int a = 5;
                        int b = 10;
                        int sum = a + b;
                        System.out.println("Sum: " + sum);
                    }
                }
                """;

        VisualizeRequest request = new VisualizeRequest("java", code, "Main");

        mockMvc.perform(post("/api/visualize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.error", nullValue()))
                .andExpect(jsonPath("$.trace", not(empty())));
    }

    @Test
    @DisplayName("POST /api/visualize with invalid Java syntax returns HTTP 200 with error message")
    void testVisualizeCompilationError() throws Exception {
        String code = """
                public class Main {
                    public static void main(String[] args) {
                        int a = ; // syntax error
                    }
                }
                """;

        VisualizeRequest request = new VisualizeRequest("java", code, "Main");

        mockMvc.perform(post("/api/visualize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.error", not(nullValue())))
                .andExpect(jsonPath("$.trace", empty()));
    }

    @Test
    @DisplayName("POST /api/visualize with code > 10,000 characters returns HTTP 400 Bad Request")
    void testVisualizeCodeLengthExceeded() throws Exception {
        String longCode = "a".repeat(10001);
        VisualizeRequest request = new VisualizeRequest("java", longCode, "Main");

        mockMvc.perform(post("/api/visualize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", not(nullValue())));
    }
}
