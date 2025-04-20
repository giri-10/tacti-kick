import React, { useRef, useEffect, useState } from 'react';
import { drawPitch, drawSetPieceLocation, drawTrajectory, drawPlayer } from '../utils/visualization';

const PitchVisualization = ({ onLocationSelect, recommendation, initialPosition }) => {
    const canvasRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [pointerPosition, setPointerPosition] = useState({ x: -1, y: -1 });
    const [clickedPosition, setClickedPosition] = useState(initialPosition);
    
    // Update clickedPosition when initialPosition changes from parent
    useEffect(() => {
        if (initialPosition) {
            setClickedPosition(initialPosition);
            console.log("Updated clicked position from initialPosition:", initialPosition);
        }
    }, [initialPosition]);
    
    useEffect(() => {
        const handleResize = () => {
            const container = document.querySelector('.pitch-container');
            if (container) {
                setCanvasSize({
                    width: container.offsetWidth,
                    height: container.offsetHeight
                });
            }
        };
        
        window.addEventListener('resize', handleResize);
        handleResize();
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        if (canvasSize.width > 0 && canvasSize.height > 0) {
            canvas.width = canvasSize.width;
            canvas.height = canvasSize.height;
            
            // Draw the pitch with enhanced modern styling
            drawPitch(canvas, {
                pitchColor: '#3e8e41',  // Rich green color
                lineColor: 'rgba(255, 255, 255, 0.9)',
                goalColor: 'rgba(255, 255, 255, 0.9)',
                showPenaltyBoxes: true,
                showCenterCircle: true,
                showCornerArcs: true,
                showPatternLines: true,
                modernStyle: true,
                glossEffect: true
            });
            
            // Draw temporary position indicator if mouse is over the canvas
            if (pointerPosition.x >= 0 && pointerPosition.y >= 0) {
                drawSetPieceLocation(canvas, pointerPosition, { 
                    color: 'rgba(255, 152, 0, 0.6)',
                    radius: 6,
                    glow: true
                });
            }
            
            // Draw the clicked position marker if it exists
            if (clickedPosition) {
                drawSetPieceLocation(canvas, clickedPosition, { 
                    color: 'rgba(244, 67, 54, 0.8)',  // red
                    radius: 8,
                    glow: true
                });
            }
            
            // If we have a recommendation, visualize it
            if (recommendation) {
                console.log("Attempting to visualize recommendation:", recommendation);
                
                try {
                    // Determine which position to use for visualization
                    const positionToUse = recommendation.position || clickedPosition;
                    
                    if (positionToUse) {
                        console.log("Using position for visualization:", positionToUse);
                        
                        // Make a copy of the recommendation with guaranteed position
                        const enhancedRecommendation = {
                            ...recommendation,
                            position: positionToUse
                        };
                        
                        // Visualize with enhanced graphics
                        visualizeRecommendation(canvas, enhancedRecommendation);
                    } else {
                        console.warn("No valid position available for visualization");
                    }
                } catch (error) {
                    console.error("Error visualizing recommendation:", error);
                }
            }
        }
    }, [canvasSize, pointerPosition, recommendation, clickedPosition]);
    
    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        
        // Calculate position as percentage of canvas size (0-100 scale)
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        
        // Create position object with numerical coordinates
        const position = { 
            x: parseFloat(x.toFixed(2)), 
            y: parseFloat(y.toFixed(2))
        };
        
        console.log("Canvas clicked at position:", position);
        
        // Store the clicked position for visualization and backup
        setClickedPosition(position);
        
        // Pass the coordinates to the parent component
        if (typeof onLocationSelect === 'function') {
            onLocationSelect(position);
        } else {
            console.error("onLocationSelect is not a function");
        }
    };
    
    const handleCanvasMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        
        // Calculate position as percentage of canvas size (0-100 scale)
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        
        setPointerPosition({ x, y });
    };
    
    const handleCanvasMouseLeave = () => {
        setPointerPosition({ x: -1, y: -1 });
    };
    
    // Function to visualize the set piece recommendation
    const visualizeRecommendation = (canvas, recommendation) => {
        // Safety check - ensure all needed properties exist
        if (!recommendation || !recommendation.type) {
            console.warn("Missing recommendation or type");
            return;
        }
        
        const { type, position, taker, targetPlayers = [], targetZone, deliveryType } = recommendation;
        
        // Check if position is defined before using it
        if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
            console.warn('Recommendation is missing valid position coordinates:', position);
            return;
        }
        
        console.log("Visualizing recommendation with position:", position);
        
        // Draw the set piece location with glow effect
        drawSetPieceLocation(canvas, position, { 
            color: '#f44336', // Red color for the set piece location
            radius: 7,
            glow: true
        });
        
        // Check if taker is defined before using it
        if (!taker) {
            console.warn('Recommendation is missing taker information');
            return;
        }
        
        if (type === 'corner') {
            // For corners, visualize the taker and trajectory to target zone
            drawPlayer(canvas, position, taker, { 
                color: '#2196F3',
                showName: true,
                playerStyle: 'modern'
            });
            
            // Ensure targetZone exists
            if (!targetZone || !targetZone.id) {
                console.warn('Corner recommendation is missing target zone');
                return;
            }
            
            // Determine target position based on zone
            let targetPosition;
            switch(targetZone.id) {
                case 'nearPost':
                    targetPosition = { x: 45, y: 10 };
                    break;
                case 'farPost':
                    targetPosition = { x: 55, y: 10 };
                    break;
                case 'centerGoal':
                    targetPosition = { x: 50, y: 10 };
                    break;
                case 'penalty':
                    targetPosition = { x: 50, y: 18 };
                    break;
                case 'edge':
                    targetPosition = { x: 50, y: 25 };
                    break;
                default:
                    targetPosition = { x: 50, y: 15 };
            }
            
            // Ensure deliveryType exists
            if (deliveryType && deliveryType.id) {
                // Draw enhanced trajectory with proper curve based on kick type
                const trajectoryType = deliveryType.id.toLowerCase();
                drawTrajectory(canvas, position, targetPosition, trajectoryType, { 
                    color: '#FF9800',
                    width: 2.5,
                    gradient: true,
                    shadow: true,
                    arrow: true,
                    flightPath: true
                });
            } else {
                // Fallback to a default trajectory
                drawTrajectory(canvas, position, targetPosition, 'inswinger', { 
                    color: '#FF9800',
                    width: 2.5,
                    gradient: true,
                    shadow: true,
                    arrow: true
                });
            }
            
            // Draw target players if they exist
            if (Array.isArray(targetPlayers) && targetPlayers.length > 0) {
                targetPlayers.forEach((player, index) => {
                    if (!player) return; // Skip if player is undefined
                    
                    // Spread target players around the target position
                    const offset = index - (targetPlayers.length - 1) / 2;
                    const playerPos = {
                        x: targetPosition.x + offset * 5,
                        y: targetPosition.y + offset * 3
                    };
                    
                    drawPlayer(canvas, playerPos, player, { 
                        color: '#4CAF50',
                        showName: true,
                        playerStyle: 'modern'
                    });
                });
            }
        } else if (type === 'freeKick') {
            // For free kicks, visualize the taker and trajectory
            const { zone, isDirect, ballTrajectory } = recommendation;
            
            // Draw the taker with modern styling
            drawPlayer(canvas, position, taker, { 
                color: '#2196F3',
                showName: true,
                playerStyle: 'modern'
            });
            
            if (isDirect) {
                // Direct free kick - draw trajectory to goal with curved path
                drawTrajectory(canvas, position, { x: 50, y: 5 }, 'curved', { 
                    color: '#FF9800',
                    width: 2.5,
                    gradient: true,
                    shadow: true,
                    arrow: true,
                    flightPath: true
                });
            } else {
                // Crossed free kick - draw trajectory to target area
                // Determine target position based on free kick position
                const isLeftSide = position.x < 50;
                const targetPosition = isLeftSide
                    ? { x: 60, y: 15 }
                    : { x: 40, y: 15 };
                
                // Determine trajectory type based on delivery type or ball trajectory
                let trajectoryType = 'outswinger';
                
                if (deliveryType && deliveryType.id) {
                    trajectoryType = deliveryType.id.toLowerCase().includes('in') 
                        ? 'inswinger' 
                        : 'outswinger';
                } else if (ballTrajectory && ballTrajectory.type) {
                    trajectoryType = ballTrajectory.type.toLowerCase();
                }
                
                // Draw enhanced trajectory with proper curve based on side of pitch
                drawTrajectory(canvas, position, targetPosition, trajectoryType, { 
                    color: '#FF9800',
                    width: 2.5,
                    gradient: true,
                    shadow: true,
                    arrow: true,
                    flightPath: true
                });
                
                // Draw target players if they exist
                if (Array.isArray(targetPlayers) && targetPlayers.length > 0) {
                    targetPlayers.forEach((player, index) => {
                        if (!player) return; // Skip if player is undefined
                        
                        // Spread target players around the target position
                        const offset = index - (targetPlayers.length - 1) / 2;
                        const playerPos = {
                            x: targetPosition.x + offset * 5,
                            y: targetPosition.y + offset * 3
                        };
                        
                        drawPlayer(canvas, playerPos, player, { 
                            color: '#4CAF50',
                            showName: true,
                            playerStyle: 'modern'
                        });
                    });
                }
            }
        } else if (type === 'penalty') {
            // Draw the taker with enhanced styling
            drawPlayer(canvas, { x: position.x, y: position.y + 5 }, taker, { 
                color: '#2196F3',
                showName: true,
                playerStyle: 'modern'
            });
            
            // Draw trajectory to goal with straight arrow
            drawTrajectory(
                canvas, 
                { x: position.x, y: position.y + 5 }, 
                { x: 50, y: 5 }, 
                'straight', 
                { 
                    color: '#FF9800',
                    width: 3,
                    gradient: true,
                    shadow: true,
                    arrow: true,
                    arrowSize: 10,
                    flightPath: true
                }
            );
        }
    };
    
    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <i className="fas fa-futbol"></i> Pitch Visualization
                </h3>
            </div>
            <div className="pitch-container p-4">
                <canvas 
                    ref={canvasRef}
                    className="pitch-canvas"
                    onClick={handleCanvasClick}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseLeave={handleCanvasMouseLeave}
                    style={{ cursor: 'pointer', borderRadius: '4px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                />
                {!recommendation && (
                    <div className="pitch-instructions">
                        Click anywhere on the pitch to select a set piece location
                    </div>
                )}
            </div>
        </div>
    );
};

export default PitchVisualization;