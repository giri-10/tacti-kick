import { calculateSuccessRate, getOptimalPlayerForSetPiece } from '../utils/analytics';
import { players } from '../data/players';
import { setPieces } from '../data/setpieces';
import {
    getPlayersByTeamId,
    getCornerAnalysis,
    getFreeKickAnalysis,
    getTargetPlayers,
    getPlayerById,
    getTallestPlayer,
    getBestPlayerByFoot
} from './dataFetcher';

/**
 * Determines the zone of the pitch (left, right, middle) based on coordinates
 * @param {Object} coordinates - {x, y} coordinates on the pitch (0-100 for both axes)
 * @returns {String} - 'left', 'right', or 'middle'
 */
export const determinePitchZone = (coordinates) => {
    const { x } = coordinates;
    
    if (x < 33) {
        return 'left';
    } else if (x > 66) {
        return 'right';
    } else {
        return 'middle';
    }
};

/**
 * Determines the type of set piece based on pitch coordinates
 * @param {Object} coordinates - {x, y} coordinates on the pitch (0-100 for both axes)
 * @returns {String} - 'corner', 'freeKick', or 'penalty'
 */
export const determineSetPieceType = (coordinates) => {
    const { x, y } = coordinates;
    
    // Corner detection - near corners of the pitch
    if ((x <= 5 || x >= 95) && (y <= 5 || y >= 95)) {
        return 'corner';
    }
    
    // Penalty detection - inside penalty box (approximately)
    if (y <= 20 && x >= 30 && x <= 70) {
        return 'penalty';
    }
    
    // Free kick for everything else
    return 'freeKick';
};

/**
 * Determines the specific zone of a free kick
 * @param {Object} coordinates - {x, y} coordinates 
 * @returns {String} - Zone ID from the free kick zones
 */
export const determineFreeKickZone = (coordinates) => {
    const { x, y } = coordinates;
    const freeKickZones = getFreeKickAnalysis().zones;
    
    // Approximate goal position at x=50, y=100
    const distanceFromGoal = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 100, 2));
    const isWide = Math.abs(x - 50) > 15; // More than 15 units from center is considered wide
    
    if (distanceFromGoal < 25) {
        // Close to goal - direct range
        if (!isWide) {
            return freeKickZones.find(zone => zone.id === 'directRange');
        } else {
            return freeKickZones.find(zone => zone.id === 'wideCloseRange');
        }
    } else {
        // Further from goal
        if (isWide) {
            return freeKickZones.find(zone => zone.id === 'deepWide');
        } else {
            return freeKickZones.find(zone => zone.id === 'deepCentral');
        }
    }
};

/**
 * Determines the specific corner type
 * @param {Object} coordinates - {x, y} coordinates
 * @returns {String} - 'left' or 'right' corner
 */
export const determineCornerType = (coordinates) => {
    const { x } = coordinates;
    
    if (x <= 5) {
        return 'left';
    } else {
        return 'right';
    }
};

/**
 * Determines the optimal foot for a set piece based on position
 * @param {Object} coordinates - {x, y} coordinates
 * @returns {String} - 'left' or 'right' foot preference
 */
export const determineOptimalFoot = (coordinates) => {
    const pitchZone = determinePitchZone(coordinates);
    
    // If on left side of pitch, prefer right foot for outswinger/inswinger
    if (pitchZone === 'left') {
        return 'right';
    }
    // If on right side of pitch, prefer left foot
    else if (pitchZone === 'right') {
        return 'left';
    }
    // Middle can use either, so we return null to find both
    else {
        return null;
    }
};

/**
 * Finds the best set piece takers in a team with specific foot preferences
 * @param {Array} teamPlayers - Array of team players
 * @returns {Object} - Object with bestLeftFooted and bestRightFooted players
 */
export const findBestSetPieceTakers = (teamPlayers) => {
    let bestLeftFooted = null;
    let bestRightFooted = null;
    
    // First pass: Find players where we know their foot preference
    for (const player of teamPlayers) {
        // For left-footed player
        if (player.foot === 'left') {
            if (!bestLeftFooted || 
                (player.setPieceSuccessRate.freeKicks + player.setPieceSuccessRate.corners) > 
                (bestLeftFooted.setPieceSuccessRate.freeKicks + bestLeftFooted.setPieceSuccessRate.corners)) {
                bestLeftFooted = player;
            }
        }
        // For right-footed player
        else if (player.foot === 'right') {
            if (!bestRightFooted || 
                (player.setPieceSuccessRate.freeKicks + player.setPieceSuccessRate.corners) > 
                (bestRightFooted.setPieceSuccessRate.freeKicks + bestRightFooted.setPieceSuccessRate.corners)) {
                bestRightFooted = player;
            }
        }
    }
    
    // If we couldn't find one or both, pick by best overall regardless of foot
    const allSorted = [...teamPlayers].sort((a, b) => {
        const aScore = a.setPieceSuccessRate.freeKicks + a.setPieceSuccessRate.corners;
        const bScore = b.setPieceSuccessRate.freeKicks + b.setPieceSuccessRate.corners;
        return bScore - aScore;
    });
    
    if (!bestLeftFooted && allSorted.length > 0) {
        bestLeftFooted = allSorted[0];
    }
    
    if (!bestRightFooted && allSorted.length > 1) {
        bestRightFooted = allSorted.find(p => p.id !== bestLeftFooted.id) || allSorted[0];
    }
    
    return { bestLeftFooted, bestRightFooted };
};

