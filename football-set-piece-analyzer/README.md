# Football Set Piece Analyzer

## Overview
The Football Set Piece Analyzer is a web application designed to analyze set piece data (corners, free kicks, etc.) for football teams. Users can select a team and interact with a visual representation of a football pitch to receive recommendations on set piece execution based on player statistics and historical success rates.

## Features
- Select a football team from a dropdown menu.
- Click on a visual football pitch to analyze set piece opportunities.
- Get recommendations on which player should take the set piece.
- Determine the optimal trajectory for crosses and identify target players.
- Analyze player statistics, including height and crossing ability.
- Evaluate whether to take a direct free kick or play it inside based on the distance to the box.

## Project Structure
```
football-set-piece-analyzer
├── src
│   ├── components
│   │   ├── PitchVisualization.js
│   │   ├── TeamSelector.js
│   │   ├── SetPieceAnalyzer.js
│   │   ├── PlayerStats.js
│   │   └── RecommendationPanel.js
│   ├── data
│   │   ├── teams.js
│   │   ├── players.js
│   │   └── setpieces.js
│   ├── utils
│   │   ├── analytics.js
│   │   └── visualization.js
│   ├── services
│   │   ├── dataFetcher.js
│   │   └── recommendationEngine.js
│   ├── styles
│   │   ├── main.css
│   │   └── components.css
│   └── App.js
├── public
│   ├── index.html
│   └── favicon.svg
├── package.json
├── .gitignore
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/football-set-piece-analyzer.git
   ```
2. Navigate to the project directory:
   ```
   cd football-set-piece-analyzer
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
1. Start the development server:
   ```
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000` to view the application.
3. Select a team from the dropdown menu and click on the pitch to analyze set piece opportunities.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.