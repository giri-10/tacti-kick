import React, { useState } from 'react';
import PitchVisualization from './PitchVisualization';
import TeamSelector from './TeamSelector';
import RecommendationPanel from './RecommendationPanel';
import PlayerStats from './PlayerStats';
import { generateRecommendation } from '../services/recommendationEngine';

const SetPieceAnalyzer = () => {
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [clickPosition, setClickPosition] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Handle team selection
    const handleTeamSelect = (teamId) => {
        setSelectedTeamId(teamId);
        // Reset recommendation when team changes
        setRecommendation(null);
        setClickPosition(null);
        setError(null);
    };
    
    // Handle pitch click
    const handleSetPieceSelect = async (position) => {
        console.log('Pitch clicked at:', position);
        setClickPosition(position);
        
        if (selectedTeamId) {
            setLoading(true);
            setError(null);
            
            try {
                // Generate recommendation based on team and position
                // Properly await the async result
                const newRecommendation = await generateRecommendation(selectedTeamId, position);
                console.log('Recommendation generated:', newRecommendation);
                setRecommendation(newRecommendation);
            } catch (err) {
                console.error('Error generating recommendation:', err);
                setError('Failed to generate recommendation. Please try again.');
            } finally {
                setLoading(false);
            }
        } else {
            setError('Please select a team first');
        }
    };
    
    return (
        <div className="set-piece-analyzer">
            <div className="analyzer-header">
                <h2>Football Set Piece Analyzer</h2>
                <p>Select a team and click on the pitch to analyze set piece options</p>
                {error && <p className="error-message">{error}</p>}
            </div>
            
            <div className="analyzer-content">
                <div className="sidebar-left">
                    <TeamSelector 
                        onTeamSelect={handleTeamSelect}
                        selectedTeamId={selectedTeamId}
                    />
                    <PlayerStats teamId={selectedTeamId} />
                </div>
                
                <div className="main-content">
                    <PitchVisualization 
                        onSetPieceSelect={handleSetPieceSelect}
                        recommendation={recommendation}
                    />
                    {loading && <div className="loading-indicator">Generating recommendations...</div>}
                </div>
                
                <div className="sidebar-right">
                    <RecommendationPanel recommendation={recommendation} />
                </div>
            </div>
        </div>
    );
};

export default SetPieceAnalyzer;