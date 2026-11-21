package com.studentmanagement.service;

import com.studentmanagement.dto.response.LeaderboardEntryResponse;
import com.studentmanagement.dto.response.PointTransactionResponse;
import com.studentmanagement.dto.response.TeacherDashboardResponse;
import com.studentmanagement.repository.PointTransactionRepository;
import com.studentmanagement.repository.StudentProfileRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeacherService {

    private final StudentProfileRepository studentProfileRepository;
    private final PointTransactionRepository pointTransactionRepository;

    public TeacherService(StudentProfileRepository studentProfileRepository,
                          PointTransactionRepository pointTransactionRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.pointTransactionRepository = pointTransactionRepository;
    }

    @Transactional(readOnly = true)
    public TeacherDashboardResponse getTeacherDashboard() {
        long totalStudents = studentProfileRepository.count();
        Long sumPoints = studentProfileRepository.sumTotalPoints();
        long totalPointsAwarded = sumPoints != null ? sumPoints : 0L;

        List<LeaderboardEntryResponse> topPerformers = studentProfileRepository.findTop5Performers().stream()
                .map(LeaderboardEntryResponse::fromProjection)
                .collect(Collectors.toList());

        List<PointTransactionResponse> recentTransactions = pointTransactionRepository
                .findTop10RecentTransactions(PageRequest.of(0, 10))
                .stream()
                .map(PointTransactionResponse::fromEntity)
                .collect(Collectors.toList());

        return new TeacherDashboardResponse(totalStudents, totalPointsAwarded, topPerformers, recentTransactions);
    }
}