/**
 * Generates set piece recommendations based on team and pitch position
 * @param {Number} teamId - Team ID
 * @param {Object} coordinates - {x, y} coordinates on the pitch
 * @returns {Object} - Set piece recommendations
 */
export const generateRecommendation = async (teamId, coordinates) => {
    console.log("generateRecommendation called with:", { teamId, coordinates });
    
    // Add safety check for coordinates
    if (!coordinates || typeof coordinates.x !== 'number' || typeof coordinates.y !== 'number') {
        console.error("Invalid coordinates received:", coordinates);
        throw new Error("Invalid coordinates - must have x and y numeric values");
    }
    
    const setPieceType = determineSetPieceType(coordinates);
    console.log("Set piece type determined:", setPieceType);
    
    const teamPlayers = await getPlayersByTeamId(teamId);
    const pitchZone = determinePitchZone(coordinates);
    console.log("Pitch zone determined:", pitchZone);
    
    const optimalFoot = determineOptimalFoot(coordinates);
    console.log("Optimal foot determined:", optimalFoot);
    
    // Find the team's best set piece takers based on foot
    const { bestLeftFooted, bestRightFooted } = findBestSetPieceTakers(teamPlayers);
    console.log("Best takers found:", { 
        leftFooted: bestLeftFooted?.name, 
        rightFooted: bestRightFooted?.name 
    });
    
    let recommendation;
    if (setPieceType === 'corner') {
        recommendation = generateCornerRecommendation(teamId, coordinates, teamPlayers, pitchZone, bestLeftFooted, bestRightFooted);
    } else if (setPieceType === 'penalty') {
        recommendation = generatePenaltyRecommendation(teamId, coordinates, teamPlayers, pitchZone);
    } else {
        recommendation = generateFreeKickRecommendation(teamId, coordinates, teamPlayers, pitchZone, bestLeftFooted, bestRightFooted);
    }
    
    // Ensure position is attached to the recommendation
    if (recommendation) {
        recommendation.position = { ...coordinates };
        console.log("Final recommendation position:", recommendation.position);
    }
    
    return recommendation;
};

/**
 * Generates penalty recommendations
 * @param {Number} teamId - Team ID
 * @param {Object} coordinates - {x, y} coordinates
 * @param {Array} teamPlayers - Players from the selected team
 * @returns {Object} - Penalty recommendations
 */
const generatePenaltyRecommendation = async (teamId, coordinates, teamPlayers, pitchZone) => {
    // Find best penalty taker based on success rate or shooting ability
    const bestTaker = teamPlayers.reduce((best, player) => {
        // Check if player has penalty stats
        const penaltyRate = player.penaltySuccessRate || 0;
        const bestPenaltyRate = best ? (best.penaltySuccessRate || 0) : 0;
        
        if (!best || penaltyRate > bestPenaltyRate) {
            return player;
        }
        return best;
    }, null);
    
    return {
        type: 'penalty',
        pitchZone,
        taker: bestTaker,
        note: 'Direct penalty kick - no target players needed'
    };
};

/**
 * Find best target players for set pieces
 * @param {Array} teamPlayers - Array of team players
 * @param {Object} taker - The player taking the set piece who should be excluded from targets
 * @returns {Array} - Array of best target players (usually tall and good at scoring)
 */
const findBestTargetPlayers = (teamPlayers, taker) => {
    // Filter out the set piece taker from potential targets
    const eligibleTargets = taker ? teamPlayers.filter(player => player.id !== taker.id) : teamPlayers;
    
    // Create a scoring formula for each player as a target
    const playersWithTargetScore = eligibleTargets.map(player => {
        // Height and goals are the most important factors
        const heightScore = (player.height - 170) * 2; // Taller is better
        const goalScore = player.goalsFromSetPieces * 10; // More goals is better
        const positionScore = 
            player.position.includes('Center Back') || player.position.includes('Defender') ? 30 : 
            player.position.includes('Striker') ? 25 : 
            player.position.includes('Forward') ? 20 : 
            player.position.includes('Midfielder') ? 15 : 0;
        
        const totalScore = heightScore + goalScore + positionScore;
        
        return {
            ...player,
            targetScore: totalScore
        };
    });
    
    // Sort by target score and return top 3
    return playersWithTargetScore
        .sort((a, b) => b.targetScore - a.targetScore)
        .slice(0, 3);
};

