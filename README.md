# bitespeed-FluxKart.com

# Contact Identity Resolution Service

A Node.js service built with Express and TypeORM that provides contact identity resolution and consolidation functionality. This service helps identify and link related contacts based on email addresses and phone numbers, maintaining primary-secondary relationships between linked contacts.

## 🏗️ Architecture

**Tech Stack:**
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Language**: TypeScript
- **Containerization**: Docker & Docker Compose

**Design Pattern:**
- RESTful API design
- Repository pattern with TypeORM
- Modular controller architecture
- Database-first approach with entity relationships

## 🚀 Features

- **Contact Identity Resolution**: Automatically identifies and links related contacts
- **Primary-Secondary Linking**: Maintains hierarchical relationships between contacts
- **Duplicate Prevention**: Prevents duplicate contact creation through intelligent merging
- **Email & Phone Matching**: Links contacts based on email addresses or phone numbers
- **Cluster Management**: Groups related contacts into consolidated clusters
- **RESTful API**: Clean API interface for contact operations

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Docker** and **Docker Compose**
- **PostgreSQL** (if running without Docker)
- **Redis** (if running without Docker)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd contact-identity-service
```

### 2. Install Dependencies
```bash
yarn install
```

## 🐳 Docker Setup
### Manual Docker Build
```bash

# Build Docker image
docker build . -t bitespeed/fluxkart:latest -f Dockerfile.mac

# Start all services (PostgreSQL, Redis, and the application)
docker-compose up -d

The server will start on `http://localhost:3000`

## 📚 API Documentation

### POST /identify

Identifies and consolidates contact information based on email or phone number.

**Request Body:**
```json
{
  "email": "example@email.com",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["example@email.com", "another@email.com"],
    "phoneNumbers": ["+1234567890", "+0987654321"],
    "secondaryContactIds": [2, 3, 4]
  }
}
```

**Business Logic:**
1. **New Contact**: If no matching email/phone exists, creates a new primary contact
2. **Existing Match**: If matches found, consolidates into a single cluster
3. **Primary Selection**: Oldest contact becomes the primary
4. **Secondary Linking**: All other contacts become secondaries linked to the primary
5. **New Information**: Adds new secondary contact if email/phone is unique to the cluster

## 🏗️ Project Structure

```
src/
├── controllers/
│   └── identity_controller.ts    # Main business logic
├── entity/
│   └── Contact.ts               # TypeORM entity definition
├── dbconfig.ts                  # Database configuration
├── server.ts                    # Express server setup
└── index.ts                     # Application entry point
docker-compose.yaml              # Docker services configuration
```

### Health Check
```bash
curl http://localhost:3000/
```
Expected response:
```json
{
  "message": "Project is running successfully"
}
```

