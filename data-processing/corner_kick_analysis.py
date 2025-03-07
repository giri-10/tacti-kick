import pandas as pd
import numpy as np
from statsbombpy import sb
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, List, Tuple
import json
import os
from dotenv import load_dotenv

class CornerKickAnalyzer:
    def __init__(self):
        """Initialize the CornerKickAnalyzer with StatsBomb data."""
        load_dotenv()
        self.competitions = sb.competitions()
        self.corner_data = None
        self.clusters = None
        
    def fetch_match_data(self, competition_id: int, season_id: int) -> pd.DataFrame:
        """Fetch match data for a specific competition and season."""
        matches = sb.matches(competition_id=competition_id, season_id=season_id)
        events = []
        
        for match_id in matches['match_id']:
            match_events = sb.events(match_id=match_id)
            # Filter for corner kicks
            corner_events = match_events[match_events['type'] == 'Corner']
            events.append(corner_events)
            
        return pd.concat(events, ignore_index=True)
    
    def process_corner_data(self, events_df: pd.DataFrame) -> pd.DataFrame:
        """Process corner kick events and extract relevant features."""
        processed_data = []
        
        for _, event in events_df.iterrows():
            # Extract location data
            location = event.get('location', [0, 0])
            end_location = event.get('end_location', [0, 0])
            
            # Extract outcome
            outcome = 1 if event.get('shot_outcome') == 'Goal' else 0
            
            # Create feature dict
            corner_features = {
                'start_x': location[0],
                'start_y': location[1],
                'end_x': end_location[0],
                'end_y': end_location[1],
                'player_name': event.get('player', {}).get('name', ''),
                'team_name': event.get('team', {}).get('name', ''),
                'outcome': outcome,
                'match_id': event.get('match_id'),
                'minute': event.get('minute', 0)
            }
            
            processed_data.append(corner_features)
            
        return pd.DataFrame(processed_data)
    
    def cluster_corners(self, data: pd.DataFrame, n_clusters: int = 5) -> Dict:
        """Cluster corner kicks based on end location and outcome."""
        # Prepare features for clustering
        features = ['end_x', 'end_y']
        X = data[features]
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Perform clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        clusters = kmeans.fit_predict(X_scaled)
        
        # Add cluster labels to data
        data['cluster'] = clusters
        
        # Calculate success rates per cluster
        cluster_stats = {}
        for cluster in range(n_clusters):
            cluster_data = data[data['cluster'] == cluster]
            success_rate = cluster_data['outcome'].mean()
            cluster_stats[cluster] = {
                'success_rate': success_rate,
                'count': len(cluster_data),
                'centroid': kmeans.cluster_centers_[cluster].tolist()
            }
            
        return cluster_stats
    
    def visualize_clusters(self, data: pd.DataFrame, cluster_stats: Dict) -> None:
        """Create visualization of corner kick clusters."""
        plt.figure(figsize=(12, 8))
        
        # Plot points colored by cluster
        scatter = plt.scatter(data['end_x'], data['end_y'], 
                            c=data['cluster'], cmap='viridis',
                            alpha=0.6)
        
        # Plot cluster centroids
        for cluster, stats in cluster_stats.items():
            centroid = stats['centroid']
            plt.scatter(centroid[0], centroid[1], 
                       marker='x', s=200, linewidths=3,
                       color='r', label=f'Centroid {cluster}')
            
        plt.title('Corner Kick Clusters')
        plt.xlabel('End X Position')
        plt.ylabel('End Y Position')
        plt.colorbar(scatter, label='Cluster')
        plt.legend()
        
        # Save the plot
        os.makedirs('output', exist_ok=True)
        plt.savefig('output/corner_clusters.png')
        plt.close()
    
    def analyze_corners(self, competition_id: int, season_id: int) -> Dict:
        """Perform complete corner kick analysis."""
        # Fetch and process data
        events_df = self.fetch_match_data(competition_id, season_id)
        self.corner_data = self.process_corner_data(events_df)
        
        # Perform clustering
        cluster_stats = self.cluster_corners(self.corner_data)
        
        # Create visualizations
        self.visualize_clusters(self.corner_data, cluster_stats)
        
        # Save results
        results = {
            'cluster_stats': cluster_stats,
            'total_corners': len(self.corner_data),
            'success_rate': self.corner_data['outcome'].mean()
        }
        
        with open('output/corner_analysis.json', 'w') as f:
            json.dump(results, f, indent=4)
            
        return results

if __name__ == "__main__":
    # Example usage
    analyzer = CornerKickAnalyzer()
    
    # Premier League 2022/23 (adjust IDs as needed)
    competition_id = 2
    season_id = 90
    
    results = analyzer.analyze_corners(competition_id, season_id)
    print("Analysis complete! Check the output directory for results.") 