/**
 * Determines the best ball trajectory based on taker's foot and pitch position
 * @param {String} pitchZone - 'left', 'right', or 'middle'
 * @param {String} foot - 'left' or 'right'
 * @returns {Object} - Trajectory information
 */
const determineBallTrajectory = (pitchZone, foot, setPieceType) => {
    // For corners
    if (setPieceType === 'corner') {
        if (pitchZone === 'left') {
            return foot === 'right' ? 
                { type: 'inswinger', description: 'Right-footed inswinging corner from the left' } : 
                { type: 'outswinger', description: 'Left-footed outswinging corner from the left' };
        } else { // right corner
            return foot === 'left' ? 
                { type: 'inswinger', description: 'Left-footed inswinging corner from the right' } : 
                { type: 'outswinger', description: 'Right-footed outswinging corner from the right' };
        }
    }
    
    // For free kicks
    // Direct free kicks in central areas
    if (pitchZone === 'middle') {
        return { 
            type: 'direct', 
            description: `${foot === 'left' ? 'Left' : 'Right'}-footed direct free kick aimed at goal` 
        };
    }
    
    // Wide free kicks
    if (pitchZone === 'left') {
        return foot === 'right' ? 
            { type: 'inswinger', description: 'Right-footed inswinging cross from the left' } : 
            { type: 'outswinger', description: 'Left-footed outswinging cross from the left' };
    } else { // right side
        return foot === 'left' ? 
            { type: 'inswinger', description: 'Left-footed inswinging cross from the right' } : 
            { type: 'outswinger', description: 'Right-footed outswinging cross from the right' };
    }
};

/**
 * Generates corner recommendations
 * @param {Number} teamId - Team ID
 * @param {Object} coordinates - {x, y} coordinates
 * @param {Array} teamPlayers - Players from the selected team
 * @returns {Object} - Corner recommendations
 */
const generateCornerRecommendation = async (teamId, coordinates, teamPlayers, pitchZone, bestLeftFooted, bestRightFooted) => {
    const cornerType = determineCornerType(coordinates);
    const cornerData = getCornerAnalysis();
    
    // Determine preferred foot based on corner position
    // Left corner = right foot is optimal for inswingers
    // Right corner = left foot is optimal for inswingers
    const preferredFoot = cornerType === 'left' ? 'right' : 'left';
    
    // Choose the taker based on preferred foot
    const bestTaker = preferredFoot === 'left' ? bestLeftFooted : bestRightFooted;
    
    // Find best target players (tall, good at headers)
    // Pass the taker to exclude them from the target list
    const bestTargets = findBestTargetPlayers(teamPlayers, bestTaker);
    
    // Determine optimal ball trajectory
    const ballTrajectory = determineBallTrajectory(pitchZone, bestTaker.foot || preferredFoot, 'corner');
    
    // Find or create a delivery type based on trajectory
    const recommendedDelivery = cornerData.deliveryTypes.find(dt => 
        dt.id.toLowerCase() === ballTrajectory.type.toLowerCase()
    ) || {
        id: ballTrajectory.type,
        name: ballTrajectory.description
    };
    
    // Get standard zones from the data
    const bestZone = cornerData.zones.find(zone => 
        zone.id === (ballTrajectory.type === 'inswinger' ? 'nearPost' : 'farPost')
    ) || cornerData.zones[0];
    
    return {
        type: 'corner',
        pitchZone,
        cornerType,
        taker: bestTaker,
        alternateTaker: preferredFoot === 'left' ? bestRightFooted : bestLeftFooted,
        deliveryType: recommendedDelivery,
        ballTrajectory,
        targetZone: bestZone,
        targetPlayers: bestTargets,
        analysis: `This is a ${cornerType} corner, best taken by a ${preferredFoot}-footed player for an ${ballTrajectory.type}. ${bestTaker.name} is the recommended taker.`
    };
};

/**
 * Generates free kick recommendations
 * @param {Number} teamId - Team ID
 * @param {Object} coordinates - {x, y} coordinates
 * @param {Array} teamPlayers - Players from the selected team
 * @returns {Object} - Free kick recommendations
 */
