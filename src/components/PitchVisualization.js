import React, { useState, useEffect } from 'react';
import Pitch3D from './Pitch3D';

// Using the new 3D pitch visualization instead of the 2D canvas implementation
const PitchVisualization = ({ onLocationSelect, recommendation, initialPosition }) => {
    const [clickedPosition, setClickedPosition] = useState(initialPosition);
    
    // Update clickedPosition when initialPosition changes from parent
    useEffect(() => {
        if (initialPosition) {
            setClickedPosition(initialPosition);
            console.log("Updated clicked position from initialPosition:", initialPosition);
        }
    }, [initialPosition]);
    
    const handleLocationSelect = (position) => {
        console.log("Canvas clicked at position:", position);
        
        // Store the clicked position for visualization
        setClickedPosition(position);
        
        // Pass the coordinates to the parent component
        if (typeof onLocationSelect === 'function') {
            onLocationSelect(position);
        } else {
            console.error("onLocationSelect is not a function");
        }
    };
    
    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <i className="fas fa-futbol"></i> Pitch Visualization
                </h3>
            </div>
            <div className="pitch-container">
                <Pitch3D 
                    onLocationSelect={handleLocationSelect}
                    recommendation={recommendation}
                    initialPosition={clickedPosition}
                />
                {/* Removed duplicate instruction message */}
            </div>
        </div>
    );
};

export default PitchVisualization;