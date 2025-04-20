import React, { useState, useEffect } from 'react';
import { getTeams } from '../services/dataFetcher';

const TeamSelector = ({ onTeamSelect }) => {
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeams = async () => {
            setLoading(true);
            try {
                const teamsData = await getTeams();
                setTeams(teamsData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching teams:', error);
                setError('Failed to load teams data');
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    const handleTeamChange = (e) => {
        const teamId = parseInt(e.target.value);
        const selected = teams.find(team => team.id === teamId);
        setSelectedTeam(selected);
        onTeamSelect(teamId);
    };

    if (loading) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <i className="fas fa-shield-alt"></i> Team Selection
                    </h3>
                </div>
                <div className="p-4 flex items-center justify-center">
                    <div className="loader">Loading...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <i className="fas fa-shield-alt"></i> Team Selection
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

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <i className="fas fa-shield-alt"></i> Team Selection
                </h3>
            </div>
            <div className="p-4">
                <div className="form-group">
                    <label htmlFor="team-select" className="block mb-2 font-medium text-gray-700">
                        Select a team to analyze:
                    </label>
                    <select
                        id="team-select"
                        className="team-select"
                        onChange={handleTeamChange}
                        value={selectedTeam?.id || ''}
                    >
                        <option value="">-- Select Team --</option>
                        {teams.map(team => (
                            <option key={team.id} value={team.id}>
                                {team.name} ({team.league})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedTeam && (
                    <div className="team-info mt-4">
                        <div className="flex items-center gap-4 mb-4">
                            <div 
                                className="team-color-badge" 
                                style={{
                                    background: selectedTeam.colors.primary,
                                    border: `1px solid ${selectedTeam.colors.secondary}`
                                }}
                            ></div>
                            <h4>{selectedTeam.name}</h4>
                        </div>
                        
                        <div className="stat-container">
                            <div className="stat-group">
                                <h5>Corner Stats</h5>
                                <div className="stat-item">
                                    <span>Total Corners:</span>
                                    <span>{selectedTeam.setPieceStats.corners.total}</span>
                                </div>
                                <div className="stat-item">
                                    <span>Success Rate:</span>
                                    <span>{selectedTeam.setPieceStats.corners.successRate}%</span>
                                </div>
                                <div className="stat-item">
                                    <span>Goals:</span>
                                    <span>{selectedTeam.setPieceStats.corners.goalsScored}</span>
                                </div>
                            </div>
                            
                            <div className="stat-group">
                                <h5>Free Kick Stats</h5>
                                <div className="stat-item">
                                    <span>Total Free Kicks:</span>
                                    <span>{selectedTeam.setPieceStats.freeKicks.total}</span>
                                </div>
                                <div className="stat-item">
                                    <span>Success Rate:</span>
                                    <span>{selectedTeam.setPieceStats.freeKicks.successRate}%</span>
                                </div>
                                <div className="stat-item">
                                    <span>Goals:</span>
                                    <span>{selectedTeam.setPieceStats.freeKicks.goalsScored}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamSelector;