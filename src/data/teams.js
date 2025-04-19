export const teams = [
    {
        id: 1,
        name: "Liverpool",
        league: "Premier League",
        colors: {
            primary: "#C8102E", 
            secondary: "#FFFFFF"
        },
        setPieceStats: {
            corners: {
                total: 187,
                successful: 58,
                successRate: 31.0, // percentage
                goalsScored: 12
            },
            freeKicks: {
                total: 72,
                successful: 19, // resulting in shots on target
                successRate: 26.4,
                goalsScored: 8
            }
        },
        squad: [101, 102, 103, 104, 105, 106] // Updated player IDs
    },
    {
        id: 2,
        name: "Manchester City",
        league: "Premier League",
        colors: {
            primary: "#6CABDD", 
            secondary: "#FFFFFF"
        },
        setPieceStats: {
            corners: {
                total: 195,
                successful: 61,
                successRate: 31.3,
                goalsScored: 13
            },
            freeKicks: {
                total: 68,
                successful: 22,
                successRate: 32.4,
                goalsScored: 7
            }
        },
        squad: [201, 202, 203, 204, 205] // Updated player IDs
    },
    {
        id: 3,
        name: "Arsenal",
        league: "Premier League",
        colors: {
            primary: "#EF0107", 
            secondary: "#FFFFFF"
        },
        setPieceStats: {
            corners: {
                total: 173,
                successful: 53,
                successRate: 30.6,
                goalsScored: 11
            },
            freeKicks: {
                total: 78,
                successful: 20,
                successRate: 25.6,
                goalsScored: 5
            }
        },
        squad: [301, 302, 303, 304, 305] // Updated player IDs
    },
    {
        id: 4,
        name: "Manchester United",
        league: "Premier League",
        colors: {
            primary: "#DA291C", 
            secondary: "#000000"
        },
        setPieceStats: {
            corners: {
                total: 163,
                successful: 42,
                successRate: 25.8,
                goalsScored: 8
            },
            freeKicks: {
                total: 70,
                successful: 21,
                successRate: 30.0,
                goalsScored: 6
            }
        },
        squad: [401, 402, 403, 404, 405] // Updated player IDs
    },
    {
        id: 5,
        name: "Newcastle United",
        league: "Premier League",
        colors: {
            primary: "#241F20", 
            secondary: "#FFFFFF"
        },
        setPieceStats: {
            corners: {
                total: 178,
                successful: 49,
                successRate: 27.5,
                goalsScored: 10
            },
            freeKicks: {
                total: 65,
                successful: 18,
                successRate: 27.7,
                goalsScored: 5
            }
        },
        squad: [501, 502, 503, 504, 505] // Updated player IDs
    },
    {
        id: 6,
        name: "West Ham United",
        league: "Premier League",
        colors: {
            primary: "#7A263A", 
            secondary: "#1BB1E7"
        },
        setPieceStats: {
            corners: {
                total: 159,
                successful: 47,
                successRate: 29.6,
                goalsScored: 12
            },
            freeKicks: {
                total: 63,
                successful: 19,
                successRate: 30.2,
                goalsScored: 7
            }
        },
        squad: [601, 602, 603, 604, 605] // Updated player IDs
    },
    {
        id: 7,
        name: "Bayern Munich",
        league: "Bundesliga",
        colors: {
            primary: "#DC052D", 
            secondary: "#FFFFFF"
        },
        setPieceStats: {
            corners: {
                total: 183,
                successful: 56,
                successRate: 30.6,
                goalsScored: 14
            },
            freeKicks: {
                total: 75,
                successful: 23,
                successRate: 30.7,
                goalsScored: 9
            }
        },
        squad: [701, 702, 703, 704, 705] // Updated player IDs
    }
];