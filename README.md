# Set-Piece Optimization Engine

An advanced analytics tool for optimizing football set-pieces using machine learning and data visualization.

## Features

- Corner kick analysis and optimization
- Free kick probability modeling
- Interactive 2D/3D visualizations of set-piece scenarios
- Real-time strategy recommendations
- Player-specific success rate calculations

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.x
- PostgreSQL

### Data Processing
- Python 3.9+
- Pandas
- Scikit-learn
- NumPy

### Frontend
- React 18
- D3.js
- Three.js
- TypeScript

## Project Structure

```
set-piece-optimization/
├── backend/                 # Spring Boot application
├── data-processing/         # Python scripts for data analysis
├── frontend/               # React application
└── docs/                   # Documentation
```

## Setup Instructions

### Prerequisites
- JDK 17
- Node.js 18+
- Python 3.9+
- PostgreSQL 13+

### Backend Setup
1. Navigate to `backend/`
2. Run `./mvnw spring-boot:run`

### Data Processing Setup
1. Navigate to `data-processing/`
2. Create virtual environment: `python -m venv venv`
3. Activate venv: 
   - Windows: `venv\Scripts\activate`
   - Unix: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`

### Frontend Setup
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Start development server: `npm start`

## Data Sources
- StatsBomb Open Data
- FBref
- Transfermarkt

## Contributing
This project is under active development. Feel free to submit issues and pull requests.

## License
MIT License 