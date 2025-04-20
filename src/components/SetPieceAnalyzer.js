import React, { useState } from 'react';
import TeamSelector from './TeamSelector';
import PitchVisualization from './PitchVisualization';
import RecommendationPanel from './RecommendationPanel';
import PlayerStats from './PlayerStats';
import { generateRecommendation } from '../services/recommendationEngine';

const SetPieceAnalyzer = () => {
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const handleTeamSelect = (teamId) => {
        setSelectedTeam(teamId);
        setRecommendation(null); // Clear previous recommendations when team changes
    };
    
    const handleLocationSelect = async (coordinates) => {
        if (!selectedTeam) {
            setError("Please select a team first");
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const recommendation = await generateRecommendation(selectedTeam, coordinates);
            setRecommendation(recommendation);
            setLoading(false);
        } catch (error) {
            console.error("Error generating recommendation:", error);
            setError("Failed to generate recommendation. Please try a different location.");
            setLoading(false);
        }
    };
    
    return (
        <div className="container">
            <header className="app-header">
                <div className="app-title">
                    <img src="/favicon.svg" alt="Tacti-Kick Logo" className="logo" />
                    <h1>Tacti-Kick</h1>
                </div>
            </header>
            
            <main className="app-content">
                {/* Left sidebar with team selection and player stats */}
                <div className="sidebar">
                    <TeamSelector onTeamSelect={handleTeamSelect} />
                    
                    <PlayerStats teamId={selectedTeam} />
                </div>
                
                {/* Main content area with visualization and recommendations */}
                <div className="main-panel">
                    {error && (
                        <div className="alert alert-error mb-4">
                            {error}
                        </div>
                    )}
                    
                    {loading ? (
                        <div className="loading-overlay">
                            <div className="spinner"></div>
                            <p>Analyzing set piece options...</p>
                        </div>
                    ) : (
                        <>
                            <PitchVisualization 
                                onLocationSelect={handleLocationSelect}
                                recommendation={recommendation}
                            />
                            
                            <RecommendationPanel recommendation={recommendation} />
                        </>
                    )}
                </div>
            </main>
            
            <footer className="app-footer mt-4">
                <p className="text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Tacti-Kick | Advanced Set Piece Analysis
                </p>
            </footer>
        </div>
    );
};

export default SetPieceAnalyzer;