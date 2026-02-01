package com.dhan.Stonks.Repository;

import com.dhan.Stonks.Entity.GoldTrade;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GoldTradeRepository extends JpaRepository<GoldTrade, Long> {
    List<GoldTrade> findByUserId(Long userId);
}