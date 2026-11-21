package com.studentmanagement.repository;

import com.studentmanagement.entity.PointTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {

    @Query("SELECT pt FROM PointTransaction pt JOIN FETCH pt.student sp JOIN FETCH sp.user JOIN FETCH pt.teacher " +
           "WHERE pt.student.id = :studentId ORDER BY pt.createdAt DESC")
    List<PointTransaction> findByStudentIdOrderByCreatedAtDesc(@Param("studentId") Long studentId);

    @Query("SELECT pt FROM PointTransaction pt JOIN FETCH pt.student sp JOIN FETCH sp.user JOIN FETCH pt.teacher " +
           "WHERE pt.student.id = :studentId")
    Page<PointTransaction> findByStudentIdPaged(@Param("studentId") Long studentId, Pageable pageable);

    @Query("SELECT pt FROM PointTransaction pt JOIN FETCH pt.student sp JOIN FETCH sp.user JOIN FETCH pt.teacher " +
           "ORDER BY pt.createdAt DESC")
    List<PointTransaction> findTop10RecentTransactions(Pageable pageable);

    Optional<PointTransaction> findByIdempotencyKey(String idempotencyKey);
}

