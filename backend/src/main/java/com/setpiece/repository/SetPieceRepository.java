package com.setpiece.repository;

import com.setpiece.model.SetPiece;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SetPieceRepository extends JpaRepository<SetPiece, Long> {
    List<SetPiece> findByType(String type);
    
    List<SetPiece> findByTeam(String team);
    
    List<SetPiece> findByTypeAndTeam(String type, String team);
    
    @Query("SELECT s FROM SetPiece s WHERE s.type = :type AND s.isSuccessful = true")
    List<SetPiece> findSuccessfulSetPieces(@Param("type") String type);
    
    @Query("SELECT AVG(s.xG) FROM SetPiece s WHERE s.type = :type AND s.team = :team")
    Double calculateAverageXG(@Param("type") String type, @Param("team") String team);
    
    @Query("SELECT s.taker, COUNT(s) as count FROM SetPiece s " +
           "WHERE s.type = :type AND s.team = :team " +
           "GROUP BY s.taker ORDER BY count DESC")
    List<Object[]> findTopTakers(@Param("type") String type, @Param("team") String team);
    
    @Query("SELECT s.receiver, COUNT(s) as count FROM SetPiece s " +
           "WHERE s.type = :type AND s.team = :team AND s.isSuccessful = true " +
           "GROUP BY s.receiver ORDER BY count DESC")
    List<Object[]> findTopReceivers(@Param("type") String type, @Param("team") String team);
} 