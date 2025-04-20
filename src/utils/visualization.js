/**
 * Draw a football pitch on a canvas element
 * @param {HTMLCanvasElement} canvas - The canvas element to draw on
 * @param {Object} options - Customization options
 */
export const drawPitch = (canvas, options = {}) => {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Default options
    const defaultOptions = {
        pitchColor: '#4CAF50',
        lineColor: '#FFFFFF',
        goalColor: '#FFFFFF',
        showPenaltyBoxes: true,
        showCenterCircle: true,
        showCornerArcs: true
    };
    
    const opts = { ...defaultOptions, ...options };
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw pitch background
    ctx.fillStyle = opts.pitchColor;
    ctx.fillRect(0, 0, width, height);
    
    // Set line style
    ctx.strokeStyle = opts.lineColor;
    ctx.lineWidth = 2;
    
    // Draw pitch outline
    ctx.strokeRect(width * 0.05, height * 0.05, width * 0.9, height * 0.9);
    
    // Draw halfway line
    ctx.beginPath();
    ctx.moveTo(width * 0.05, height * 0.5);
    ctx.lineTo(width * 0.95, height * 0.5);
    ctx.stroke();
    
    // Draw center circle
    if (opts.showCenterCircle) {
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.1, 0, Math.PI * 2);
        ctx.stroke();
        
        // Center spot
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, 3, 0, Math.PI * 2);
        ctx.fillStyle = opts.lineColor;
        ctx.fill();
    }
    
    // Draw penalty boxes
    if (opts.showPenaltyBoxes) {
        // Top penalty box (larger)
        ctx.strokeRect(
            width * 0.3, 
            height * 0.05, 
            width * 0.4, 
            height * 0.2
        );
        
        // Top goal box (smaller)
        ctx.strokeRect(
            width * 0.4, 
            height * 0.05, 
            width * 0.2, 
            height * 0.1
        );
        
        // Bottom penalty box (larger)
        ctx.strokeRect(
            width * 0.3, 
            height * 0.75, 
            width * 0.4, 
            height * 0.2
        );
        
        // Bottom goal box (smaller)
        ctx.strokeRect(
            width * 0.4, 
            height * 0.85, 
            width * 0.2, 
            height * 0.1
        );
        
        // Penalty spots
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.8, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw goals
    ctx.fillStyle = opts.goalColor;
    
    // Top goal
    ctx.fillRect(width * 0.45, height * 0.04, width * 0.1, height * 0.01);
    
    // Bottom goal
    ctx.fillRect(width * 0.45, height * 0.95, width * 0.1, height * 0.01);
    
    // Draw corner arcs
    if (opts.showCornerArcs) {
        // Top left
        ctx.beginPath();
        ctx.arc(width * 0.05, height * 0.05, width * 0.02, 0, Math.PI / 2);
        ctx.stroke();
        
        // Top right
        ctx.beginPath();
        ctx.arc(width * 0.95, height * 0.05, width * 0.02, Math.PI / 2, Math.PI);
        ctx.stroke();
        
        // Bottom left
        ctx.beginPath();
        ctx.arc(width * 0.05, height * 0.95, width * 0.02, 3 * Math.PI / 2, 2 * Math.PI);
        ctx.stroke();
        
        // Bottom right
        ctx.beginPath();
        ctx.arc(width * 0.95, height * 0.95, width * 0.02, Math.PI, 3 * Math.PI / 2);
        ctx.stroke();
    }
};

/**
 * Draw a point on the pitch to represent a set piece location
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {Object} coordinates - {x, y} coordinates (0-100 scale)
 * @param {Object} options - Customization options
 */
