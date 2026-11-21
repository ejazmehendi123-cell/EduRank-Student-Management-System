package com.studentmanagement.dto.response;

public interface LeaderboardProjection {
    Long getStudentId();
    Long getUserId();
    String getName();
    String getRollNumber();
    String getDepartment();
    Integer getSemester();
    Integer getTotalPoints();
    Long getRank();
}

