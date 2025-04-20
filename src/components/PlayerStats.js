import React, { useState, useEffect } from 'react';
import { getPlayersByTeamId } from '../services/dataFetcher';

const PlayerStats = ({ teamId }) => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('specialists');

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
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <i className="fas fa-user"></i> Player Analysis
                    </h3>
                </div>
                <div className="empty-panel p-4">
                    <p>Please select a team to see player stats</p>
                </div>
            </div>
        );
    }
    
    if (loading) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <i className="fas fa-user"></i> Player Analysis
                    </h3>
                </div>
                <div className="p-4 flex items-center justify-center">
                    <div className="loader">Loading player data...</div>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <i className="fas fa-user"></i> Player Analysis
                    </h3>
                </div>
                <div className="p-4">
                    <div className="error-message">{error}</div>
                    <button 
                        className="btn btn-primary mt-4"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Sort players by set piece effectiveness
    const sortedPlayers = [...players].sort((a, b) => {
        const aScore = a.setPieceSuccessRate.corners + a.setPieceSuccessRate.freeKicks;
        const bScore = b.setPieceSuccessRate.corners + b.setPieceSuccessRate.freeKicks;
        return bScore - aScore;
    });
    
    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <i className="fas fa-user"></i> Player Analysis
                </h3>
            </div>
            
            <div className="p-4">
                <div className="stats-categories mb-4">
                    <div className="category-tabs">
                        <div 
                            className={`tab ${activeTab === 'specialists' ? 'active' : ''}`}
                            onClick={() => setActiveTab('specialists')}
                        >
                            Set Piece Specialists
                        </div>
                        <div 
                            className={`tab ${activeTab === 'targets' ? 'active' : ''}`}
                            onClick={() => setActiveTab('targets')}
                        >
                            Aerial Threats
                        </div>
                    </div>
                </div>
                
                <div className="players-list">
                    {players && players.length > 0 ? (
                        activeTab === 'specialists' ? (
                            sortedPlayers.slice(0, 5).map(player => (
                                <PlayerCard key={player.id} player={player} />
                            ))
                        ) : (
                            [...players]
                                .sort((a, b) => {
                                    // Sort by height and goals from set pieces for aerial threats
                                    if (a.height !== b.height) {
                                        return b.height - a.height;
                                    }
                                    return b.goalsFromSetPieces - a.goalsFromSetPieces;
                                })
                                .slice(0, 5)
                                .map(player => (
                                    <PlayerCard key={player.id} player={player} />
                                ))
                        )
                    ) : (
                        <p className="empty-message">No player data available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// PlayerCard component with improved design
const PlayerCard = ({ player }) => {
    const {
        name,
        position,
        height,
        foot,
        crossingAbility,
        setPieceSuccessRate,
        goalsFromSetPieces,
        assistsFromSetPieces
    } = player;
    
    return (
        <div className="player-stat-card">
            <div className="player-header">
                <div className="player-name">{name}</div>
                <div className="player-position">{position} • {foot}-footed</div>
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