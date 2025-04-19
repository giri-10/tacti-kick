// filepath: c:\Users\Giridharan U\Desktop\tacti-kick\src\services\apiService.js
/**
 * This is a mock API service to provide data for the application
 * In a real implementation, this would connect to a real football API
 */

import { teams } from '../data/teams';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API response structure
const createResponse = (data) => ({
    data: {
        response: data
    }
});

const apiService = {
    teams: {
        getTeams: async () => {
            // Simulate API delay
            await delay(300);
            
            // Transform local team data to match API response format
            const response = teams.map(team => ({
                team: {
                    id: team.id,
                    name: team.name,
                    logo: team.logo,
                    country: team.country,
                    founded: team.founded
                },
                venue: {
                    name: team.venueName,
                    capacity: team.venueCapacity
                }
            }));
            
            return createResponse(response);
        },
        
        getById: async (teamId) => {
            await delay(200);
            
            const team = teams.find(t => t.id === teamId);
            
            if (!team) return createResponse([]);
            
            const response = {
                team: {
                    id: team.id,
                    name: team.name,
                    logo: team.logo,
                    country: team.country,
                    founded: team.founded
                },
                venue: {
                    name: team.venueName,
                    capacity: team.venueCapacity
                }
            };
            
            return createResponse([response]);
        },
        
        getStatistics: async (teamId) => {
            await delay(200);
            
            const team = teams.find(t => t.id === teamId);
            
            if (!team) return createResponse(null);
            
            // Mock statistics
            return createResponse({
                fixtures: {
                    played: {
                        total: 38
                    }
                },
                goals: {
                    for: {
                        total: {
                            total: Math.floor(Math.random() * 30) + 40 // 40-69 goals
                        }
                    }
                }
            });
        }
    },
    
    players: {
        getSquads: async (teamId) => {
            await delay(300);
            
            const team = teams.find(t => t.id === teamId);
            
            if (!team) return createResponse([]);
            
            // Generate mock squad data
            const players = [];
            
            // Generate 20-25 players per team
            const numPlayers = Math.floor(Math.random() * 6) + 20;
            
            for (let i = 0; i < numPlayers; i++) {
                players.push({
                    id: teamId * 100 + i,
                    name: `Player ${i+1}`,
                    position: getRandomPosition(i),
                    number: i + 1
                });
            }
            
            return createResponse([{
                team: {
                    id: team.id,
                    name: team.name
                },
                players
            }]);
        },
        
        getByTeam: async (teamId) => {
            // Fallback if squad doesn't work
            return apiService.players.getSquads(teamId);
        },
        
        getStatistics: async ({ player, team }) => {
            await delay(200);
            
            // Mock player statistics
            return createResponse([{
                player: {
                    id: player,
                    name: `Player ${player % 100}`,
                    firstname: "John",
                    lastname: `Doe ${player % 100}`,
                    age: Math.floor(Math.random() * 15) + 20, // 20-34 years
                    height: `${Math.floor(Math.random() * 25) + 170}`, // 170-194 cm
                    weight: `${Math.floor(Math.random() * 20) + 70}`, // 70-89 kg
                    nationality: "England",
                    birth: {
                        place: Math.random() > 0.5 ? "right" : "left" // Using this as foot preference
                    }
                },
                statistics: [{
                    team: {
                        name: teams.find(t => t.id === team)?.name || "Team"
                    },
                    games: {
                        position: getRandomPosition(player % 100)
                    },
                    passes: {
                        accuracy: Math.floor(Math.random() * 30) + 60 // 60-89%
                    },
                    shots: {
                        total: Math.floor(Math.random() * 40) + 10,
                        on: Math.floor(Math.random() * 30) + 5
                    },
                    goals: {
                        total: Math.floor(Math.random() * 10) + 1,
                        assists: Math.floor(Math.random() * 8) + 1
                    },
                    penalty: {
                        scored: Math.floor(Math.random() * 3),
                        missed: Math.random() > 0.7 ? 1 : 0
                    }
                }]
            }]);
        },
        
        getProfiles: async ({ id }) => {
            await delay(200);
            
            // Similar to getStatistics but for a specific player
            return apiService.players.getStatistics({ player: id, team: Math.floor(id / 100) });
        }
    },
    
    fixtures: {
        getTeamFixtures: async () => {
            await delay(300);
            return createResponse([]);
        },
        
        getEvents: async () => {
            await delay(200);
            return createResponse([]);
        },
        
        getStatistics: async () => {
            await delay(200);
            return createResponse([]);
        },
        
        getLineups: async () => {
            await delay(200);
            return createResponse([]);
        },
        
        getPlayerStats: async () => {
            await delay(200);
            return createResponse([]);
        }
    }
};

// Helper function to generate random positions
function getRandomPosition(index) {
    const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
    
    if (index === 0) return positions[0]; // First player is always goalkeeper
    if (index < 6) return positions[1]; // 2-5 are defenders
    if (index < 14) return positions[2]; // 6-13 are midfielders
    return positions[3]; // Rest are forwards
}

export default apiService;