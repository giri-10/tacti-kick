import React from 'react';

const RecommendationPanel = ({ recommendation }) => {
    if (!recommendation) {
        return (
            <div className="recommendation-panel empty-panel">
                <p>Click on the pitch to get set piece recommendations</p>
            </div>
        );
    }
    
    const { type, pitchZone } = recommendation;
    
    return (
        <div className="recommendation-panel">
            <h3>Set Piece Recommendation</h3>
            
            <div className="pitch-position">
                <h4>Pitch Position: {pitchZone || 'Unknown'}</h4>
                {recommendation.analysis && (
                    <div className="recommendation-analysis">
                        {recommendation.analysis}
                    </div>
                )}
            </div>
            
            {type === 'corner' ? (
                <CornerRecommendation recommendation={recommendation} />
            ) : type === 'penalty' ? (
                <PenaltyRecommendation recommendation={recommendation} />
            ) : (
                <FreeKickRecommendation recommendation={recommendation} />
            )}
        </div>
    );
};

// Add new component for penalties
const PenaltyRecommendation = ({ recommendation }) => {
    const { taker, note } = recommendation;
    
    return (
        <div className="penalty-recommendation">
            <div className="recommendation-header">
                <h4>Penalty Kick</h4>
            </div>
            
            <div className="recommendation-section">
                <h5>Recommended Taker</h5>
                <div className="player-card">
                    <div className="player-name">{taker.name}</div>
                    <div className="player-position">{taker.position}</div>
                    <div className="player-stats">
                        <div className="player-stat">
                            <span>Penalty Success Rate:</span>
                            <span>{taker.penaltySuccessRate || "85"}%</span>
                        </div>
                        <div className="player-stat">
                            <span>Foot Preference:</span>
                            <span>{taker.foot || 'Not Specified'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="recommendation-section">
                <h5>Note</h5>
                <div className="approach">Direct Penalty Kick</div>
                <div className="zone-info">
                    <div>{note || 'Execute penalty with confidence and precision'}</div>
                </div>
            </div>
        </div>
    );
};

const CornerRecommendation = ({ recommendation }) => {
    const { taker, alternateTaker, deliveryType, targetZone, targetPlayers, cornerType, ballTrajectory } = recommendation;
    
    return (
        <div className="corner-recommendation">
            <div className="recommendation-header">
                <h4>{cornerType === 'left' ? 'Left' : 'Right'} Corner Kick</h4>
            </div>
            
            <div className="recommendation-section">
                <h5>Recommended Taker</h5>
                <div className="player-card">
                    <div className="player-name">{taker.name}</div>
                    <div className="player-position">{taker.position}</div>
                    <div className="player-stats">
                        <div className="player-stat">
                            <span>Crossing:</span>
                            <span>{taker.crossingAbility}%</span>
                        </div>
                        <div className="player-stat">
                            <span>Corner Success:</span>
                            <span>{taker.setPieceSuccessRate.corners}%</span>
                        </div>
                        <div className="player-stat">
                            <span>Foot Preference:</span>
                            <span>{taker.foot || 'Not Specified'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {alternateTaker && (
                <div className="recommendation-section">
                    <h5>Alternate Taker</h5>
                    <div className="player-card alternate">
                        <div className="player-name">{alternateTaker.name}</div>
                        <div className="player-position">{alternateTaker.position}</div>
                        <div className="player-stats">
                            <div className="player-stat">
                                <span>Foot Preference:</span>
                                <span>{alternateTaker.foot || 'Not Specified'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="recommendation-section">
                <h5>Delivery Type</h5>
                <div className="delivery-type">
                    <div className="delivery-name">{ballTrajectory?.description || deliveryType.name}</div>
                    <div className="delivery-description">
                        {cornerType === 'left' ? 
                            'From left corner flag, aiming toward goal area' : 
                            'From right corner flag, aiming toward goal area'}
                    </div>
                </div>
            </div>
            
            <div className="recommendation-section">
                <h5>Target Zone</h5>
                <div className="target-zone">
                    <div className="zone-name">{targetZone.name}</div>
                    <div className="zone-stats">
                        <div className="zone-stat">
                            <span>Success Rate:</span>
                            <span>{typeof targetZone.successRate === 'object' ? 
                                targetZone.successRate[ballTrajectory?.type.toLowerCase() || 'default']?.toFixed(1) + '%' : 
                                'N/A'}</span>
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
                                <div className="player-position">{player.position}</div>
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
    const { taker, alternateTaker, deliveryType, zone, isDirect, targetPlayers, ballTrajectory } = recommendation;
    
    return (
        <div className="freekick-recommendation">
            <div className="recommendation-header">
                <h4>Free Kick - {zone?.name || 'Standard'}</h4>
                <div className="approach-label">{isDirect ? 'Direct Shot' : 'Crossed Delivery'}</div>
            </div>
            
            <div className="recommendation-section">
                <h5>Recommended Taker</h5>
                <div className="player-card">
                    <div className="player-name">{taker.name}</div>
                    <div className="player-position">{taker.position}</div>
                    <div className="player-stats">
                        <div className="player-stat">
                            <span>Crossing:</span>
                            <span>{taker.crossingAbility}%</span>
                        </div>
                        <div className="player-stat">
                            <span>Free Kick Success:</span>
                            <span>{taker.setPieceSuccessRate.freeKicks}%</span>
                        </div>
                        <div className="player-stat">
                            <span>Foot Preference:</span>
                            <span>{taker.foot || 'Not Specified'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {alternateTaker && (
                <div className="recommendation-section">
                    <h5>Alternate Taker</h5>
                    <div className="player-card alternate">
                        <div className="player-name">{alternateTaker.name}</div>
                        <div className="player-position">{alternateTaker.position}</div>
                        <div className="player-stats">
                            <div className="player-stat">
                                <span>Foot Preference:</span>
                                <span>{alternateTaker.foot || 'Not Specified'}</span>
                            </div>
                            <div className="player-stat">
                                <span>Free Kick Success:</span>
                                <span>{alternateTaker.setPieceSuccessRate.freeKicks}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="recommendation-section">
                <h5>Delivery Type</h5>
                <div className="delivery-type">
                    <div className="delivery-name">{ballTrajectory?.description || deliveryType.name}</div>
                </div>
            </div>
            
            {zone && zone.successRate && (
                <div className="recommendation-section">
                    <h5>Success Rates</h5>
                    <div className="success-rates">
                        {typeof zone.successRate.direct !== 'undefined' && (
                            <div className="success-rate">
                                <span>Direct:</span>
                                <span>{zone.successRate.direct.toFixed(1)}%</span>
                            </div>
                        )}
                        {typeof zone.successRate.crossed !== 'undefined' && (
                            <div className="success-rate">
                                <span>Crossed:</span>
                                <span>{zone.successRate.crossed.toFixed(1)}%</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {!isDirect && targetPlayers && targetPlayers.length > 0 && (
                <div className="recommendation-section">
                    <h5>Target Players</h5>
                    <div className="target-players">
                        {targetPlayers.map(player => (
                            <div key={player.id} className="player-card small">
                                <div className="player-name">{player.name}</div>
                                <div className="player-position">{player.position}</div>
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
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecommendationPanel;