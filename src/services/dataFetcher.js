import config from '../config/config';
import apiService from './apiService';
import { setPieces } from '../data/setpieces';
import { players as realPlayersData } from '../data/players'; // Import the real players data

// In-memory cache for API data
let teamsCache = [];
let playersCache = {};
let fixturesCache = {};
let statisticsCache = {};

/**
 * Get all teams from a league
 */
export const getTeams = async (leagueId = config.defaultLeagueId, season = config.defaultSeason) => {
    if (teamsCache.length === 0) {
        try {
            const response = await apiService.teams.getTeams({
                league: leagueId,
                season: season
            });
            
            if (response.data && response.data.response) {
                teamsCache = response.data.response.map(item => ({
                    id: item.team.id,
                    name: item.team.name,
                    logo: item.team.logo,
                    country: item.team.country,
                    founded: item.team.founded,
                    venueName: item.venue ? item.venue.name : null,
                    venueCapacity: item.venue ? item.venue.capacity : null,
                    colors: {
                        primary: "#000000", // Default - we'll fetch team colors from statistics
                        secondary: "#FFFFFF"
                    },
                    setPieceStats: null,  // Will be populated from statistics
                    squad: []
                }));
                
                // For each team, get additional set piece statistics
                for (const team of teamsCache) {
                    const stats = await getTeamStatistics(team.id, leagueId, season);
                    team.setPieceStats = stats.setPieceStats;
                }
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
            return [];
        }
    }
    return teamsCache;
};

/**
 * Get a specific team by ID
 */
export const getTeamById = async (teamId) => {
    try {
        // Check if team is already in cache
        if (teamsCache.length > 0) {
            const cachedTeam = teamsCache.find(team => team.id === teamId);
            if (cachedTeam) return cachedTeam;
        }
        
        // If not in cache, fetch directly
        const response = await apiService.teams.getById(teamId);
        
        if (response.data && response.data.response && response.data.response.length > 0) {
            const teamData = response.data.response[0];
            return {
                id: teamData.team.id,
                name: teamData.team.name,
                logo: teamData.team.logo,
                country: teamData.team.country,
                founded: teamData.team.founded,
                venueName: teamData.venue ? teamData.venue.name : null,
                venueCapacity: teamData.venue ? teamData.venue.capacity : null,
                colors: {
                    primary: "#000000", // Default
                    secondary: "#FFFFFF"
                },
                setPieceStats: await getTeamSetPieceStats(teamId),
                squad: []
            };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching team ${teamId}:`, error);
        return null;
    }
};

/**
 * Get players for a specific team
 */
export const getPlayersByTeamId = async (teamId) => {
    if (!playersCache[teamId]) {
        try {
            // Use real player data from players.js file instead of API call
            const teamPlayers = realPlayersData.filter(player => {
                // Match players by team ID from squad array in teams.js
                // or by matching the team name in player data
                const squadIds = teamsCache.find(t => t.id === teamId)?.squad || [];
                return squadIds.includes(player.id) || 
                       (player.team && player.team.includes(teamsCache.find(t => t.id === teamId)?.name || ''));
            });
            
            if (teamPlayers.length > 0) {
                playersCache[teamId] = teamPlayers;
                return teamPlayers;
            }
            
            // Fallback to API if no matching players in real data
            let response = await apiService.players.getSquads(teamId);
            
            if (response.data && response.data.response && response.data.response.length > 0) {
                // Squad data contains current team players
                const squadData = response.data.response[0].players;
                
                // But we need detailed player stats, so get those separately
                const playerDetailsPromises = squadData.map(async (squadPlayer) => {
                    // Get detailed player statistics including set piece performance
                    const playerStatsResponse = await apiService.players.getStatistics({
                        player: squadPlayer.id,
                        team: teamId,
                        season: config.defaultSeason
                    });
                    
                    if (playerStatsResponse.data && 
                        playerStatsResponse.data.response && 
                        playerStatsResponse.data.response.length > 0) {
                        
                        const playerData = playerStatsResponse.data.response[0];
                        const player = playerData.player;
                        const statistics = playerData.statistics[0] || {};
                        
                        // Extract position from statistics
                        const position = statistics.games ? statistics.games.position : 'Unknown';
                        
                        // Build player object with essential data for set pieces
                        return {
                            id: player.id,
                            name: player.name,
                            firstName: player.firstname,
                            lastName: player.lastname,
                            age: player.age,
                            height: player.height ? parseInt(player.height) : generateHeight(position),
                            weight: player.weight,
                            nationality: player.nationality,
                            team: statistics.team ? statistics.team.name : '',
                            position,
                            foot: player.birth && player.birth.place ? player.birth.place : (Math.random() > 0.5 ? 'right' : 'left'),
                            
                            // Extract relevant set piece stats
                            crossingAbility: extractCrossingAbility(statistics),
                            setPieceSuccessRate: extractSetPieceSuccess(statistics),
                            goalsFromSetPieces: extractGoalsFromSetPieces(statistics),
                            assistsFromSetPieces: extractAssistsFromSetPieces(statistics),
                            penaltySuccessRate: extractPenaltySuccessRate(statistics),
                            roleRecommendations: generateRoleRecommendations(position, player.height ? parseInt(player.height) : 180),
                            zoneEffectiveness: generateZoneEffectiveness()
                        };
                    }
                    
                    // Fallback if detailed stats can't be retrieved
                    return {
                        id: squadPlayer.id,
                        name: squadPlayer.name,
                        position: squadPlayer.position,
                        height: generateHeight(squadPlayer.position),
                        foot: Math.random() > 0.5 ? 'right' : 'left',
                        crossingAbility: generateCrossingAbility(squadPlayer.position),
                        setPieceSuccessRate: generateSetPieceSuccessRate(squadPlayer.position),
                        goalsFromSetPieces: generateGoalsFromSetPieces(squadPlayer.position),
                        assistsFromSetPieces: generateAssistsFromSetPieces(squadPlayer.position),
                        penaltySuccessRate: generatePenaltySuccessRate(squadPlayer.position),
                        roleRecommendations: generateRoleRecommendations(squadPlayer.position, 180),
                        zoneEffectiveness: generateZoneEffectiveness()
                    };
                });
                
                // Wait for all player details to be fetched
                const players = await Promise.all(playerDetailsPromises);
                playersCache[teamId] = players;
                
                // Add player IDs to team squad
                const teamIndex = teamsCache.findIndex(team => team.id === teamId);
                if (teamIndex >= 0) {
                    teamsCache[teamIndex].squad = players.map(player => player.id);
                }
                
                return players;
            }
            
            // Fallback to old players endpoint if squad doesn't work
            response = await apiService.players.getByTeam(teamId, config.defaultSeason);
            
            if (response.data && response.data.response) {
                const playersData = response.data.response;
                const players = playersData.map(item => {
                    const player = item.player;
                    const statistics = item.statistics[0] || {};
                    
                    // Extract position from statistics
                    const position = statistics.games ? statistics.games.position : 'Unknown';
                    
                    // Build player object with essential data for set pieces
                    return {
                        id: player.id,
                        name: player.name,
                        firstName: player.firstname,
                        lastName: player.lastname,
                        age: player.age,
                        height: player.height ? parseInt(player.height) : generateHeight(position),
                        weight: player.weight,
                        nationality: player.nationality,
                        team: statistics.team ? statistics.team.name : '',
                        position,
                        foot: player.birth && player.birth.place ? player.birth.place : (Math.random() > 0.5 ? 'right' : 'left'),
                        
                        // Extract relevant set piece stats or generate them
                        crossingAbility: extractCrossingAbility(statistics),
                        setPieceSuccessRate: extractSetPieceSuccess(statistics),
                        goalsFromSetPieces: extractGoalsFromSetPieces(statistics),
                        assistsFromSetPieces: extractAssistsFromSetPieces(statistics),
                        penaltySuccessRate: extractPenaltySuccessRate(statistics),
                        roleRecommendations: generateRoleRecommendations(position, player.height ? parseInt(player.height) : 180),
                        zoneEffectiveness: generateZoneEffectiveness()
                    };
                });
                
                playersCache[teamId] = players;
                
                // Add player IDs to team squad
                const teamIndex = teamsCache.findIndex(team => team.id === teamId);
                if (teamIndex >= 0) {
                    teamsCache[teamIndex].squad = players.map(player => player.id);
                }
            }
        } catch (error) {
            console.error(`Error fetching players for team ${teamId}:`, error);
            playersCache[teamId] = [];
        }
    }
    return playersCache[teamId] || [];
};

/**
 * Extract crossing ability from player statistics
 */
const extractCrossingAbility = (statistics) => {
    // Try to extract actual crossing stats if available
    if (statistics && statistics.passes && statistics.passes.accuracy) {
        // Base on pass accuracy and type of position
        const passAccuracy = statistics.passes.accuracy || 0;
        const position = statistics.games ? statistics.games.position : 'Unknown';
        
        // Add a bonus for midfielders and wingbacks who typically cross more
        let positionBonus = 0;
        if (position === 'Midfielder') positionBonus = 10;
        if (position === 'Defender' && (statistics.games.position === 'Defender' || statistics.games.position.includes('back'))) {
            positionBonus = 8;
        }
        
        // Calculate crossing ability - capped between 60-95
        return Math.min(95, Math.max(60, Math.round(passAccuracy + positionBonus)));
    }
    
    // Fallback to generated crossing ability
    return generateCrossingAbility(statistics.games ? statistics.games.position : 'Unknown');
};

/**
 * Extract set piece success rates from player statistics
 */
const extractSetPieceSuccess = (statistics) => {
    // This is challenging as APIs don't explicitly provide set piece success rates
    // So we'll need to approximate from available stats
    
    // Default to generated values
    const defaultRates = generateSetPieceSuccessRate(
        statistics.games ? statistics.games.position : 'Unknown'
    );
    
    // Try to improve estimates if we have pass and shot data
    if (statistics) {
        // Corners could be estimated from accurate passes
        if (statistics.passes && statistics.passes.accuracy) {
            // Adjust corner success rate based on pass accuracy
            const passAccuracy = statistics.passes.accuracy || 0;
            defaultRates.corners = Math.min(95, Math.max(50, Math.round(passAccuracy + 5)));
        }
        
        // Free kicks could be estimated from shots on target percentage
        if (statistics.shots && statistics.shots.on !== undefined && statistics.shots.total > 0) {
            const shotAccuracy = (statistics.shots.on / statistics.shots.total) * 100;
            defaultRates.freeKicks = Math.min(95, Math.max(50, Math.round(shotAccuracy + 15)));
        }
    }
    
    return defaultRates;
};

/**
 * Extract goals from set pieces from player statistics
 */
const extractGoalsFromSetPieces = (statistics) => {
    // APIs rarely directly provide goals from set pieces
    // We'll estimate based on total goals
    
    if (statistics && statistics.goals && statistics.goals.total) {
        // Estimate that approximately 25-30% of goals come from set pieces
        const totalGoals = statistics.goals.total || 0;
        return Math.max(0, Math.round(totalGoals * (0.25 + Math.random() * 0.05)));
    }
    
    // Fallback to generated data
    return generateGoalsFromSetPieces(statistics.games ? statistics.games.position : 'Unknown');
};

/**
 * Extract assists from set pieces from player statistics
 */
const extractAssistsFromSetPieces = (statistics) => {
    // APIs rarely directly provide assists from set pieces
    // We'll estimate based on total assists
    
    if (statistics && statistics.goals && statistics.goals.assists) {
        // Estimate that approximately 30-35% of assists come from set pieces
        const totalAssists = statistics.goals.assists || 0;
        return Math.max(0, Math.round(totalAssists * (0.3 + Math.random() * 0.05)));
    }
    
    // Fallback to generated data
    return generateAssistsFromSetPieces(statistics.games ? statistics.games.position : 'Unknown');
};

/**
 * Extract penalty success rate from player statistics
 */
const extractPenaltySuccessRate = (statistics) => {
    // Penalty stats are often available in APIs
    
    if (statistics && statistics.penalty) {
        const scored = statistics.penalty.scored || 0;
        const missed = statistics.penalty.missed || 0;
        
        // Calculate success rate if player has taken penalties
        if (scored + missed > 0) {
            return Math.round((scored / (scored + missed)) * 100);
        }
    }
    
    // Fallback to generated data
    return generatePenaltySuccessRate(statistics.games ? statistics.games.position : 'Unknown');
};

/**
 * Get team statistics including set piece data
 */
export const getTeamStatistics = async (teamId, leagueId = config.defaultLeagueId, season = config.defaultSeason) => {
    const cacheKey = `${teamId}-${leagueId}-${season}`;
    
    if (!statisticsCache[cacheKey]) {
        try {
            const response = await apiService.teams.getStatistics(teamId, leagueId, season);
            
            if (response.data && response.data.response) {
                const stats = response.data.response;
                
                // Extract and process statistics relevant for set pieces
                statisticsCache[cacheKey] = {
                    fixtures: stats.fixtures,
                    goals: stats.goals,
                    lineups: stats.lineups,
                    
                    // Generate set piece statistics based on available data
                    setPieceStats: generateTeamSetPieceStats(stats)
                };
            }
        } catch (error) {
            console.error(`Error fetching statistics for team ${teamId}:`, error);
            statisticsCache[cacheKey] = { setPieceStats: generateSetPieceStats() };
        }
    }
    
    return statisticsCache[cacheKey] || { setPieceStats: generateSetPieceStats() };
};

/**
 * Get team-specific set piece statistics 
 * This combines both real API data and generated data
 */
export const getTeamSetPieceStats = async (teamId) => {
    try {
        const stats = await getTeamStatistics(teamId);
        return stats.setPieceStats;
    } catch (error) {
        console.error(`Error getting set piece stats for team ${teamId}:`, error);
        return generateSetPieceStats();
    }
};

/**
 * Generate team set piece statistics based on overall stats
 */
const generateTeamSetPieceStats = (teamStats) => {
    // Base stats
    const setPieceStats = generateSetPieceStats();
    
    // If we have real team stats, use them to make our generated data more realistic
    if (teamStats && teamStats.goals) {
        // Estimate set piece goals as 30% of total
        const totalGoals = teamStats.goals.for.total.total || 0;
        const estimatedSetPieceGoals = Math.floor(totalGoals * 0.3);
        
        // Distribute among corners and free kicks
        setPieceStats.corners.goalsScored = Math.floor(estimatedSetPieceGoals * 0.6);
        setPieceStats.freeKicks.goalsScored = Math.floor(estimatedSetPieceGoals * 0.4);
        
        // Estimate total corners and free kicks
        setPieceStats.corners.total = Math.floor(teamStats.fixtures.played.total * 5); // ~5 corners per game
        setPieceStats.freeKicks.total = Math.floor(teamStats.fixtures.played.total * 3); // ~3 free kicks per game
        
        // Calculate success rates and successful attempts
        setPieceStats.corners.successRate = Math.floor(Math.random() * 10) + 25;
        setPieceStats.corners.successful = Math.floor(setPieceStats.corners.total * (setPieceStats.corners.successRate / 100));
        
        setPieceStats.freeKicks.successRate = Math.floor(Math.random() * 10) + 25;
        setPieceStats.freeKicks.successful = Math.floor(setPieceStats.freeKicks.total * (setPieceStats.freeKicks.successRate / 100));
    }
    
    return setPieceStats;
};

/**
 * Get fixtures for a team to analyze set pieces
 */
export const getTeamFixtures = async (teamId, last = 10) => {
    const cacheKey = `fixtures-${teamId}-${last}`;
    
    if (!fixturesCache[cacheKey]) {
        try {
            const response = await apiService.fixtures.getTeamFixtures(teamId, {
                last: last,
                status: 'FT' // Only completed fixtures
            });
            
            if (response.data && response.data.response) {
                fixturesCache[cacheKey] = response.data.response;
            }
        } catch (error) {
            console.error(`Error fetching fixtures for team ${teamId}:`, error);
            fixturesCache[cacheKey] = [];
        }
    }
    
    return fixturesCache[cacheKey] || [];
};

/**
 * Get fixture events - useful for analyzing set pieces
 */
export const getFixtureEvents = async (fixtureId) => {
    try {
        const response = await apiService.fixtures.getEvents(fixtureId);
        
        if (response.data && response.data.response) {
            // Filter for set piece events (goals from corners, free kicks)
            return response.data.response.filter(event => {
                return event.type === 'Goal' && 
                       (event.detail === 'Free Kick' || 
                        event.detail === 'Corner' || 
                        event.detail === 'Penalty');
            });
        }
        
        return [];
    } catch (error) {
        console.error(`Error fetching events for fixture ${fixtureId}:`, error);
        return [];
    }
};

/**
 * Analyze set piece performance for a team
 */
export const analyzeTeamSetPieces = async (teamId, last = 10) => {
    try {
        // Get recent fixtures
        const fixtures = await getTeamFixtures(teamId, last);
        
        // Variables to track set piece stats
        let corners = { total: 0, successful: 0, goals: 0 };
        let freeKicks = { total: 0, successful: 0, goals: 0 };
        let penalties = { total: 0, successful: 0 };
        
        // Analyze each fixture
        for (const fixture of fixtures) {
            // Get events for this fixture
            const events = await getFixtureEvents(fixture.fixture.id);
            
            // Count set piece events
            events.forEach(event => {
                // Only count events for the team we're analyzing
                if (event.team.id !== teamId) return;
                
                if (event.detail === 'Corner') {
                    if (event.type === 'Goal') {
                        corners.goals++;
                        corners.successful++;
                    }
                    corners.total++;
                }
                else if (event.detail === 'Free Kick') {
                    if (event.type === 'Goal') {
                        freeKicks.goals++;
                        freeKicks.successful++;
                    }
                    freeKicks.total++;
                }
                else if (event.detail === 'Penalty') {
                    if (event.type === 'Goal') {
                        penalties.successful++;
                    }
                    penalties.total++;
                }
            });
            
            // Additional analysis: get fixture statistics to find total corners
            try {
                const statsResponse = await apiService.fixtures.getStatistics(fixture.fixture.id);
                if (statsResponse.data && statsResponse.data.response) {
                    // Find team's statistics
                    const teamStats = statsResponse.data.response.find(stat => stat.team.id === teamId);
                    if (teamStats && teamStats.statistics) {
                        // Extract corner stats
                        const cornerStat = teamStats.statistics.find(stat => stat.type === 'Corner Kicks');
                        if (cornerStat && cornerStat.value) {
                            // Add to total corners (may include ones not resulting in goals)
                            const fixtureCorners = parseInt(cornerStat.value) || 0;
                            corners.total += fixtureCorners;
                        }
                    }
                }
            } catch (error) {
                // Non-critical error, just log it
                console.warn(`Could not get stats for fixture ${fixture.fixture.id}:`, error);
            }
        }
        
        // Calculate success rates
        corners.successRate = corners.total ? Math.floor((corners.successful / corners.total) * 100) : 0;
        freeKicks.successRate = freeKicks.total ? Math.floor((freeKicks.successful / freeKicks.total) * 100) : 0;
        penalties.successRate = penalties.total ? Math.floor((penalties.successful / penalties.total) * 100) : 0;
        
        return {
            corners,
            freeKicks,
            penalties,
            fixtures: fixtures.length
        };
    } catch (error) {
        console.error(`Error analyzing set pieces for team ${teamId}:`, error);
        return {
            corners: { total: 0, successful: 0, goals: 0, successRate: 0 },
            freeKicks: { total: 0, successful: 0, goals: 0, successRate: 0 },
            penalties: { total: 0, successful: 0, successRate: 0 },
            fixtures: 0
        };
    }
};

/**
 * Get detailed team analysis for a specific fixture
 */
export const getFixtureAnalysis = async (fixtureId) => {
    try {
        // Get events
        const events = await apiService.fixtures.getEvents(fixtureId);
        
        // Get statistics
        const statistics = await apiService.fixtures.getStatistics(fixtureId);
        
        // Get lineups
        const lineups = await apiService.fixtures.getLineups(fixtureId);
        
        // Get player statistics
        const playerStats = await apiService.fixtures.getPlayerStats(fixtureId);
        
        // Combine all data into a comprehensive fixture analysis
        return {
            events: events.data?.response || [],
            statistics: statistics.data?.response || [],
            lineups: lineups.data?.response || [],
            playerStats: playerStats.data?.response || [],
            setpieces: extractSetPiecesFromFixture(
                events.data?.response || [], 
                statistics.data?.response || []
            )
        };
    } catch (error) {
        console.error(`Error analyzing fixture ${fixtureId}:`, error);
        return {
            events: [],
            statistics: [],
            lineups: [],
            playerStats: [],
            setpieces: { corners: [], freeKicks: [], penalties: [] }
        };
    }
};

/**
 * Extract set piece events from a fixture's data
 */
const extractSetPiecesFromFixture = (events, statistics) => {
    // Filter events by type
    const corners = events.filter(event => event.detail === 'Corner');
    const freeKicks = events.filter(event => event.detail === 'Free Kick');
    const penalties = events.filter(event => event.detail === 'Penalty');
    
    return {
        corners,
        freeKicks,
        penalties
    };
};

// Get all set piece data (combines API data with static data)
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

// Get a specific player by ID
export const getPlayerById = async (playerId) => {
    try {
        // Check cached players first
        for (const teamId in playersCache) {
            const player = playersCache[teamId].find(p => p.id === playerId);
            if (player) return player;
        }
        
        // If not in cache, fetch directly
        const response = await apiService.players.getProfiles({ id: playerId });
        
        if (response.data && response.data.response && response.data.response.length > 0) {
            const playerData = response.data.response[0];
            const player = playerData.player;
            const statistics = playerData.statistics[0] || {};
            const position = statistics.games ? statistics.games.position : 'Unknown';
            
            return {
                id: player.id,
                name: player.name,
                firstName: player.firstname,
                lastName: player.lastname,
                age: player.age,
                height: player.height ? parseInt(player.height) : generateHeight(position),
                weight: player.weight,
                nationality: player.nationality,
                team: statistics.team ? statistics.team.name : '',
                position,
                foot: player.birth && player.birth.place ? player.birth.place : (Math.random() > 0.5 ? 'right' : 'left'),
                
                // Generated stats
                crossingAbility: extractCrossingAbility(statistics),
                setPieceSuccessRate: extractSetPieceSuccess(statistics),
                goalsFromSetPieces: extractGoalsFromSetPieces(statistics),
                assistsFromSetPieces: extractAssistsFromSetPieces(statistics),
                penaltySuccessRate: extractPenaltySuccessRate(statistics),
                roleRecommendations: generateRoleRecommendations(position, player.height ? parseInt(player.height) : 180),
                zoneEffectiveness: generateZoneEffectiveness()
            };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching player ${playerId}:`, error);
        return null;
    }
};

// Get best set piece taker for a specific team
export const getBestSetPieceTaker = async (teamId, setPieceType) => {
    const teamPlayers = await getPlayersByTeamId(teamId);
    if (!teamPlayers.length) return null;

    return teamPlayers.reduce((best, player) => {
        if (!best || player.setPieceSuccessRate[setPieceType] > best.setPieceSuccessRate[setPieceType]) {
            return player;
        }
        return best;
    }, null);
};

// Get best target players for set pieces
export const getBestTargetPlayers = async (teamId, zone, setPieceType) => {
    const teamPlayers = await getPlayersByTeamId(teamId);
    if (!teamPlayers.length) return [];

    // Sort by height and goals from set pieces
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

// Get tallest player in a team (for fallback target selection)
export const getTallestPlayer = async (teamId) => {
    const teamPlayers = await getPlayersByTeamId(teamId);
    if (!teamPlayers.length) return null;
    
    return teamPlayers.reduce((tallest, player) => {
        return (!tallest || player.height > tallest.height) ? player : tallest;
    }, null);
};

// Get best player by foot preference
export const getBestPlayerByFoot = async (teamId, preferredFoot) => {
    const teamPlayers = await getPlayersByTeamId(teamId);
    if (!teamPlayers.length) return null;
    
    const matchingFootPlayers = teamPlayers.filter(player => player.foot === preferredFoot);
    
    if (matchingFootPlayers.length === 0) return null;
    
    return matchingFootPlayers.reduce((best, player) => {
        if (!best || player.setPieceSuccessRate.freeKicks > best.setPieceSuccessRate.freeKicks) {
            return player;
        }
        return best;
    }, matchingFootPlayers[0]);
};

/**
 * Get league standings for correlating set piece effectiveness
 */
export const getLeagueStandings = async (leagueId = config.defaultLeagueId, season = config.defaultSeason) => {
    try {
        const response = await apiClient.get('/standings', {
            params: {
                league: leagueId,
                season: season
            }
        });
        
        if (response.data && response.data.response && response.data.response.length > 0) {
            return response.data.response[0].league.standings[0]; // First league, first standings group
        }
        
        return [];
    } catch (error) {
        console.error(`Error fetching standings for league ${leagueId}:`, error);
        return [];
    }
};

/**
 * Correlate set piece effectiveness with team standings
 */
export const correlateSetPiecesWithStandings = async (leagueId = config.defaultLeagueId, season = config.defaultSeason) => {
    try {
        // Get league standings
        const standings = await getLeagueStandings(leagueId, season);
        
        // Get teams in the league
        const teams = await getTeams(leagueId, season);
        
        // Create correlation data
        const correlationData = [];
        
        for (const standing of standings) {
            const teamId = standing.team.id;
            
            // Get team's set piece stats
            const setPieceStats = await analyzeTeamSetPieces(teamId);
            
            correlationData.push({
                team: standing.team,
                standing: {
                    rank: standing.rank,
                    points: standing.points,
                    goalsFor: standing.all.goals.for,
                    goalsAgainst: standing.all.goals.against,
                },
                setPieceStats
            });
        }
        
        return correlationData;
    } catch (error) {
        console.error(`Error correlating set pieces with standings:`, error);
        return [];
    }
};

// Helper generator functions - kept from your original code
const generateHeight = (position) => {
    if (position === 'Goalkeeper' || position === 'Defender') {
        return Math.floor(Math.random() * 10) + 185; // 185-194cm
    } else if (position === 'Midfielder') {
        return Math.floor(Math.random() * 10) + 175; // 175-184cm
    } else {
        return Math.floor(Math.random() * 15) + 170; // 170-184cm
    }
};

const generateCrossingAbility = (position) => {
    const baseCrossing = () => Math.floor(Math.random() * 20) + 60; // 60-79 base
    
    if (position === 'Defender' || position === 'Forward') {
        return baseCrossing() + 15; // 75-94 for backs and wingers
    } else if (position === 'Midfielder') {
        return baseCrossing() + 10; // 70-89 for midfielders
    } else {
        return baseCrossing(); // 60-79 for others
    }
};

const generateSetPieceSuccessRate = (position) => {
    const isSpecialist = Math.random() > 0.7;
    const baseRate = () => Math.floor(Math.random() * 30) + 50; // 50-79 base
    
    if (isSpecialist) {
        return {
            corners: baseRate() + 15, // 65-94 for specialists
            freeKicks: baseRate() + 15
        };
    } else {
        return {
            corners: baseRate(),
            freeKicks: baseRate()
        };
    }
};

const generateGoalsFromSetPieces = (position) => {
    if (position === 'Forward') {
        return Math.floor(Math.random() * 8) + 5; // 5-12 for strikers
    } else if (position === 'Defender') {
        return Math.floor(Math.random() * 4) + 1; // 1-4 for defenders
    } else {
        return Math.floor(Math.random() * 5) + 1; // 1-5 for others
    }
};

const generateAssistsFromSetPieces = (position) => {
    if (position === 'Defender' || position === 'Forward') {
        return Math.floor(Math.random() * 7) + 5; // 5-11 for backs and wingers
    } else if (position === 'Midfielder') {
        return Math.floor(Math.random() * 6) + 4; // 4-9 for midfielders
    } else {
        return Math.floor(Math.random() * 3); // 0-2 for others
    }
};

const generateSetPieceStats = () => {
    const cornersTotal = Math.floor(Math.random() * 40) + 150; // 150-189
    const cornerSuccessRate = Math.floor(Math.random() * 10) + 25; // 25-34%
    const cornersSuccessful = Math.floor(cornersTotal * (cornerSuccessRate / 100));
    
    const freeKicksTotal = Math.floor(Math.random() * 20) + 60; // 60-79
    const freeKickSuccessRate = Math.floor(Math.random() * 10) + 25; // 25-34%
    const freeKicksSuccessful = Math.floor(freeKicksTotal * (freeKickSuccessRate / 100));
    
    return {
        corners: {
            total: cornersTotal,
            successful: cornersSuccessful,
            successRate: cornerSuccessRate,
            goalsScored: Math.floor(cornersSuccessful / 5) // Roughly 20% of successful corners lead to goals
        },
        freeKicks: {
            total: freeKicksTotal,
            successful: freeKicksSuccessful,
            successRate: freeKickSuccessRate,
            goalsScored: Math.floor(freeKicksSuccessful / 3) // Roughly 33% of successful free kicks lead to goals
        }
    };
};

const generatePenaltySuccessRate = (position) => {
    // Base rate for all players
    const baseRate = Math.floor(Math.random() * 10) + 70; // 70-79%
    
    // Adjust based on position
    if (position === 'Forward') {
        return Math.min(baseRate + 15, 98); // 85-94% for forwards, max 98%
    } else if (position === 'Midfielder') {
        return Math.min(baseRate + 10, 95); // 80-89% for midfielders, max 95%
    } else if (position === 'Defender' || position === 'Goalkeeper') {
        return Math.min(baseRate - 5, 85); // 65-74% for defenders, max 85%
    }
    
    return baseRate;
};

const generateRoleRecommendations = (position, height) => {
    const roles = [];
    
    // Corner roles
    if (position === 'Defender' && height > 185) {
        roles.push('corner-target');
    }
    if (position === 'Midfielder' || position === 'Forward') {
        roles.push('corner-near-post-runner');
    }
    if ((position === 'Defender' || position === 'Midfielder') && height > 180) {
        roles.push('corner-far-post-target');
    }
    if (position === 'Midfielder' || position === 'Forward') {
        roles.push('corner-taker');
    }
    
    // Free kick roles
    if (position === 'Forward' || position === 'Midfielder') {
        roles.push('direct-free-kick-taker');
    }
    if (position === 'Defender' && height > 185) {
        roles.push('free-kick-wall-target');
    }
    if (position === 'Midfielder') {
        roles.push('indirect-free-kick-taker');
    }
    
    // Throw-in roles
    if (position === 'Defender') {
        roles.push('long-throw-specialist');
    }
    
    // Ensure we have at least one role
    if (roles.length === 0) {
        roles.push('support');
    }
    
    return roles;
};

const generateZoneEffectiveness = () => {
    // Define zones on the pitch
    const zones = {
        'near-post': Math.floor(Math.random() * 40) + 40, // 40-79%
        'far-post': Math.floor(Math.random() * 40) + 40, // 40-79%
        'penalty-spot': Math.floor(Math.random() * 40) + 40, // 40-79%
        'edge-of-box': Math.floor(Math.random() * 40) + 30, // 30-69%
        'six-yard-box': Math.floor(Math.random() * 40) + 50 // 50-89%
    };
    
    return zones;
};