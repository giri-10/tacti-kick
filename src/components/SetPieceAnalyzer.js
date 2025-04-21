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
    const [lastClickedPosition, setLastClickedPosition] = useState(null);
    
    const handleTeamSelect = (teamId) => {
        console.log("Team selected:", teamId);
        setSelectedTeam(teamId);
        setRecommendation(null); // Clear previous recommendations when team changes
    };
    
    const handleLocationSelect = async (coordinates) => {
        console.log("Location selected in SetPieceAnalyzer:", coordinates);
        // Store position for later use
        setLastClickedPosition(coordinates);
        
        if (!selectedTeam) {
            setError("Please select a team first");
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            console.log("Generating recommendation for team:", selectedTeam, "at position:", coordinates);
            const recommendationData = await generateRecommendation(selectedTeam, coordinates);
            
            // Ensure position is attached to the recommendation object
            const enhancedRecommendation = {
                ...recommendationData,
                position: coordinates // Explicitly attach the position here
            };
            
            console.log("Recommendation received with position:", enhancedRecommendation);
            setRecommendation(enhancedRecommendation);
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
                                initialPosition={lastClickedPosition}
                            />
                            
                            <RecommendationPanel recommendation={recommendation} />
                        </>
                    )}
                </div>
            </main>
            
            <footer className="app-footer mt-4">
                <p className="text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Tacti-Kick | Football Set Piece Analysis
                </p>
            </footer>
        </div>
    );
};

export default SetPieceAnalyzer;