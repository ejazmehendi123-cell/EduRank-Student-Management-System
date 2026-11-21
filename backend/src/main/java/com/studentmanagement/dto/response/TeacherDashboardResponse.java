package com.studentmanagement.dto.response;

import java.util.List;

public class TeacherDashboardResponse {
    private long totalStudents;
    private long totalPointsAwarded;
    private List<LeaderboardEntryResponse> topPerformers;
    private List<PointTransactionResponse> recentTransactions;

    public TeacherDashboardResponse() {}

    public TeacherDashboardResponse(long totalStudents, long totalPointsAwarded,
                                    List<LeaderboardEntryResponse> topPerformers,
                                    List<PointTransactionResponse> recentTransactions) {
        this.totalStudents = totalStudents;
        this.totalPointsAwarded = totalPointsAwarded;
        this.topPerformers = topPerformers;
        this.recentTransactions = recentTransactions;
    }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalPointsAwarded() { return totalPointsAwarded; }
    public void setTotalPointsAwarded(long totalPointsAwarded) { this.totalPointsAwarded = totalPointsAwarded; }

    public List<LeaderboardEntryResponse> getTopPerformers() { return topPerformers; }
    public void setTopPerformers(List<LeaderboardEntryResponse> topPerformers) { this.topPerformers = topPerformers; }

    public List<PointTransactionResponse> getRecentTransactions() { return recentTransactions; }
    public void setRecentTransactions(List<PointTransactionResponse> recentTransactions) { this.recentTransactions = recentTransactions; }
}

