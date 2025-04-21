# TactiKick - Football Set Piece Analyzer

<p align="center">
  <img src="public/favicon.svg" alt="TactiKick Logo" width="150" />
</p>

## Overview

TactiKick is an interactive web application designed to help football analysts, coaches, and enthusiasts optimize their set piece strategies. The application provides data-driven recommendations for corners, free kicks, and penalties based on team composition, player attributes, and pitch position.

### Key Features

- **Interactive Pitch Visualization**: Click anywhere on the pitch to analyze optimal set piece strategies for that position
- **Player-specific Recommendations**: Get tailored suggestions based on players' attributes (height, foot preference, set piece success rates)
- **Advanced Tactical Analysis**: Recommendations include suggested delivery types, target zones, and player positioning
- **Team Performance Statistics**: View comprehensive stats on team set piece effectiveness
- **Visual Trajectory Mapping**: See visualized ball paths and player positions for recommended strategies


## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Tech Stack](#tech-stack)

## Installation

Follow these steps to set up TactiKick locally:

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/tacti-kick.git
cd tacti-kick
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
npm start
```

The application should now be running on [http://localhost:3000](http://localhost:3000)

## Usage

1. **Select a team** from the dropdown menu in the sidebar
2. **Click on any position** on the football pitch where you want to analyze set piece options
3. **Review the recommendations** provided in the panel below, including:
   - Optimal taker for the set piece
   - Recommended delivery type
   - Target players and zones
   - Expected success rates for different approaches

## Tech Stack

TactiKick is built with modern web technologies:

- **Frontend Framework**: React 18
- **Styling**: Custom CSS with responsive design
- **Visualization**: HTML Canvas for pitch and trajectory rendering
- **Data Management**: JavaScript modules for data handling and transformations


