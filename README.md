# Tacti-Kick: Set-Piece Optimization Engine

A data-driven football set-piece optimization tool that provides visual simulations and recommendations for corner kicks, free kicks, and penalties.

## Features

- Interactive visual simulations of set-pieces
- Data-driven recommendations based on historical performance
- Real-time strategy adjustments
- Player-specific optimization
- Beautiful, responsive UI with D3.js visualizations

## Tech Stack

### Frontend
- React.js
- D3.js for visualizations
- React Spring for animations
- Material-UI for components

### Backend
- Java Spring Boot
- Python (for data processing)
- PostgreSQL

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Java 17 or higher
- Python 3.8 or higher
- PostgreSQL

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tacti-kick.git
cd tacti-kick
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
./mvnw install
```

4. Start the development servers:
```bash
# Frontend (from frontend directory)
npm start

# Backend (from backend directory)
./mvnw spring-boot:run
```

## Project Structure

```
tacti-kick/
├── frontend/           # React frontend application
├── backend/           # Spring Boot backend application
├── data-processing/   # Python scripts for data analysis
└── docs/             # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 