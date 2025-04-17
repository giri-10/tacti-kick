import React, { useRef, useEffect, useState } from 'react';
import { drawPitch, drawSetPieceLocation, drawTrajectory, drawPlayer } from '../utils/visualization';

const PitchVisualization = ({ onSetPieceSelect, recommendation }) => {
    const canvasRef = useRef(null);
    const [clickPosition, setClickPosition] = useState(null);
    
    // Initialize the pitch visualization
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            // Make the canvas responsive
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            
            // Draw the initial pitch
            drawPitch(canvas);
        }
    }, []);
    
    // Update visualization when recommendation changes
    useEffect(() => {
        if (!canvasRef.current || !clickPosition) return;
        
        const canvas = canvasRef.current;
        
        // Redraw the pitch
        drawPitch(canvas);
        
        // Draw the set piece location
        drawSetPieceLocation(canvas, clickPosition);
        
        // Draw the recommendation visualization if available
        if (recommendation) {
            visualizeRecommendation(canvas, clickPosition, recommendation);
        }
    }, [clickPosition, recommendation]);
    
    // Handle canvas click
    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        // Get click position relative to canvas
        const x = ((e.clientX - rect.left) / canvas.width) * 100;
        const y = ((e.clientY - rect.top) / canvas.height) * 100;
        
        // Update click position
        setClickPosition({ x, y });
        
        // Notify parent component
        if (onSetPieceSelect) {
            onSetPieceSelect({ x, y });
        }
    };
    
    // Visualize the recommendation
    const visualizeRecommendation = (canvas, position, recommendation) => {
        if (!recommendation) return;
        
        const { type, taker, deliveryType } = recommendation;
        
        if (type === 'corner') {
            // For corners, visualize the corner taker and trajectory
            const { targetZone, targetPlayers, cornerType } = recommendation;
            
            // Draw the taker
            const takerPosition = cornerType === 'left' 
                ? { x: 5, y: position.y } 
                : { x: 95, y: position.y };
            
            drawPlayer(canvas, takerPosition, taker, { color: '#2196F3' });
            
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
            
            // Draw trajectory
            const trajectoryType = deliveryType.id.toLowerCase();
            drawTrajectory(canvas, takerPosition, targetPosition, trajectoryType, { color: '#FF9800' });
            
            // Draw target players
            targetPlayers.forEach((player, index) => {
                // Spread target players around the target position
                const offset = index - (targetPlayers.length - 1) / 2;
                const playerPos = {
                    x: targetPosition.x + offset * 5,
                    y: targetPosition.y + offset * 3
                };
                
                drawPlayer(canvas, playerPos, player, { color: '#4CAF50' });
            });
        } else if (type === 'freeKick') {
            // For free kicks, visualize the taker and trajectory
            const { zone, isDirect, targetPlayers } = recommendation;
            
            // Draw the taker
            drawPlayer(canvas, position, taker, { color: '#2196F3' });
            
            if (isDirect) {
                // Direct free kick - draw trajectory to goal
                drawTrajectory(canvas, position, { x: 50, y: 5 }, 'curved', { color: '#FF9800' });
            } else {
                // Crossed free kick - draw trajectory to target area
                // Determine target position based on free kick position
                const isLeftSide = position.x < 50;
                const targetPosition = isLeftSide
                    ? { x: 60, y: 15 }
                    : { x: 40, y: 15 };
                
                // Draw trajectory
                const trajectoryType = deliveryType.id.toLowerCase().includes('in') ? 'inswinger' : 'outswinger';
                drawTrajectory(canvas, position, targetPosition, trajectoryType, { color: '#FF9800' });
                
                // Draw target players
                targetPlayers.forEach((player, index) => {
                    // Spread target players around the target position
                    const offset = index - (targetPlayers.length - 1) / 2;
                    const playerPos = {
                        x: targetPosition.x + offset * 5,
                        y: targetPosition.y + offset * 3
                    };
                    
                    drawPlayer(canvas, playerPos, player, { color: '#4CAF50' });
                });
            }
        }
    };
    
    return (
        <div className="pitch-container">
            <canvas 
                ref={canvasRef} 
                onClick={handleCanvasClick}
                className="pitch-canvas"
            />
            <div className="pitch-instructions">
                Click anywhere on the pitch to analyze set piece options
            </div>
        </div>
    );
};

export default PitchVisualization;