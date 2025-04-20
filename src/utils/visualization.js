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
        pitchColor: '#3e8e41',
        lineColor: 'rgba(255, 255, 255, 0.9)',
        goalColor: '#FFFFFF',
        showPenaltyBoxes: true,
        showCenterCircle: true,
        showCornerArcs: true,
        showPatternLines: true,
        modernStyle: true,
        glossEffect: true
    };
    
    const opts = { ...defaultOptions, ...options };
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw pitch background
    if (opts.modernStyle) {
        // Create pitch with gradient and pattern
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, adjustColor(opts.pitchColor, 15));
        gradient.addColorStop(0.5, opts.pitchColor);
        gradient.addColorStop(1, adjustColor(opts.pitchColor, -15));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add striped pattern for a more realistic look
        if (opts.showPatternLines) {
            drawPitchPattern(ctx, width, height, opts.pitchColor);
        }
        
        // Add subtle glossy effect
        if (opts.glossEffect) {
            const glossGradient = ctx.createRadialGradient(
                width * 0.5, height * 0.3, 10,
                width * 0.5, height * 0.3, Math.max(width, height) * 0.8
            );
            glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
            glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = glossGradient;
            ctx.fillRect(0, 0, width, height);
        }
    } else {
        // Simple flat color
        ctx.fillStyle = opts.pitchColor;
        ctx.fillRect(0, 0, width, height);
    }
    
    // Set line style for pitch markings
    ctx.strokeStyle = opts.lineColor;
    ctx.lineWidth = 2;
    
    // Draw pitch outline with shadow for depth
    if (opts.modernStyle) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
    }
    
    // Draw pitch outline
    ctx.strokeRect(width * 0.05, height * 0.05, width * 0.9, height * 0.9);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
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
        ctx.arc(width * 0.5, height * 0.5, 4, 0, Math.PI * 2);
        ctx.fillStyle = opts.lineColor;
        ctx.fill();
        
        // Draw small inner circle for more detail
        if (opts.modernStyle) {
            ctx.beginPath();
            ctx.arc(width * 0.5, height * 0.5, width * 0.03, 0, Math.PI * 2);
            ctx.stroke();
        }
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
        
        // Top penalty arc
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.25, width * 0.1, Math.PI, 2 * Math.PI);
        ctx.stroke();
        
        // Bottom penalty arc
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.75, width * 0.1, 0, Math.PI);
        ctx.stroke();
        
        // Penalty spots
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.2, 4, 0, Math.PI * 2);
        ctx.fillStyle = opts.lineColor;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.8, 4, 0, Math.PI * 2);
        ctx.fillStyle = opts.lineColor;
        ctx.fill();
    }
    
    // Draw goals with more detail
    if (opts.modernStyle) {
        // Top goal - with 3D effect
        ctx.fillStyle = opts.goalColor;
        ctx.fillRect(width * 0.45, height * 0.04, width * 0.1, height * 0.01);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(width * 0.45, height * 0.04, width * 0.1, height * 0.005);
        
        // Goal net texture (top)
        drawGoalNet(ctx, width * 0.45, height * 0.04, width * 0.1, height * 0.01);
        
        // Bottom goal - with 3D effect
        ctx.fillStyle = opts.goalColor;
        ctx.fillRect(width * 0.45, height * 0.95, width * 0.1, height * 0.01);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(width * 0.45, height * 0.95, width * 0.1, height * 0.005);
        
        // Goal net texture (bottom)
        drawGoalNet(ctx, width * 0.45, height * 0.95, width * 0.1, height * 0.01);
    } else {
        // Simple goals
        ctx.fillStyle = opts.goalColor;
        ctx.fillRect(width * 0.45, height * 0.04, width * 0.1, height * 0.01);
        ctx.fillRect(width * 0.45, height * 0.95, width * 0.1, height * 0.01);
    }
    
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
        
        // Corner flags for extra detail
        if (opts.modernStyle) {
            drawCornerFlag(ctx, width * 0.05, height * 0.05, '#FF0000');
            drawCornerFlag(ctx, width * 0.95, height * 0.05, '#FF0000');
            drawCornerFlag(ctx, width * 0.05, height * 0.95, '#FF0000');
            drawCornerFlag(ctx, width * 0.95, height * 0.95, '#FF0000');
        }
    }
};

/**
 * Draw realistic striped pattern on pitch
 */
function drawPitchPattern(ctx, width, height, baseColor) {
    const stripeWidth = width * 0.05;
    const lightColor = adjustColor(baseColor, 7);
    
    ctx.fillStyle = lightColor;
    
    for (let i = 0; i < width; i += stripeWidth * 2) {
        ctx.fillRect(i, 0, stripeWidth, height);
    }
}

/**
 * Draw a corner flag
 */
function drawCornerFlag(ctx, x, y, color) {
    const flagHeight = 10;
    const flagWidth = 6;
    
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - flagHeight);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - flagHeight);
    ctx.lineTo(x + flagWidth, y - flagHeight + flagWidth/2);
    ctx.lineTo(x, y - flagHeight + flagWidth);
    ctx.fill();
}

