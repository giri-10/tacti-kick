import { calculateSuccessRate, getOptimalPlayerForSetPiece } from '../utils/analytics';
import { players } from '../data/players';
import { setPieces } from '../data/setpieces';
import {
    getPlayersByTeamId,
    getCornerAnalysis,
    getFreeKickAnalysis,
    getTargetPlayers,
    getPlayerById
} from './dataFetcher';

/**
 * Determines the type of set piece based on pitch coordinates
 * @param {Object} coordinates - {x, y} coordinates on the pitch (0-100 for both axes)
 * @returns {String} - 'corner' or 'freeKick'
 */
export const determineSetPieceType = (coordinates) => {
    const { x, y } = coordinates;
    
    // Corner detection - near corners of the pitch
    if ((x <= 5 || x >= 95) && (y <= 5 || y >= 95)) {
        return 'corner';
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
 * Generates set piece recommendations based on team and pitch position
 * @param {Number} teamId - Team ID
 * @param {Object} coordinates - {x, y} coordinates on the pitch
 * @returns {Object} - Set piece recommendations
 */
export const generateRecommendation = (teamId, coordinates) => {
    const setPieceType = determineSetPieceType(coordinates);
    const teamPlayers = getPlayersByTeamId(teamId);
    
    if (setPieceType === 'corner') {
        return generateCornerRecommendation(teamId, coordinates, teamPlayers);
    } else {
        return generateFreeKickRecommendation(teamId, coordinates, teamPlayers);
    }
};

/**
 * Generates corner recommendations
 * @param {Number} teamId - Team ID
 * @param {Object} coordinates - {x, y} coordinates
 * @param {Array} teamPlayers - Players from the selected team
 * @returns {Object} - Corner recommendations
 */
const generateCornerRecommendation = (teamId, coordinates, teamPlayers) => {
    const cornerType = determineCornerType(coordinates);
    const cornerData = getCornerAnalysis();
    const targetData = getTargetPlayers().cornerTargets;
    
    // Find best taker based on crossing ability and set piece success rate
    const bestTaker = teamPlayers.reduce((best, player) => {
        if (!best || player.crossingAbility > best.crossingAbility) {
            return player;
        }
        return best;
    }, null);
    
    // Find the best delivery type for this taker
    const bestDeliveryTypes = cornerData.deliveryTypes.filter(
        delivery => delivery.bestTakers.includes(bestTaker.id)
    );
    
    // Default to the first delivery type if none found
    const recommendedDelivery = bestDeliveryTypes.length > 0 
        ? bestDeliveryTypes[0] 
        : cornerData.deliveryTypes[0];
    
    // Find best zones for this delivery type
    const bestZone = cornerData.zones.reduce((best, zone) => {
        if (!best || zone.successRate[recommendedDelivery.id.toLowerCase()] > 
            best.successRate[recommendedDelivery.id.toLowerCase()]) {
            return zone;
        }
        return best;
    }, cornerData.zones[0]);
    
    // Find best targets for this zone
    const zoneTargets = targetData.find(target => target.zone === bestZone.id);
    const bestTargets = zoneTargets 
        ? zoneTargets.bestTargets.map(id => getPlayerById(id)).filter(player => 
            teamPlayers.some(tp => tp.id === player.id))
        : [];
    
    return {
        type: 'corner',
        cornerType,
        taker: bestTaker,
        deliveryType: recommendedDelivery,
        targetZone: bestZone,
        targetPlayers: bestTargets.slice(0, 3) // Top 3 targets
    };
};

/**
 * Generates free kick recommendations
 * @param {Number} teamId - Team ID
 * @param {Object} coordinates - {x, y} coordinates
 * @param {Array} teamPlayers - Players from the selected team
 * @returns {Object} - Free kick recommendations
 */
const generateFreeKickRecommendation = (teamId, coordinates, teamPlayers) => {
    const freeKickZone = determineFreeKickZone(coordinates);
    const freeKickData = getFreeKickAnalysis();
    const targetData = getTargetPlayers().freeKickTargets;
    
    // Find if direct shot or cross is better for this zone
    const isDirect = freeKickZone.successRate.direct > freeKickZone.successRate.crossed;
    
    // Find the appropriate delivery type
    let recommendedDelivery;
    if (isDirect) {
        recommendedDelivery = freeKickData.deliveryTypes.find(dt => dt.id === 'direct');
    } else {
        // For crosses, find the best crosser in the team
        const bestCrosser = teamPlayers.reduce((best, player) => {
            if (!best || player.crossingAbility > best.crossingAbility) {
                return player;
            }
            return best;
        }, null);
        
        // Find which delivery type the crosser is best at
        const crossDeliveryTypes = freeKickData.deliveryTypes.filter(dt => 
            dt.id !== 'direct' && dt.bestTakers.includes(bestCrosser.id)
        );
        
        recommendedDelivery = crossDeliveryTypes.length > 0 
            ? crossDeliveryTypes[0] 
            : freeKickData.deliveryTypes.find(dt => dt.id === 'inSwinger');
    }
    
    // Find best taker for this delivery type
    const bestTaker = teamPlayers.reduce((best, player) => {
        if (recommendedDelivery.bestTakers.includes(player.id)) {
            if (!best || player.setPieceSuccessRate.freeKicks > best.setPieceSuccessRate.freeKicks) {
                return player;
            }
        }
        return best;
    }, teamPlayers[0]);
    
    // Find best targets for crosses (if not direct)
    let bestTargets = [];
    if (!isDirect) {
        const zoneTargets = targetData.find(target => target.zone === freeKickZone.id);
        bestTargets = zoneTargets && zoneTargets.bestTargets 
            ? zoneTargets.bestTargets.map(id => getPlayerById(id)).filter(player => 
                teamPlayers.some(tp => tp.id === player.id))
            : [];
    }
    
    return {
        type: 'freeKick',
        zone: freeKickZone,
        isDirect,
        taker: bestTaker,
        deliveryType: recommendedDelivery,
        targetPlayers: bestTargets.slice(0, 3) // Top 3 targets
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
    
    const recommendations = {
        player: optimalPlayer.name,
        trajectory: bestSetPiece.trajectory,
        target: bestSetPiece.target,
        directOrIndirect: position.distanceToBox < 20 ? 'Direct' : 'Indirect'
    };

    return recommendations;
};