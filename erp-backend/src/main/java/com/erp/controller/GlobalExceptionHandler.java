package com.erp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * ✅ GLOBAL EXCEPTION HANDLER
 *
 * Catches ALL unhandled exceptions across ALL controllers and returns
 * a clean JSON error response instead of a raw Spring HTML error page.
 *
 * Frontend mein: error.response.data.error se message milega.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    // ─── Generic fallback handler (catches everything) ───────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAllExceptions(Exception ex) {
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("status", "error");
        error.put("message", "An unexpected error occurred. Please try again.");
        // Only expose the raw message in dev — in prod this prevents leaking internals
        error.put("detail", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // ─── NoSuchElement (findById().orElseThrow() etc.) ───────────────────────
    @ExceptionHandler(java.util.NoSuchElementException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(java.util.NoSuchElementException ex) {
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("status", "error");
        error.put("message", "Record not found. It may have been deleted.");
        error.put("detail", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    // ─── IllegalArgument (e.g. bad input values) ─────────────────────────────
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("status", "error");
        error.put("message", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // ─── Wrong URL parameter type (e.g. /products/abc instead of /products/1) ─
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("status", "error");
        error.put("message", "Invalid parameter '" + ex.getName() + "'. Expected a valid number.");
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // ─── NumberFormat (e.g. parsing a non-numeric string) ────────────────────
    @ExceptionHandler(NumberFormatException.class)
    public ResponseEntity<Map<String, Object>> handleNumberFormat(NumberFormatException ex) {
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("status", "error");
        error.put("message", "Invalid number format. Please check the values you entered.");
        error.put("detail", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}
