/**
 * Calculate success rate for a set piece based on various factors
 * @param {Object} player - Player object
 * @param {String} setPieceType - Type of set piece (corners or freeKicks)
 * @returns {Number} - Success rate as a percentage
 */
export const calculateSuccessRate = (player, setPieceType) => {
    if (!player || !player.setPieceSuccessRate || !player.setPieceSuccessRate[setPieceType]) {
        return 0;
    }
    return player.setPieceSuccessRate[setPieceType];
};

/**
 * Find the optimal player for taking a set piece
 * @param {Array} players - Array of player objects
 * @param {String} setPieceType - Type of set piece (corners or freeKicks)
 * @returns {Object} - The optimal player
 */
export const getOptimalPlayerForSetPiece = (players, setPieceType) => {
    if (!players || players.length === 0) {
        return null;
    }
    
    return players.reduce((bestPlayer, currentPlayer) => {
        const currentSuccessRate = calculateSuccessRate(currentPlayer, setPieceType);
        const bestSuccessRate = calculateSuccessRate(bestPlayer, setPieceType);
        
        return currentSuccessRate > bestSuccessRate ? currentPlayer : bestPlayer;
    }, players[0]);
};

/**
 * Calculate the best type of delivery based on player abilities and position
 * @param {Object} player - Player object
 * @param {String} setPieceType - Type of set piece
 * @param {Object} position - Position data 
 * @returns {String} - Recommended delivery type
 */
export const calculateOptimalDeliveryType = (player, setPieceType, position) => {
    if (setPieceType === 'corners') {
        if (player.crossingAbility > 85) {
            return 'inswinger';
        } else {
            return 'outswinger';
        }
    } else if (setPieceType === 'freeKicks') {
        const distanceFromGoal = position.distanceToGoal;
        const isWide = position.isWide;
        
        if (distanceFromGoal < 25 && !isWide) {
            return 'direct';
        } else if (player.crossingAbility > 85) {
            return 'lofted';
        } else {
            return 'driven';
        }
    }
    
    return 'standard';
};

/**
 * Find optimal target players based on set piece type and delivery
 * @param {Array} players - Array of player objects
 * @param {String} setPieceType - Type of set piece
 * @param {String} deliveryType - Type of delivery
 * @returns {Array} - Array of optimal target players
 */
export const findOptimalTargets = (players, setPieceType, deliveryType) => {
    if (!players || players.length === 0) {
        return [];
    }
    
    // Sort by height for crosses and aerial threats
    if (setPieceType === 'corners' || 
        (setPieceType === 'freeKicks' && deliveryType !== 'direct')) {
        return players
            .sort((a, b) => {
                // Prioritize by height for aerial threats
                if (a.height !== b.height) {
                    return b.height - a.height;
                }
                // Then by goals from set pieces
                return b.goalsFromSetPieces - a.goalsFromSetPieces;
            })
            .slice(0, 3); // Return top 3 targets
    }
    
    // For direct free kicks, sort by free kick ability
    return players
        .sort((a, b) => {
            return b.setPieceSuccessRate.freeKicks - a.setPieceSuccessRate.freeKicks;
        })
        .slice(0, 1); // Only need the taker
};