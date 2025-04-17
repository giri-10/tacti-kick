import React from 'react';
import { getTeams } from '../services/dataFetcher';

const TeamSelector = ({ onTeamSelect, selectedTeamId }) => {
    const teams = getTeams();
    
    const handleTeamChange = (e) => {
        const teamId = parseInt(e.target.value, 10);
        if (onTeamSelect) {
            onTeamSelect(teamId);
        }
    };
    
    return (
        <div className="team-selector">
            <h3>Select Team</h3>
            <select 
                value={selectedTeamId || ''} 
                onChange={handleTeamChange}
                className="team-select"
            >
                <option value="" disabled>Select a team</option>
                {teams.map(team => (
                    <option key={team.id} value={team.id}>
                        {team.name} ({team.league})
                    </option>
                ))}
            </select>
            
            {selectedTeamId && (
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
    if (!team) return null;
    
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