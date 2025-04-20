import React from 'react';

const RecommendationPanel = ({ recommendation }) => {
    if (!recommendation) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <i className="fas fa-lightbulb"></i> Recommendations
                    </h3>
                </div>
                <div className="empty-panel p-4">
                    <p>Select a location on the pitch to get set piece recommendations</p>
                </div>
            </div>
        );
    }
    
    const { type, taker, alternateTaker, deliveryType, targetPlayers = [], targetZone, zone, analysis } = recommendation;
    
    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <i className="fas fa-lightbulb"></i> Set Piece Strategy
                </h3>
            </div>
            
            <div className="p-4">
                <div className="recommendation-header">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg">
                            {type === 'corner' ? 'Corner Kick' : 
                             type === 'freeKick' && recommendation.isDirect ? 'Direct Free Kick' :
                             type === 'freeKick' ? 'Indirect Free Kick' : 'Penalty Kick'}
                        </h4>
                        <span className="badge bg-primary text-white px-2 py-1 rounded-full text-xs">
                            {zone && zone.name ? zone.name : 
                            targetZone && targetZone.name ? targetZone.name : ''}
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{analysis}</p>
                </div>
                
                <div className="recommendation-section">
                    <h5>Primary Taker</h5>
                    <div className="player-card">
                        <div className="player-name">{taker.name}</div>
                        <div className="player-position text-sm text-gray-600">{taker.position} • {taker.foot}-footed</div>
                        <div className="player-stats mt-2">
                            <div className="player-stat">
                                <span>Corners:</span>
                                <span className="font-semibold">{taker.setPieceSuccessRate.corners}%</span>
                            </div>
                            <div className="player-stat">
                                <span>Free Kicks:</span>
                                <span className="font-semibold">{taker.setPieceSuccessRate.freeKicks}%</span>
                            </div>
                        </div>
                    </div>
                    
                    {alternateTaker && (
                        <div className="mt-2">
                            <h6 className="text-xs text-gray-500 uppercase mb-1">Alternate Taker</h6>
                            <div className="player-card small">
                                <div className="player-name text-sm">{alternateTaker.name}</div>
                                <div className="text-xs text-gray-600">{alternateTaker.foot}-footed • {alternateTaker.setPieceSuccessRate.freeKicks}% success</div>
                            </div>
                        </div>
                    )}
                </div>
                
                {deliveryType && (
                    <div className="recommendation-section">
                        <h5>Recommended Delivery</h5>
                        <div className="delivery-type">
                            <div className="delivery-name">{deliveryType.name}</div>
                            <div className="delivery-description">{deliveryType.description}</div>
                        </div>
                    </div>
                )}
                
                {targetZone && (
                    <div className="recommendation-section">
                        <h5>Target Zone</h5>
                        <div className="target-zone">
                            <div className="zone-name">{targetZone.name}</div>
                            {targetZone.successRate && (
                                <div className="zone-stats mt-2">
                                    {Object.entries(targetZone.successRate).map(([key, value]) => (
                                        <div className="zone-stat" key={key}>
                                            <span>{key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}:</span>
                                            <span className="font-semibold">{value}%</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {targetZone.bestFor && (
                                <div className="zone-info mt-2 text-sm">
                                    Best for players {targetZone.bestFor.heightUnder180cm && <span>under 180cm: {targetZone.bestFor.heightUnder180cm}, </span>}
                                    {targetZone.bestFor.heightOver180cm && <span>over 180cm: {targetZone.bestFor.heightOver180cm}</span>}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {targetPlayers && targetPlayers.length > 0 && (
                    <div className="recommendation-section">
                        <h5>Target Players</h5>
                        {targetPlayers.map((player, index) => (
                            <div className="player-card small mb-2" key={`target-${index}`}>
                                <div className="player-name">{player.name}</div>
                                <div className="text-xs text-gray-600 mb-1">
                                    {player.position} • {player.height}cm
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Goals from set pieces: <strong>{player.goalsFromSetPieces}</strong></span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="recommendation-section mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <h5>Expected Success Rate</h5>
                        <div className="badge bg-success text-white px-2 py-1 rounded-full text-xs">
                            {zone && zone.successRate ? 
                              `${zone.successRate.direct || zone.successRate.crossed || zone.successRate.inSwinger || '?'}%` : 
                              '?%'}
                        </div>
                    </div>
                    
                    <div className="success-rates mt-2">
                        {zone && zone.successRate && (
                            Object.entries(zone.successRate).map(([key, value]) => (
                                <div className="success-rate" key={key}>
                                    <span>{key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}</span>
                                    <span className="font-bold">{value}%</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendationPanel;