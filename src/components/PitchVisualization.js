import React, { useRef, useEffect, useState } from 'react';
import { drawPitch, drawSetPieceLocation, drawTrajectory, drawPlayer } from '../utils/visualization';

const PitchVisualization = ({ onLocationSelect, recommendation }) => {
    const canvasRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [pointerPosition, setPointerPosition] = useState({ x: -1, y: -1 });
    
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
            
            // Draw the pitch with enhanced styling
            drawPitch(canvas, {
                pitchColor: '#3e8e41',  // Richer green color
                lineColor: 'rgba(255, 255, 255, 0.8)',
                goalColor: 'rgba(255, 255, 255, 0.9)',
                showPenaltyBoxes: true,
                showCenterCircle: true,
                showCornerArcs: true
            });
            
            // If we have a recommendation, visualize it
            if (recommendation) {
                visualizeRecommendation(canvas, recommendation);
            }
            
            // Draw temporary position indicator if mouse is over the canvas
            if (pointerPosition.x >= 0 && pointerPosition.y >= 0) {
                drawSetPieceLocation(canvas, pointerPosition, { 
                    color: 'rgba(255, 152, 0, 0.6)',
                    radius: 6
                });
            }
        }
    }, [canvasSize, pointerPosition, recommendation]);
    
    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        // Calculate position as percentage of canvas size (0-100 scale)
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        
        // Pass the coordinates to the parent component
        onLocationSelect({ x, y });
    };
    
    const handleCanvasMouseMove = (e) => {
        const canvas = canvasRef.current;
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
        const { type, position, taker, targetPlayers = [], targetZone, deliveryType } = recommendation;
        
        // Draw the set piece location
        drawSetPieceLocation(canvas, position, { 
            color: '#f44336', // Red color for the set piece location
            radius: 7 
        });
        
        if (type === 'corner') {
            // For corners, visualize the taker and trajectory to target zone
            drawPlayer(canvas, position, taker, { color: '#2196F3' });
            
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
        } else if (type === 'penalty') {
            // Draw the taker
            drawPlayer(canvas, { x: position.x, y: position.y + 5 }, taker, { color: '#2196F3' });
            
            // Draw trajectory to goal
            drawTrajectory(
                canvas, 
                { x: position.x, y: position.y + 5 }, 
                { x: 50, y: 5 }, 
                'straight', 
                { color: '#FF9800' }
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