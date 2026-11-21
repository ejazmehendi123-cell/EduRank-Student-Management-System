package com.studentmanagement.repository;

import com.studentmanagement.dto.response.LeaderboardProjection;
import com.studentmanagement.entity.StudentProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByUserId(Long userId);

    @Query("SELECT sp FROM StudentProfile sp JOIN FETCH sp.user WHERE sp.user.id = :userId")
    Optional<StudentProfile> findByUserIdWithUser(@Param("userId") Long userId);

    @Query("SELECT sp FROM StudentProfile sp JOIN FETCH sp.user WHERE sp.id = :id")
    Optional<StudentProfile> findByIdWithUser(@Param("id") Long id);

    Optional<StudentProfile> findByRollNumber(String rollNumber);

    boolean existsByRollNumber(String rollNumber);

    @Query(value = "SELECT sp.id AS studentId, u.id AS userId, u.name AS name, sp.roll_number AS rollNumber, " +
                   "sp.department AS department, sp.semester AS semester, sp.total_points AS totalPoints, " +
                   "RANK() OVER (ORDER BY sp.total_points DESC) AS rank " +
                   "FROM student_profiles sp " +
                   "JOIN users u ON sp.user_id = u.id " +
                   "ORDER BY sp.total_points DESC, sp.id ASC",
           countQuery = "SELECT count(*) FROM student_profiles",
           nativeQuery = true)
    Page<LeaderboardProjection> findLeaderboardPaged(Pageable pageable);

    @Query(value = "SELECT rank FROM (" +
                   "  SELECT sp.id, RANK() OVER (ORDER BY sp.total_points DESC) AS rank " +
                   "  FROM student_profiles sp " +
                   ") ranked WHERE ranked.id = :studentId",
           nativeQuery = true)
    Optional<Long> findRankByStudentId(@Param("studentId") Long studentId);

    @Query(value = "SELECT sp.id AS studentId, u.id AS userId, u.name AS name, sp.roll_number AS rollNumber, " +
                   "sp.department AS department, sp.semester AS semester, sp.total_points AS totalPoints, " +
                   "RANK() OVER (ORDER BY sp.total_points DESC) AS rank " +
                   "FROM student_profiles sp " +
                   "JOIN users u ON sp.user_id = u.id " +
                   "ORDER BY sp.total_points DESC, sp.id ASC LIMIT 5",
           nativeQuery = true)
    List<LeaderboardProjection> findTop5Performers();

    @Query("SELECT SUM(sp.totalPoints) FROM StudentProfile sp")
    Long sumTotalPoints();
}

