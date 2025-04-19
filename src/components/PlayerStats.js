import React, { useState, useEffect } from 'react';
import { getPlayersByTeamId } from '../services/dataFetcher';

const PlayerStats = ({ teamId }) => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Reset state when teamId changes
        setPlayers([]);
        setError(null);
        
        if (teamId) {
            setLoading(true);
            console.log(`Fetching players for team ID: ${teamId}`);
            
            getPlayersByTeamId(teamId)
                .then(playersData => {
                    console.log('Player data received:', playersData);
                    // Ensure we always set an array, even if API returns something else
                    if (Array.isArray(playersData)) {
                        setPlayers(playersData);
                    } else {
                        console.error('Expected array of players but got:', typeof playersData, playersData);
                        setPlayers([]);
                        setError('Invalid player data format received');
                    }
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching players:', error);
                    setPlayers([]);
                    setError(`Failed to load player data: ${error.message}`);
                    setLoading(false);
                });
        }
    }, [teamId]);
    
    if (!teamId) {
        return (
            <div className="player-stats-panel empty-panel">
                <p>Please select a team to see player stats</p>
            </div>
        );
    }
    
    if (loading) {
        return (
            <div className="player-stats-panel loading-panel">
                <p>Loading player data...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="player-stats-panel error-panel">
                <p>Error: {error}</p>
                <p>Please try selecting a different team</p>
            </div>
        );
    }
    
    return (
        <div className="player-stats-panel">
            <h3>Player Statistics</h3>
            
            <div className="stats-categories">
                <div className="category-tabs">
                    <div className="tab active">Set Piece Specialists</div>
                </div>
            </div>
            
            <div className="players-list">
                {players && players.length > 0 ? (
                    players.map(player => (
                        <PlayerCard key={player.id} player={player} />
                    ))
                ) : (
                    <p>No player data available</p>
                )}
            </div>
        </div>
    );
};

// PlayerCard component stays the same
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