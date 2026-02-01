package com.inves_micro.Investment.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.inves_micro.Investment.Model.Investment;

import jakarta.transaction.Transactional;

@Repository
@Transactional
public interface InvestmentRepository extends JpaRepository<Investment, Long> {

    List<Investment> findByUserId(Long userId);

    List<Investment> findByStartDateAndUserId(LocalDate startDate, Long userId);

    @Query("SELECT i FROM Investment i " +
           "WHERE MONTH(i.startDate) = :month " +
           "AND YEAR(i.startDate) = :year " +
           "AND i.userId = :userId")
    List<Investment> findByMonthAndUserId(@Param("month") int month,
                                          @Param("year") int year,
                                          @Param("userId") Long userId);

    @Query("SELECT i FROM Investment i " +
           "WHERE YEAR(i.startDate) = :year " +
           "AND i.userId = :userId")
    List<Investment> findByYearAndUserId(@Param("year") int year,
                                         @Param("userId") Long userId);

    List<Investment> findByEndDateAndUserId(LocalDate endDate, Long userId);

    @Query("SELECT i FROM Investment i " +
           "WHERE MONTH(i.endDate) = :month " +
           "AND YEAR(i.endDate) = :year " +
           "AND i.userId = :userId")
    List<Investment> findByEndMonthAndUserId(@Param("month") int month,
                                             @Param("year") int year,
                                             @Param("userId") Long userId);

    @Query("SELECT i FROM Investment i " +
           "WHERE YEAR(i.endDate) = :year " +
           "AND i.userId = :userId")
    List<Investment> findByEndYearAndUserId(@Param("year") int year,
                                            @Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Investment s SET s.status = 'Completed' WHERE s.id = :id")
    void markasCompleted(@Param("id") Long id);
}
