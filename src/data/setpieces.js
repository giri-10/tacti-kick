export const setPieces = {
    corners: {
        zones: [
            {
                id: "nearPost",
                name: "Near Post",
                successRate: {
                    inSwinger: 32.5,
                    outSwinger: 28.7,
                    driven: 24.6
                },
                bestFor: {
                    heightUnder180cm: "Driven",
                    heightOver180cm: "InSwinger"
                }
            },
            {
                id: "farPost",
                name: "Far Post",
                successRate: {
                    inSwinger: 29.8,
                    outSwinger: 34.2,
                    driven: 21.3
                },
                bestFor: {
                    heightUnder180cm: "OutSwinger",
                    heightOver180cm: "OutSwinger"
                }
            },
            {
                id: "centerGoal",
                name: "Center of Goal",
                successRate: {
                    inSwinger: 35.7,
                    outSwinger: 27.9,
                    driven: 22.1
                },
                bestFor: {
                    heightUnder180cm: "InSwinger",
                    heightOver180cm: "InSwinger"
                }
            },
            {
                id: "penalty",
                name: "Penalty Spot",
                successRate: {
                    inSwinger: 31.5,
                    outSwinger: 33.8,
                    driven: 25.9
                },
                bestFor: {
                    heightUnder180cm: "OutSwinger",
                    heightOver180cm: "OutSwinger"
                }
            },
            {
                id: "edge",
                name: "Edge of Box",
                successRate: {
                    inSwinger: 18.3,
                    outSwinger: 19.7,
                    driven: 31.2
                },
                bestFor: {
                    heightUnder180cm: "Driven",
                    heightOver180cm: "Driven"
                }
            }
        ],
        deliveryTypes: [
            {
                id: "inSwinger",
                name: "In-swinger",
                description: "A corner that curves inward toward the goal",
                bestTakers: [2, 3, 6, 7, 9] // Player IDs who excel at this delivery type
            },
            {
                id: "outSwinger",
                name: "Out-swinger",
                description: "A corner that curves away from the goal",
                bestTakers: [1, 2, 7, 9, 10]
            },
            {
                id: "driven",
                name: "Driven/Flat",
                description: "A powerful, flat corner delivery",
                bestTakers: [3, 6, 7, 10]
            },
            {
                id: "short",
                name: "Short Corner",
                description: "A short pass to a nearby teammate",
                bestTakers: [1, 3, 6, 9]
            }
        ]
    },
    freeKicks: {
        zones: [
            {
                id: "directRange",
                name: "Direct Shooting Range",
                distanceFromGoal: "18-25 meters",
                successRate: {
                    direct: 9.8, // percentage of direct free kicks resulting in goals
                    crossed: 7.4 // percentage of crossed free kicks resulting in goals
                },
                bestOption: "Direct shot for skilled free kick takers"
            },
            {
                id: "wideCloseRange",
                name: "Wide Close Range",
                distanceFromGoal: "18-30 meters",
                angle: "Wide",
                successRate: {
                    direct: 4.2,
                    crossed: 11.7
                },
                bestOption: "Crossed delivery"
            },
            {
                id: "deepWide",
                name: "Deep Wide Position",
                distanceFromGoal: "30+ meters",
                angle: "Wide",
                successRate: {
                    direct: 1.3,
                    crossed: 8.9
                },
                bestOption: "Crossed delivery targeting tall players"
            },
            {
                id: "deepCentral",
                name: "Deep Central Position",
                distanceFromGoal: "30+ meters",
                angle: "Central",
                successRate: {
                    direct: 3.5,
                    crossed: 7.8
                },
                bestOption: "Crossed delivery or layoff routine"
            }
        ],
        deliveryTypes: [
            {
                id: "direct",
                name: "Direct Shot",
                description: "A direct attempt on goal",
                bestTakers: [3, 4, 6, 7]
            },
            {
                id: "inSwinger",
                name: "In-swinging Cross",
                description: "A cross that curves toward the goal",
                bestTakers: [2, 3, 6, 7, 10]
            },
            {
                id: "outSwinger",
                name: "Out-swinging Cross",
                description: "A cross that curves away from the goal",
                bestTakers: [1, 2, 9, 10]
            },
            {
                id: "drivenLow",
                name: "Driven Low Cross",
                description: "A hard, low cross into the box",
                bestTakers: [1, 2, 3, 9]
            },
            {
                id: "lofted",
                name: "Lofted Cross",
                description: "A high, lofted cross",
                bestTakers: [2, 3, 7, 10]
            }
        ]
    },
    targets: {
        cornerTargets: [
            {
                zone: "nearPost",
                bestTargets: [4, 5, 8] // Player IDs who excel at attacking near post
            },
            {
                zone: "farPost",
                bestTargets: [4, 5, 8]
            },
            {
                zone: "centerGoal",
                bestTargets: [4, 5, 8]
            },
            {
                zone: "penalty",
                bestTargets: [4, 5, 8]
            },
            {
                zone: "edge",
                bestTargets: [1, 3, 6, 9]
            }
        ],
        freeKickTargets: [
            {
                zone: "directRange",
                bestTakers: [3, 6, 7]
            },
            {
                zone: "wideCloseRange",
                bestCrossers: [2, 3, 7, 10],
                bestTargets: [4, 5, 8]
            },
            {
                zone: "deepWide",
                bestCrossers: [2, 3, 7, 10],
                bestTargets: [4, 5, 8]
            },
            {
                zone: "deepCentral",
                bestCrossers: [2, 3, 7, 10],
                bestTargets: [4, 5, 8]
            }
        ]
    }
};