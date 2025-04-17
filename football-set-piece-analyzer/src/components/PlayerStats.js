import React from 'react';
import { getPlayersByTeamId } from '../services/dataFetcher';

const PlayerStats = ({ teamId }) => {
    if (!teamId) {
        return (
            <div className="player-stats-panel empty-panel">
                <p>Please select a team to see player stats</p>
            </div>
        );
    }
    
    const players = getPlayersByTeamId(teamId);
    
    return (
        <div className="player-stats-panel">
            <h3>Player Statistics</h3>
            
            <div className="stats-categories">
                <div className="category-tabs">
                    <div className="tab active">Set Piece Specialists</div>
                </div>
            </div>
            
            <div className="players-list">
                {players.map(player => (
                    <PlayerCard key={player.id} player={player} />
                ))}
            </div>
        </div>
    );
};

const PlayerCard = ({ player }) => {
    const {
        name,
        position,
        height,
        crossingAbility,
        setPieceSuccessRate,
        goalsFromSetPieces,
        assistsFromSetPieces
    } = player;
    
    return (
        <div className="player-stat-card">
            <div className="player-header">
                <div className="player-name">{name}</div>
                <div className="player-position">{position}</div>
            </div>
            
            <div className="player-attributes">
                <div className="attribute">
                    <div className="attribute-label">Height</div>
                    <div className="attribute-value">{height} cm</div>
                </div>
                
                <div className="attribute">
                    <div className="attribute-label">Crossing</div>
                    <div className="attribute-value">{crossingAbility}%</div>
                </div>
                
                <div className="attribute">
                    <div className="attribute-label">Corner Success</div>
                    <div className="attribute-value">{setPieceSuccessRate.corners}%</div>
                </div>
                
                <div className="attribute">
                    <div className="attribute-label">Free Kick Success</div>
                    <div className="attribute-value">{setPieceSuccessRate.freeKicks}%</div>
                </div>
            </div>
            
            <div className="player-set-piece-stats">
                <div className="set-piece-stat">
                    <div className="stat-label">Goals from Set Pieces</div>
                    <div className="stat-value">{goalsFromSetPieces}</div>
                </div>
                
                <div className="set-piece-stat">
                    <div className="stat-label">Assists from Set Pieces</div>
                    <div className="stat-value">{assistsFromSetPieces}</div>
                </div>
            </div>
        </div>
    );
};

export default PlayerStats;