import { players } from '../data/players';
import { teams } from '../data/teams';
import { setPieces } from '../data/setpieces';

// Get all teams
export const getTeams = () => {
    return teams;
};

// Get a specific team by ID
export const getTeamById = (teamId) => {
    return teams.find(team => team.id === teamId);
};

// Get players for a specific team
export const getPlayersByTeamId = (teamId) => {
    const team = teams.find(team => team.id === teamId);
    if (!team) return [];
    
    return team.squad.map(playerId => 
        players.find(player => player.id === playerId)
    ).filter(Boolean);
};

// Get a specific player by ID
export const getPlayerById = (playerId) => {
    return players.find(player => player.id === playerId);
};

// Get all set piece data
export const getSetPieceData = () => {
    return setPieces;
};

// Get corner analysis data
export const getCornerAnalysis = () => {
    return setPieces.corners;
};

// Get free kick analysis data
export const getFreeKickAnalysis = () => {
    return setPieces.freeKicks;
};

// Get target player analysis data
export const getTargetPlayers = () => {
    return setPieces.targets;
};

// Get best set piece taker for a specific team
export const getBestSetPieceTaker = (teamId, setPieceType) => {
    const teamPlayers = getPlayersByTeamId(teamId);
    if (!teamPlayers.length) return null;

    return teamPlayers.reduce((best, player) => {
        if (!best || player.setPieceSuccessRate[setPieceType] > best.setPieceSuccessRate[setPieceType]) {
            return player;
        }
        return best;
    }, null);
};

// Get best target players for set pieces
export const getBestTargetPlayers = (teamId, zone, setPieceType) => {
    const teamPlayers = getPlayersByTeamId(teamId);
    if (!teamPlayers.length) return [];

    // Sort by height and success rate for headers
    return teamPlayers
        .sort((a, b) => {
            // First prioritize by height for target players
            if (a.height !== b.height) {
                return b.height - a.height; // Taller players first
            }
            // Then by goals from set pieces
            return b.goalsFromSetPieces - a.goalsFromSetPieces;
        })
        .slice(0, 3); // Return top 3 target players
};