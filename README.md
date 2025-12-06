# Microservices Frontend

Angular frontend application for managing the microservices system.

## Features

- **Authentication**: Login with JWT token support
- **Orders Management**: View, create, and update order status
- **Operations Management**: Create operations for orders
- **Warehouse Management**: View and manage warehouse details/parts

## Setup

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:4200`

## Configuration

The API Gateway URL is configured in `src/environments/environment.ts`. By default, it points to `http://localhost:5100` (the API Gateway port from docker-compose).

## Default Login Credentials

- Username: `admin`
- Password: `password`

## API Gateway Configuration

The API Gateway (`ocelot.json`) has been configured to route all endpoints including operations. Make sure the gateway is running on port 5100 (as configured in docker-compose).

## Build

To build for production:
```bash
npm run build
```