/**
 * Draw goal net texture
 */
function drawGoalNet(ctx, x, y, width, height) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    const verticalCount = 5;
    const verticalSpacing = width / verticalCount;
    
    for (let i = 1; i < verticalCount; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * verticalSpacing, y);
        ctx.lineTo(x + i * verticalSpacing, y + height);
        ctx.stroke();
    }
    
    // Horizontal lines
    const horizontalCount = 3;
    const horizontalSpacing = height / horizontalCount;
    
    for (let i = 1; i < horizontalCount; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y + i * horizontalSpacing);
        ctx.lineTo(x + width, y + i * horizontalSpacing);
        ctx.stroke();
    }
}

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
        radius: 5,
        glow: true,
        pulsate: false
    };
    
    const opts = { ...defaultOptions, ...options };
    
    // Add glow effect
    if (opts.glow) {
        ctx.shadowColor = opts.color;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    // Draw the point with gradient for 3D look
    const gradient = ctx.createRadialGradient(
        x, y, 0,
        x, y, opts.radius
    );
    gradient.addColorStop(0, adjustColor(opts.color, 30));
    gradient.addColorStop(0.7, opts.color);
    gradient.addColorStop(1, adjustColor(opts.color, -20));
    
    ctx.beginPath();
    ctx.arc(x, y, opts.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add highlight for 3D effect
    ctx.beginPath();
    ctx.arc(x - opts.radius * 0.3, y - opts.radius * 0.3, opts.radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();
    
    // Add ring around the point
    ctx.beginPath();
    ctx.arc(x, y, opts.radius * 1.5, 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = opts.color;
    ctx.stroke();
    
    // Reset shadow effect
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Add ripple animation effect (visual only, not actual animation)
    ctx.beginPath();
    ctx.arc(x, y, opts.radius * 2.5, 0, Math.PI * 2);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = adjustColor(opts.color, -10, 0.3);
    ctx.stroke();
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
        nameColor: '#FFFFFF',
        shadow: true,
        playerStyle: 'modern' // 'modern' or 'classic'
    };
    
    const opts = { ...defaultOptions, ...options };
    
    // Add shadow for depth
    if (opts.shadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    }
    
    if (opts.playerStyle === 'modern') {
        // Draw modern player icon with shirt-like design
        
        // Create gradient for 3D jersey look
        const gradient = ctx.createRadialGradient(
            x, y, 0,
            x, y, opts.radius
        );
        gradient.addColorStop(0, adjustColor(opts.color, 20));
        gradient.addColorStop(0.8, opts.color);
        gradient.addColorStop(1, adjustColor(opts.color, -20));
        
        // Draw player circle
        ctx.beginPath();
        ctx.arc(x, y, opts.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add jersey collar detail
        ctx.beginPath();
        ctx.arc(x, y - opts.radius * 0.3, opts.radius * 0.5, 0.9 * Math.PI, 2.1 * Math.PI);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = adjustColor(opts.color, -30);
        ctx.stroke();
        
        // Add body highlight
        ctx.beginPath();
        ctx.moveTo(x - opts.radius * 0.5, y - opts.radius * 0.3);
        ctx.lineTo(x + opts.radius * 0.5, y - opts.radius * 0.3);
        ctx.lineTo(x + opts.radius * 0.3, y + opts.radius * 0.6);
        ctx.lineTo(x - opts.radius * 0.3, y + opts.radius * 0.6);
        ctx.closePath();
        ctx.fillStyle = adjustColor(opts.color, 15);
        ctx.fill();
    } else {
        // Classic simple player circle
        ctx.beginPath();
        ctx.arc(x, y, opts.radius, 0, Math.PI * 2);
        ctx.fillStyle = opts.color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, y, opts.radius - 1, 0, Math.PI * 2);
        ctx.strokeStyle = adjustColor(opts.color, 20);
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw player number or initials inside circle
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
        ctx.fillText(initials.substring(0, 2), x, y);
    }
    
    // Show player name if enabled
    if (opts.showName && player.name) {
        // Name background for better readability
        const shortName = player.name.split(' ').pop();
        const textWidth = ctx.measureText(shortName).width + 6;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(
            x - textWidth/2,
            y + opts.radius + 5,
            textWidth,
            14
        );
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(shortName, x, y + opts.radius + 7);
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
        dashed: false,
        gradient: true,
        shadow: true,
        arrow: true,
        arrowSize: 8,
        dotted: false
    };
    
    const opts = { ...defaultOptions, ...options };
    
    // Clear any previous paths
    ctx.beginPath();
    
    // Set line style
    ctx.lineWidth = opts.width;
    
    // Create gradient if enabled
    if (opts.gradient) {
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        const baseColor = opts.color;
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(0.5, adjustColor(baseColor, 20)); // Lighter in middle
        gradient.addColorStop(1, adjustColor(baseColor, -10)); // Darker at end
        ctx.strokeStyle = gradient;
    } else {
        ctx.strokeStyle = opts.color;
    }
    
    // Add shadow for depth
    if (opts.shadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    }
    
    // Set line dash if needed
    if (opts.dashed) {
        ctx.setLineDash([5, 3]);
    } else if (opts.dotted) {
        ctx.setLineDash([2, 2]);
    } else {
        ctx.setLineDash([]);
    }
    
    ctx.beginPath();
    
    // Calculate the distance and angle between start and end points
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    if (type === 'straight') {
        // Straight line
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
    } else if (type === 'curved' || type === 'inswinger' || type === 'outswinger') {
        // Calculate control points for the curve
        let controlPoint1, controlPoint2;
        const curveIntensity = distance * 0.5; // Adjust this to change curve intensity
        
        // Figure out if we're crossing from left or right side
        const crossingFromRight = startX > width/2;
        const isLeftToRight = startX < endX;
        
        // For inswingers and outswingers, adjust the control points based on side of pitch and direction
        if (type.includes('inswinger')) {
            if (crossingFromRight) {
                // From right side: control point curves inward (left)
                controlPoint1 = {
                    x: startX - curveIntensity * 0.3,
                    y: startY + (endY - startY) * 0.2
                };
                controlPoint2 = {
                    x: startX - curveIntensity * 0.7,
                    y: startY + (endY - startY) * 0.6
                };
            } else {
                // From left side: control point curves inward (right)
                controlPoint1 = {
                    x: startX + curveIntensity * 0.3,
                    y: startY + (endY - startY) * 0.2
                };
                controlPoint2 = {
                    x: startX + curveIntensity * 0.7,
                    y: startY + (endY - startY) * 0.6
                };
            }
        } else if (type.includes('outswinger')) {
            if (crossingFromRight) {
                // From right side: control point curves outward (right)
                controlPoint1 = {
                    x: startX + curveIntensity * 0.2,
                    y: startY - (startY - endY) * 0.2
                };
                controlPoint2 = {
                    x: endX + curveIntensity * 0.5,
                    y: endY - (endY - startY) * 0.4
                };
            } else {
                // From left side: control point curves outward (left)
                controlPoint1 = {
                    x: startX - curveIntensity * 0.2,
                    y: startY - (startY - endY) * 0.2
                };
                controlPoint2 = {
                    x: endX - curveIntensity * 0.5,
                    y: endY - (endY - startY) * 0.4
                };
            }
        } else {
            // Generic curved line
            controlPoint1 = {
                x: startX + distance * 0.25,
                y: startY + distance * 0.1
            };
            controlPoint2 = {
                x: startX + distance * 0.75,
                y: endY - distance * 0.1
            };
        }
        
        // Draw the Bezier curve
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(
            controlPoint1.x, controlPoint1.y,
            controlPoint2.x, controlPoint2.y,
            endX, endY
        );
        
        // Draw control points for debugging (uncomment if needed)
        /*
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(controlPoint1.x, controlPoint1.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(controlPoint2.x, controlPoint2.y, 3, 0, Math.PI * 2);
        ctx.fill();
        */
    }
    
    ctx.stroke();
    
    // Reset shadow for other elements
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw flight path balls if enabled
    if (opts.flightPath) {
        drawFlightPath(ctx, startX, startY, endX, endY, type);
    }
    
    // Draw an arrow at the end
    if (opts.arrow) {
        drawArrowhead(ctx, endX, endY, angle, opts.arrowSize, opts.color);
    }
    
    // Reset dash pattern
    ctx.setLineDash([]);
};

/**
 * Draw arrowhead at the end of trajectory
 */
function drawArrowhead(ctx, x, y, angle, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size/2);
    ctx.lineTo(-size, size/2);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

/**
 * Draw flight path with small circles
 */
function drawFlightPath(ctx, startX, startY, endX, endY, type) {
    const steps = 10;
    const dotSize = 1.5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    
    for (let i = 1; i < steps; i++) {
        const t = i / steps;
        let x, y;
        
        if (type === 'straight') {
            x = startX + (endX - startX) * t;
            y = startY + (endY - startY) * t;
        } else {
            // For curved trajectories, calculate position along curve
            // This is a simplification - for accurate curve points we would need the control points
            x = startX + (endX - startX) * t;
            y = startY + (endY - startY) * t - Math.sin(t * Math.PI) * 20;
        }
        
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Lighten or darken a color
 */
function adjustColor(color, percent) {
    if (!color.startsWith('#')) return color;
    
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.max(0, Math.min(255, R + percent));
    G = Math.max(0, Math.min(255, G + percent));
    B = Math.max(0, Math.min(255, B + percent));

    const RR = R.toString(16).padStart(2, '0');
    const GG = G.toString(16).padStart(2, '0');
    const BB = B.toString(16).padStart(2, '0');

    return "#" + RR + GG + BB;
}