package com.studentmanagement.dto.response;

import java.util.List;

public class LeaderboardPageResponse {
    private List<LeaderboardEntryResponse> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;
    private Long currentStudentRank;

    public LeaderboardPageResponse() {}

    public LeaderboardPageResponse(List<LeaderboardEntryResponse> content, int page, int size,
                                   long totalElements, int totalPages, boolean last, Long currentStudentRank) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.last = last;
        this.currentStudentRank = currentStudentRank;
    }

    public List<LeaderboardEntryResponse> getContent() { return content; }
    public void setContent(List<LeaderboardEntryResponse> content) { this.content = content; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }

    public long getTotalElements() { return totalElements; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

    public boolean isLast() { return last; }
    public void setLast(boolean last) { this.last = last; }

    public Long getCurrentStudentRank() { return currentStudentRank; }
    public void setCurrentStudentRank(Long currentStudentRank) { this.currentStudentRank = currentStudentRank; }
}

