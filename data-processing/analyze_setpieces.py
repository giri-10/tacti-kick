import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, List, Tuple
import logging
from fetch_setpiece_data import SetPieceDataCollector

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SetPieceAnalyzer:
    def __init__(self):
        """Initialize the set piece analyzer."""
        self.scaler = StandardScaler()
        self.kmeans = None
        self.data = None
        
    def prepare_data(self, set_pieces: pd.DataFrame) -> np.ndarray:
        """
        Prepare set piece data for clustering.
        
        Args:
            set_pieces: DataFrame containing set piece events
            
        Returns:
            Numpy array of scaled features
        """
        # Extract relevant features
        features = []
        for _, event in set_pieces.iterrows():
            location = event['target_location']
            feature_vector = [
                location['x'],
                location['y'],
                1 if event['outcome'] == 'goal' else 0,
                1 if event['outcome'] == 'shot' else 0,
                1 if event['type'] == 'Corner Kick' else 0,
                1 if event['type'] == 'Free Kick' else 0
            ]
            features.append(feature_vector)
            
        features = np.array(features)
        
        # Scale features
        scaled_features = self.scaler.fit_transform(features)
        return scaled_features
        
    def cluster_set_pieces(self, features: np.ndarray, n_clusters: int = 5) -> Dict:
        """
        Cluster set pieces using K-means.
        
        Args:
            features: Scaled feature matrix
            n_clusters: Number of clusters to create
            
        Returns:
            Dictionary containing cluster assignments and metrics
        """
        # Fit K-means
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        cluster_labels = self.kmeans.fit_predict(features)
        
        # Calculate metrics
        silhouette_avg = silhouette_score(features, cluster_labels)
        
        # Calculate cluster statistics
        cluster_stats = {}
        for i in range(n_clusters):
            cluster_mask = cluster_labels == i
            cluster_stats[f'cluster_{i}'] = {
                'size': np.sum(cluster_mask),
                'success_rate': np.mean(features[cluster_mask, 2]),  # Index 2 is goals
                'shot_rate': np.mean(features[cluster_mask, 3]),     # Index 3 is shots
                'center': self.kmeans.cluster_centers_[i].tolist()
            }
            
        return {
            'labels': cluster_labels,
            'silhouette_score': silhouette_avg,
            'cluster_stats': cluster_stats
        }
        
    def visualize_clusters(self, features: np.ndarray, cluster_results: Dict, save_path: str = None):
        """
        Create visualization of set piece clusters.
        
        Args:
            features: Scaled feature matrix
            cluster_results: Results from cluster_set_pieces
            save_path: Path to save the visualization (optional)
        """
        plt.figure(figsize=(12, 8))
        
        # Create scatter plot of locations colored by cluster
        scatter = plt.scatter(
            features[:, 0],  # x-coordinates
            features[:, 1],  # y-coordinates
            c=cluster_results['labels'],
            cmap='viridis',
            alpha=0.6
        )
        
        # Plot cluster centers
        centers = self.kmeans.cluster_centers_
        plt.scatter(
            centers[:, 0],
            centers[:, 1],
            c='red',
            marker='x',
            s=200,
            linewidths=3,
            label='Cluster Centers'
        )
        
        plt.title('Set Piece Clusters')
        plt.xlabel('X Position (scaled)')
        plt.ylabel('Y Position (scaled)')
        plt.colorbar(scatter, label='Cluster')
        plt.legend()
        
        if save_path:
            plt.savefig(save_path)
        plt.close()
        
    def recommend_strategy(self, features: np.ndarray, cluster_results: Dict) -> Dict:
        """
        Recommend set piece strategies based on cluster analysis.
        
        Args:
            features: Scaled feature matrix
            cluster_results: Results from cluster_set_pieces
            
        Returns:
            Dictionary containing recommendations
        """
        cluster_stats = cluster_results['cluster_stats']
        
        # Find most successful cluster
        best_cluster = max(
            cluster_stats.items(),
            key=lambda x: x[1]['success_rate']
        )
        
        # Get original coordinates for best cluster
        best_center = best_cluster[1]['center']
        original_coords = self.scaler.inverse_transform([best_center])[0]
        
        recommendations = {
            'best_cluster': best_cluster[0],
            'success_rate': best_cluster[1]['success_rate'],
            'target_location': {
                'x': original_coords[0],
                'y': original_coords[1]
            },
            'description': f"Target the area around (x={original_coords[0]:.1f}, y={original_coords[1]:.1f}) "
                         f"which has a {best_cluster[1]['success_rate']*100:.1f}% success rate"
        }
        
        return recommendations

def main():
    """Main function to demonstrate usage."""
    # Fetch some set piece data
    collector = SetPieceDataCollector()
    collector.fetch_competitions()
    
    # Get Premier League data
    premier_league = collector.competitions[
        collector.competitions['competition_name'] == 'Premier League'
    ].iloc[0]
    
    collector.fetch_matches(
        competition_id=premier_league['competition_id'],
        season_id=premier_league['season_id']
    )
    
    # Get set pieces from first match
    if not collector.matches.empty:
        match_id = collector.matches.iloc[0]['match_id']
        set_pieces = collector.fetch_set_pieces(match_id)
        
        # Analyze set pieces
        analyzer = SetPieceAnalyzer()
        features = analyzer.prepare_data(set_pieces)
        cluster_results = analyzer.cluster_set_pieces(features)
        
        # Visualize results
        analyzer.visualize_clusters(
            features,
            cluster_results,
            save_path='set_piece_clusters.png'
        )
        
        # Get recommendations
        recommendations = analyzer.recommend_strategy(features, cluster_results)
        logger.info("Set piece recommendations:")
        logger.info(recommendations)

if __name__ == "__main__":
    main() 