import React, { useState, useEffect } from 'react';
import { getTeams } from '../services/dataFetcher';

const TeamSelector = ({ onTeamSelect, selectedTeamId }) => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const loadTeams = async () => {
            try {
                setLoading(true);
                const teamsData = await getTeams();
                setTeams(teamsData);
                setLoading(false);
            } catch (err) {
                console.error("Error loading teams:", err);
                setError("Failed to load teams. Please try again later.");
                setLoading(false);
            }
        };
        
        loadTeams();
    }, []);
    
    const handleTeamChange = (e) => {
        const teamId = parseInt(e.target.value, 10);
        if (onTeamSelect) {
            onTeamSelect(teamId);
        }
    };
    
    if (loading) {
        return <div className="team-selector">Loading teams...</div>;
    }
    
    if (error) {
        return <div className="team-selector error">{error}</div>;
    }
    
    return (
        <div className="team-selector">
            <h3>Select Team</h3>
            <select 
                value={selectedTeamId || ''} 
                onChange={handleTeamChange}
                className="team-select"
            >
                <option value="" disabled>Select a team</option>
                {teams && teams.length > 0 ? teams.map(team => (
                    <option key={team.id} value={team.id}>
                        {team.name} {team.league ? `(${team.league})` : ''}
                    </option>
                )) : (
                    <option value="" disabled>No teams available</option>
                )}
            </select>
            
            {selectedTeamId && teams.length > 0 && (
                <div className="team-info">
                    <h4>Set Piece Statistics</h4>
                    <div className="stat-container">
                        {renderTeamStats(teams.find(team => team.id === selectedTeamId))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function to render team stats
const renderTeamStats = (team) => {
    if (!team || !team.setPieceStats) return <div>No statistics available</div>;
    
    const { setPieceStats } = team;
    
    return (
        <>
            <div className="stat-group">
                <h5>Corners</h5>
                <div className="stat-item">
                    <span>Total:</span> 
                    <span>{setPieceStats.corners.total}</span>
                </div>
                <div className="stat-item">
                    <span>Success Rate:</span> 
                    <span>{setPieceStats.corners.successRate.toFixed(1)}%</span>
                </div>
                <div className="stat-item">
                    <span>Goals:</span> 
                    <span>{setPieceStats.corners.goalsScored}</span>
                </div>
            </div>
            
            <div className="stat-group">
                <h5>Free Kicks</h5>
                <div className="stat-item">
                    <span>Total:</span> 
                    <span>{setPieceStats.freeKicks.total}</span>
                </div>
                <div className="stat-item">
                    <span>Success Rate:</span> 
                    <span>{setPieceStats.freeKicks.successRate.toFixed(1)}%</span>
                </div>
                <div className="stat-item">
                    <span>Goals:</span> 
                    <span>{setPieceStats.freeKicks.goalsScored}</span>
                </div>
            </div>
        </>
    );
};

export default TeamSelector;