const generateFreeKickRecommendation = async (teamId, coordinates, teamPlayers, pitchZone, bestLeftFooted, bestRightFooted) => {
    const freeKickZone = determineFreeKickZone(coordinates);
    const freeKickData = getFreeKickAnalysis();
    
    // Calculate distance from goal
    const distanceFromGoal = Math.sqrt(Math.pow(coordinates.x - 50, 2) + Math.pow(coordinates.y - 5, 2));
    const isCloseToBox = distanceFromGoal < 30;
    
    // Determine if direct shot is recommended
    const isDirect = (isCloseToBox && pitchZone === 'middle') || 
                    (freeKickZone && freeKickZone.successRate && 
                     freeKickZone.successRate.direct > freeKickZone.successRate.crossed);
    
    // Determine optimal foot preference for this position
    const preferredFoot = pitchZone === 'left' ? 'right' : 
                         pitchZone === 'right' ? 'left' : 
                         isDirect ? 'right' : null; // Default to right foot for central direct kicks
    
    // Choose the proper taker based on position and kick type
    let bestTaker, alternateTaker;
    
    if (preferredFoot === 'left') {
        bestTaker = bestLeftFooted;
        alternateTaker = bestRightFooted;
    } else if (preferredFoot === 'right') {
        bestTaker = bestRightFooted;
        alternateTaker = bestLeftFooted;
    } else {
        // For middle positions, choose based on set piece ability
        const sortedTakers = [bestLeftFooted, bestRightFooted].sort((a, b) => 
            (b.setPieceSuccessRate.freeKicks || 0) - (a.setPieceSuccessRate.freeKicks || 0)
        );
        bestTaker = sortedTakers[0];
        alternateTaker = sortedTakers[1];
    }
    
    // Determine the ball trajectory
    const ballTrajectory = determineBallTrajectory(
        pitchZone, 
        bestTaker.foot || preferredFoot || 'right', 
        'freeKick'
    );
    
    // Find or create a delivery type
    const recommendedDelivery = freeKickData.deliveryTypes.find(dt => 
        dt.id.toLowerCase() === ballTrajectory.type.toLowerCase()
    ) || {
        id: ballTrajectory.type,
        name: ballTrajectory.description
    };
    
    // Find best targets for non-direct free kicks
    // Pass the taker to exclude them from the target list
    const bestTargets = !isDirect ? findBestTargetPlayers(teamPlayers, bestTaker) : [];
    
    // Build comprehensive recommendation
    return {
        type: 'freeKick',
        pitchZone,
        zone: freeKickZone,
        isDirect,
        taker: bestTaker,
        alternateTaker,
        deliveryType: recommendedDelivery,
        ballTrajectory,
        targetPlayers: bestTargets,
        analysis: isDirect ?
            `This is a direct free kick from the ${pitchZone} zone. ${bestTaker.name} (${bestTaker.foot || 'preferred'}-footed) is the recommended taker.` :
            `This is a crossing free kick from the ${pitchZone} zone. ${bestTaker.name} (${bestTaker.foot || 'preferred'}-footed) should deliver an ${ballTrajectory.type} ball for the target players.`
    };
};

/**
 * Generates set piece recommendations based on team and set piece type
 * @param {String} team - Team name
 * @param {String} setPieceType - Type of set piece (e.g., 'corner', 'freeKick')
 * @param {Object} position - Position object containing distance to box
 * @returns {Object} - Set piece recommendations
 */
export const recommendSetPieceExecution = (team, setPieceType, position) => {
    const teamSetPieces = setPieces.filter(sp => sp.team === team && sp.type === setPieceType);
    
    if (teamSetPieces.length === 0) {
        return { message: "No set piece data available for this team and type." };
    }

    const successRates = teamSetPieces.map(sp => calculateSuccessRate(sp));
    const bestSuccessRate = Math.max(...successRates);
    const bestSetPiece = teamSetPieces[successRates.indexOf(bestSuccessRate)];

    const optimalPlayer = getOptimalPlayerForSetPiece(players, bestSetPiece);
    
    // If it's a penalty, don't recommend target players
    if (position.insideBox) {
        return {
            type: 'penalty',
            player: optimalPlayer.name,
            note: 'Direct penalty kick - no target players needed'
        };
    }
    
    const isCloseToBox = position.distanceToBox < 25;
    const isPenalty = position.insideBox;
    
    const recommendations = {
        player: optimalPlayer.name,
        trajectory: bestSetPiece.trajectory,
        directOrIndirect: isCloseToBox ? 'Direct' : 'Indirect',
    };
    
    // Only add target for indirect free kicks and corners
    if (!isCloseToBox && !isPenalty) {
        recommendations.target = bestSetPiece.target;
    }

    return recommendations;
};