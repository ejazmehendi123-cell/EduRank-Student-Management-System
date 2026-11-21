package com.studentmanagement.dto.response;

import com.studentmanagement.entity.PointTransaction;
import com.studentmanagement.enums.TransactionType;
import java.time.Instant;

public class PointTransactionResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentRollNumber;
    private Long teacherId;
    private String teacherName;
    private Integer points;
    private TransactionType transactionType;
    private String reason;
    private Instant createdAt;

    public PointTransactionResponse() {}

    public PointTransactionResponse(Long id, Long studentId, String studentName, String studentRollNumber,
                                    Long teacherId, String teacherName, Integer points,
                                    TransactionType transactionType, String reason, Instant createdAt) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentRollNumber = studentRollNumber;
        this.teacherId = teacherId;
        this.teacherName = teacherName;
        this.points = points;
        this.transactionType = transactionType;
        this.reason = reason;
        this.createdAt = createdAt;
    }

    public static PointTransactionResponse fromEntity(PointTransaction pt) {
        return new PointTransactionResponse(
            pt.getId(),
            pt.getStudent().getId(),
            pt.getStudent().getUser().getName(),
            pt.getStudent().getRollNumber(),
            pt.getTeacher().getId(),
            pt.getTeacher().getName(),
            pt.getPoints(),
            pt.getTransactionType(),
            pt.getReason(),
            pt.getCreatedAt()
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentRollNumber() { return studentRollNumber; }
    public void setStudentRollNumber(String studentRollNumber) { this.studentRollNumber = studentRollNumber; }

    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public TransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(TransactionType transactionType) { this.transactionType = transactionType; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

