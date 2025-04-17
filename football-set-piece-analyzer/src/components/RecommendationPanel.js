import React from 'react';

const RecommendationPanel = ({ recommendation }) => {
    if (!recommendation) {
        return (
            <div className="recommendation-panel empty-panel">
                <p>Click on the pitch to get set piece recommendations</p>
            </div>
        );
    }
    
    const { type } = recommendation;
    
    return (
        <div className="recommendation-panel">
            <h3>Set Piece Recommendation</h3>
            
            {type === 'corner' ? (
                <CornerRecommendation recommendation={recommendation} />
            ) : (
                <FreeKickRecommendation recommendation={recommendation} />
            )}
        </div>
    );
};

const CornerRecommendation = ({ recommendation }) => {
    const { taker, deliveryType, targetZone, targetPlayers, cornerType } = recommendation;
    
    return (
        <div className="corner-recommendation">
            <div className="recommendation-header">
                <h4>{cornerType === 'left' ? 'Left' : 'Right'} Corner Kick</h4>
            </div>
            
            <div className="recommendation-section">
                <h5>Taker</h5>
                <div className="player-card">
                    <div className="player-name">{taker.name}</div>
                    <div className="player-stats">
                        <div className="player-stat">
                            <span>Crossing:</span>
                            <span>{taker.crossingAbility}%</span>
                        </div>
                        <div className="player-stat">
                            <span>Corner Success:</span>
                            <span>{taker.setPieceSuccessRate.corners}%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="recommendation-section">
                <h5>Delivery Type</h5>
                <div className="delivery-type">
                    <div className="delivery-name">{deliveryType.name}</div>
                    <div className="delivery-description">{deliveryType.description}</div>
                </div>
            </div>
            
            <div className="recommendation-section">
                <h5>Target Zone</h5>
                <div className="target-zone">
                    <div className="zone-name">{targetZone.name}</div>
                    <div className="zone-stats">
                        <div className="zone-stat">
                            <span>Success Rate:</span>
                            <span>{targetZone.successRate[deliveryType.id.toLowerCase()].toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="recommendation-section">
                <h5>Target Players</h5>
                <div className="target-players">
                    {targetPlayers.length > 0 ? (
                        targetPlayers.map(player => (
                            <div key={player.id} className="player-card small">
                                <div className="player-name">{player.name}</div>
                                <div className="player-stats">
                                    <div className="player-stat">
                                        <span>Height:</span>
                                        <span>{player.height} cm</span>
                                    </div>
                                    <div className="player-stat">
                                        <span>Goals from Set Pieces:</span>
                                        <span>{player.goalsFromSetPieces}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No specific target players for this team and zone.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const FreeKickRecommendation = ({ recommendation }) => {
    const { taker, deliveryType, zone, isDirect, targetPlayers } = recommendation;
    
    return (
        <div className="freekick-recommendation">
            <div className="recommendation-header">
                <h4>Free Kick - {zone.name}</h4>
            </div>
            
            <div className="recommendation-section">
                <h5>Recommended Approach</h5>
                <div className="approach">
                    {isDirect ? 'Direct Shot on Goal' : 'Crossed Delivery'}
                </div>
                <div className="zone-info">
                    <div>{zone.distanceFromGoal && `Distance: ${zone.distanceFromGoal}`}</div>
                    <div>{zone.angle && `Position: ${zone.angle}`}</div>
                    <div>{zone.bestOption && `Recommendation: ${zone.bestOption}`}</div>
                </div>
            </div>
            
            <div className="recommendation-section">
                <h5>Taker</h5>
                <div className="player-card">
                    <div className="player-name">{taker.name}</div>
                    <div className="player-stats">
                        <div className="player-stat">
                            <span>Crossing:</span>
                            <span>{taker.crossingAbility}%</span>
                        </div>
                        <div className="player-stat">
                            <span>Free Kick Success:</span>
                            <span>{taker.setPieceSuccessRate.freeKicks}%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="recommendation-section">
                <h5>Delivery Type</h5>
                <div className="delivery-type">
                    <div className="delivery-name">{deliveryType.name}</div>
                    <div className="delivery-description">{deliveryType.description}</div>
                </div>
            </div>
            
            {!isDirect && (
                <div className="recommendation-section">
                    <h5>Target Players</h5>
                    <div className="target-players">
                        {targetPlayers.length > 0 ? (
                            targetPlayers.map(player => (
                                <div key={player.id} className="player-card small">
                                    <div className="player-name">{player.name}</div>
                                    <div className="player-stats">
                                        <div className="player-stat">
                                            <span>Height:</span>
                                            <span>{player.height} cm</span>
                                        </div>
                                        <div className="player-stat">
                                            <span>Goals from Set Pieces:</span>
                                            <span>{player.goalsFromSetPieces}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No specific target players for this team and zone.</p>
                        )}
                    </div>
                </div>
            )}
            
            <div className="recommendation-section">
                <h5>Success Rates</h5>
                <div className="success-rates">
                    <div className="success-rate">
                        <span>Direct:</span>
                        <span>{zone.successRate.direct.toFixed(1)}%</span>
                    </div>
                    <div className="success-rate">
                        <span>Crossed:</span>
                        <span>{zone.successRate.crossed.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendationPanel;