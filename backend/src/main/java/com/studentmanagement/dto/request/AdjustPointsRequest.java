package com.studentmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AdjustPointsRequest {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Points adjustment amount is required")
    private Integer points;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String idempotencyKey;

    public AdjustPointsRequest() {}

    public AdjustPointsRequest(Long studentId, Integer points, String reason, String idempotencyKey) {
        this.studentId = studentId;
        this.points = points;
        this.reason = reason;
        this.idempotencyKey = idempotencyKey;
    }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
}

