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
    
    // Handle team selection
    const handleTeamSelect = (teamId) => {
        setSelectedTeamId(teamId);
        // Reset recommendation when team changes
        setRecommendation(null);
        setClickPosition(null);
    };
    
    // Handle pitch click
    const handleSetPieceSelect = (position) => {
        setClickPosition(position);
        
        if (selectedTeamId) {
            // Generate recommendation based on team and position
            const newRecommendation = generateRecommendation(selectedTeamId, position);
            setRecommendation(newRecommendation);
        }
    };
    
    return (
        <div className="set-piece-analyzer">
            <div className="analyzer-header">
                <h2>Football Set Piece Analyzer</h2>
                <p>Select a team and click on the pitch to analyze set piece options</p>
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
                </div>
                
                <div className="sidebar-right">
                    <RecommendationPanel recommendation={recommendation} />
                </div>
            </div>
        </div>
    );
};

export default SetPieceAnalyzer;