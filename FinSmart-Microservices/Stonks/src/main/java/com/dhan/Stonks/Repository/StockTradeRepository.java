package com.dhan.Stonks.Repository;

import com.dhan.Stonks.Entity.StockTrade;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockTradeRepository extends JpaRepository<StockTrade, Long> {
    List<StockTrade> findByUserId(Long userId);
}