export const drawSetPieceLocation = (canvas, coordinates, options = {}) => {
    // Safety check - make sure canvas and coordinates are defined
    if (!canvas || !coordinates || typeof coordinates.x !== 'number' || typeof coordinates.y !== 'number') {
        console.warn('Invalid canvas or coordinates for drawSetPieceLocation', { canvas, coordinates });
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Convert coordinates from 0-100 scale to canvas scale
    const x = (coordinates.x / 100) * width;
    const y = (coordinates.y / 100) * height;
    
    // Default options
    const defaultOptions = {
        color: '#FF0000',
        radius: 5
    };
    
    const opts = { ...defaultOptions, ...options };
    
    // Draw the point
    ctx.beginPath();
    ctx.arc(x, y, opts.radius, 0, Math.PI * 2);
    ctx.fillStyle = opts.color;
    ctx.fill();
};

/**
 * Draw a player on the pitch
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {Object} coordinates - {x, y} coordinates (0-100 scale)
 * @param {Object} player - Player information
 * @param {Object} options - Customization options
 */
export const drawPlayer = (canvas, coordinates, player, options = {}) => {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Convert coordinates from 0-100 scale to canvas scale
    const x = (coordinates.x / 100) * width;
    const y = (coordinates.y / 100) * height;
    
    // Default options
    const defaultOptions = {
        color: '#3F51B5',
        radius: 10,
        showName: true,
        nameColor: '#FFFFFF'
    };
    
    const opts = { ...defaultOptions, ...options };
    
    // Draw the player circle
    ctx.beginPath();
    ctx.arc(x, y, opts.radius, 0, Math.PI * 2);
    ctx.fillStyle = opts.color;
    ctx.fill();
    
    // Draw player number or initials
    if (player.number) {
        ctx.fillStyle = opts.nameColor;
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.number, x, y);
    } else if (player.name) {
        const initials = player.name.split(' ').map(n => n[0]).join('');
        ctx.fillStyle = opts.nameColor;
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, x, y);
    }
    
    // Show player name if enabled
    if (opts.showName && player.name) {
        ctx.fillStyle = '#000000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(player.name, x, y + opts.radius + 5);
    }
};

/**
 * Draw a trajectory line on the pitch
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {Object} start - Starting {x, y} coordinates (0-100 scale)
 * @param {Object} end - Ending {x, y} coordinates (0-100 scale)
 * @param {String} type - Type of trajectory ('straight', 'curved', 'inswinger', 'outswinger')
 * @param {Object} options - Customization options
 */
export const drawTrajectory = (canvas, start, end, type = 'straight', options = {}) => {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Convert coordinates from 0-100 scale to canvas scale
    const startX = (start.x / 100) * width;
    const startY = (start.y / 100) * height;
    const endX = (end.x / 100) * width;
    const endY = (end.y / 100) * height;
    
    // Default options
    const defaultOptions = {
        color: '#FF9800',
        width: 2,
        dashed: false
    };
    
    const opts = { ...defaultOptions, ...options };
    
    // Set line style
    ctx.strokeStyle = opts.color;
    ctx.lineWidth = opts.width;
    
    if (opts.dashed) {
        ctx.setLineDash([5, 3]);
    } else {
        ctx.setLineDash([]);
    }
    
    // Draw the trajectory
    ctx.beginPath();
    
    if (type === 'straight') {
        // Straight line
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
    } else if (type === 'curved' || type === 'inswinger' || type === 'outswinger') {
        const controlPoint = { x: 0, y: 0 };
        
        // Determine if we're crossing from left or right side
        const crossingFromRight = startX > width/2;
        
        // For inswingers and outswingers, adjust the control point based on side of pitch
        if (type === 'inswinger') {
            if (crossingFromRight) {
                // From right side: control point curves inward (left)
                controlPoint.x = (startX + endX) / 2 - Math.abs(endY - startY) * 0.7;
                controlPoint.y = (startY + endY) / 2;
            } else {
                // From left side: control point curves inward (right)
                controlPoint.x = (startX + endX) / 2 + Math.abs(endY - startY) * 0.7;
                controlPoint.y = (startY + endY) / 2;
            }
        } else if (type === 'outswinger') {
            if (crossingFromRight) {
                // From right side: control point curves outward (right)
                controlPoint.x = (startX + endX) / 2 + Math.abs(endY - startY) * 0.7;
                controlPoint.y = (startY + endY) / 2;
            } else {
                // From left side: control point curves outward (left)
                controlPoint.x = (startX + endX) / 2 - Math.abs(endY - startY) * 0.7;
                controlPoint.y = (startY + endY) / 2;
            }
        } else {
            // Generic curved line
            controlPoint.x = (startX + endX) / 2;
            controlPoint.y = Math.min(startY, endY) - Math.abs(endX - startX) * 0.3;
        }
        
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endX, endY);
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
};