import os
import pandas as pd
import numpy as np
from statsbombpy import sb
from typing import Dict, List, Tuple
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SetPieceDataCollector:
    def __init__(self):
        """Initialize the data collector for set pieces."""
        self.competitions = None
        self.matches = None
        self.events = None
        
    def fetch_competitions(self) -> None:
        """Fetch available competitions from StatsBomb."""
        try:
            self.competitions = sb.competitions()
            logger.info(f"Fetched {len(self.competitions)} competitions")
        except Exception as e:
            logger.error(f"Error fetching competitions: {e}")
            raise

    def fetch_matches(self, competition_id: int, season_id: int) -> None:
        """Fetch matches for a specific competition and season."""
        try:
            self.matches = sb.matches(competition_id=competition_id, season_id=season_id)
            logger.info(f"Fetched {len(self.matches)} matches")
        except Exception as e:
            logger.error(f"Error fetching matches: {e}")
            raise

    def fetch_set_pieces(self, match_id: int) -> pd.DataFrame:
        """
        Fetch all set piece events from a specific match.
        
        Args:
            match_id: The ID of the match to analyze
            
        Returns:
            DataFrame containing set piece events
        """
        try:
            # Fetch all events for the match
            events = sb.events(match_id=match_id)
            
            # Filter for set piece events
            set_pieces = events[
                events['type'].isin(['Corner Kick', 'Free Kick', 'Penalty'])
            ].copy()
            
            # Add additional context
            set_pieces['outcome'] = set_pieces.apply(self._determine_outcome, axis=1)
            set_pieces['target_location'] = set_pieces.apply(self._extract_location, axis=1)
            
            return set_pieces
            
        except Exception as e:
            logger.error(f"Error processing match {match_id}: {e}")
            return pd.DataFrame()

    def _determine_outcome(self, event: pd.Series) -> str:
        """Determine the outcome of a set piece event."""
        if 'shot' in event and event['shot'].get('outcome', {}).get('name') == 'Goal':
            return 'goal'
        elif 'shot' in event:
            return 'shot'
        elif 'pass' in event and event['pass'].get('outcome', {}).get('name') == 'Complete':
            return 'completed_pass'
        else:
            return 'other'

    def _extract_location(self, event: pd.Series) -> Dict[str, float]:
        """Extract the target location of the set piece."""
        if 'location' in event:
            return {
                'x': event['location'][0],
                'y': event['location'][1]
            }
        return {'x': None, 'y': None}

    def process_match_set_pieces(self, match_id: int) -> Dict:
        """
        Process all set pieces from a match and calculate success metrics.
        
        Args:
            match_id: The ID of the match to analyze
            
        Returns:
            Dictionary containing set piece statistics
        """
        set_pieces = self.fetch_set_pieces(match_id)
        
        if set_pieces.empty:
            return {}
            
        stats = {
            'total_set_pieces': len(set_pieces),
            'corners': len(set_pieces[set_pieces['type'] == 'Corner Kick']),
            'free_kicks': len(set_pieces[set_pieces['type'] == 'Free Kick']),
            'penalties': len(set_pieces[set_pieces['type'] == 'Penalty']),
            'goals': len(set_pieces[set_pieces['outcome'] == 'goal']),
            'shots': len(set_pieces[set_pieces['outcome'] == 'shot']),
            'success_rate': (
                len(set_pieces[set_pieces['outcome'].isin(['goal', 'shot'])]) /
                len(set_pieces) if len(set_pieces) > 0 else 0
            )
        }
        
        return stats

def main():
    """Main function to demonstrate usage."""
    collector = SetPieceDataCollector()
    
    # Fetch competitions
    collector.fetch_competitions()
    
    # Example: Process Premier League matches
    premier_league = collector.competitions[
        collector.competitions['competition_name'] == 'Premier League'
    ].iloc[0]
    
    # Fetch matches for the most recent season
    collector.fetch_matches(
        competition_id=premier_league['competition_id'],
        season_id=premier_league['season_id']
    )
    
    # Process first match as example
    if not collector.matches.empty:
        match_id = collector.matches.iloc[0]['match_id']
        stats = collector.process_match_set_pieces(match_id)
        logger.info(f"Set piece statistics for match {match_id}:")
        logger.info(stats)

if __name__ == "__main__":
    main() 