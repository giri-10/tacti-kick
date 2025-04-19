import React, { useRef, useEffect, useState } from 'react';
import { drawPitch, drawSetPieceLocation, drawTrajectory, drawPlayer } from '../utils/visualization';

const PitchVisualization = ({ onSetPieceSelect, recommendation }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [clickPosition, setClickPosition] = useState(null);
    
    // Initialize the pitch visualization
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const resizeCanvas = () => {
            const container = containerRef.current;
            const containerWidth = container?.clientWidth || window.innerWidth;
            const containerHeight = container?.clientHeight || window.innerHeight * 0.7;
            
            // Set canvas display size to match container
            canvas.style.width = `${containerWidth}px`;
            canvas.style.height = `${containerHeight}px`;
            
            // Set canvas drawing buffer size (1:1 pixel ratio for exact click coordinates)
            canvas.width = containerWidth;
            canvas.height = containerHeight;
            
            console.log(`Canvas resized to ${containerWidth}x${containerHeight}`);
            
            // Redraw everything
            drawPitch(canvas);
            
            if (clickPosition) {
                drawSetPieceLocation(canvas, clickPosition);
                
                if (recommendation) {
                    visualizeRecommendation(canvas, clickPosition, recommendation);
                }
            }
        };
        
        // Initial sizing
        resizeCanvas();
        
        // Add resize event listener
        window.addEventListener('resize', resizeCanvas);
        
        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [clickPosition, recommendation]);
    
    // Update visualization when recommendation changes
    useEffect(() => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        
        // Redraw the pitch
        drawPitch(canvas);
        
        // Draw the set piece location if we have a click position
        if (clickPosition) {
            drawSetPieceLocation(canvas, clickPosition);
            console.log('Drawing set piece at:', clickPosition);
            
            // Draw the recommendation visualization if available
            if (recommendation) {
                visualizeRecommendation(canvas, clickPosition, recommendation);
            }
        }
    }, [clickPosition, recommendation]);
    
    // Handle canvas click with improved coordinate calculation
    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Get the canvas's position relative to the viewport
        const rect = canvas.getBoundingClientRect();
        
        // Calculate click coordinates relative to canvas (in canvas pixels)
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;
        
        // Convert to percentage coordinates (0-100)
        const x = (relativeX / rect.width) * 100;
        const y = (relativeY / rect.height) * 100;
        
        const position = { x, y };
        console.log('Click detected at:', { 
            clientX: e.clientX,
            clientY: e.clientY,
            rect: {left: rect.left, top: rect.top, width: rect.width, height: rect.height},
            canvas: {width: canvas.width, height: canvas.height},
            relative: {x: relativeX, y: relativeY},
            percent: {x, y}
        });
        
        // Update click position
        setClickPosition(position);
        
        // Notify parent component
        if (onSetPieceSelect) {
            onSetPieceSelect(position);
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
        } else if (type === 'penalty') {
            // For penalties, just show the taker
            drawPlayer(canvas, position, taker, { color: '#2196F3' });
            // Draw trajectory to goal
            drawTrajectory(canvas, position, { x: 50, y: 5 }, 'straight', { color: '#FF9800' });
        }
    };
    
    return (
        <div className="pitch-container" ref={containerRef}>
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