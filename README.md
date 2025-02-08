# EV Charging Platform

## Overview
The EV Charging Platform is a full-stack web application that allows users to find and rent EV charging stations. Charging station owners can list their stations and earn money by offering charging sessions.

## Features
- **Full-stack application** built with React (Frontend) and Node.js (Backend)
- **User authentication** with JWT, including refresh tokens and Google authentication
- **Database management** using MongoDB with well-defined relationships between collections
- **Gemini AI API integration** to retrieve client car data and estimate charging time
- **RESTful API** built with TypeScript for strong typing and maintainability
- **Unit testing** for API endpoints using Jest
- **Git version control** with branching and pull requests for collaborative development
- **Networking & Protocols**: Utilizes HTTP

## Installation
Follow these steps to set up the project locally.

### 1. Clone the Repository
```sh
git clone https://github.com/TomGuter/Charging-Stations.git
cd Charging-Stations
```

### 2. Install Dependencies
Run `npm install` in each of the following folders:
```sh
npm install  # In the root folder
cd server && npm install  # In the backend (server) folder
cd ../webApp && npm install  # In the frontend (webApp) folder
```

### 3. Set Up Environment Variables
Create a `.env` file in both the `server` and `webApp` directories with the required environment variables.

### 4. Start the Backend Server
```sh
cd server
npm run dev
```

### 5. Start the Frontend Application
```sh
cd ../webApp
npm run dev
```

## Usage
- Users can search for charging stations, view availability, and book charging slots.
- Station owners can list their charging stations, manage bookings, and track earnings.
- The platform uses real-time updates to show station availability.

## Contributing
Feel free to open an issue or submit a pull request. Follow the Git branching model for collaborative development.

