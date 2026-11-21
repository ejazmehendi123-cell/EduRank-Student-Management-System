package com.studentmanagement.dto.response;

public class LeaderboardEntryResponse {
    private Long studentId;
    private Long userId;
    private String name;
    private String rollNumber;
    private String department;
    private Integer semester;
    private Integer totalPoints;
    private Long rank;

    public LeaderboardEntryResponse() {}

    public LeaderboardEntryResponse(Long studentId, Long userId, String name, String rollNumber,
                                    String department, Integer semester, Integer totalPoints, Long rank) {
        this.studentId = studentId;
        this.userId = userId;
        this.name = name;
        this.rollNumber = rollNumber;
        this.department = department;
        this.semester = semester;
        this.totalPoints = totalPoints;
        this.rank = rank;
    }

    public static LeaderboardEntryResponse fromProjection(LeaderboardProjection p) {
        return new LeaderboardEntryResponse(
            p.getStudentId(),
            p.getUserId(),
            p.getName(),
            p.getRollNumber(),
            p.getDepartment(),
            p.getSemester(),
            p.getTotalPoints(),
            p.getRank()
        );
    }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public Integer getTotalPoints() { return totalPoints; }
    public void setTotalPoints(Integer totalPoints) { this.totalPoints = totalPoints; }

    public Long getRank() { return rank; }
    public void setRank(Long rank) { this.rank = rank; }
}

