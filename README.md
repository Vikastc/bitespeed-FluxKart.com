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

## 🚀 Features

- **Contact Identity Resolution**: Automatically identifies and links related contacts
- **Primary-Secondary Linking**: Maintains hierarchical relationships between contacts
- **Duplicate Prevention**: Prevents duplicate contact creation through intelligent merging
- **Email & Phone Matching**: Links contacts based on email addresses or phone numbers
- **Cluster Management**: Groups related contacts into consolidated clusters
- **RESTful API**: Clean API interface for contact operations

## 🛠️ Quick Start

### Install Dependencies

```bash
yarn install
```

### 🐳 Docker Build & Run

```bash
# Build Docker image
docker build . -t bitespeed/fluxkart:latest -f Dockerfile.mac

# Start all services (PostgreSQL, Redis, and the application)
docker-compose up -d
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### POST /identify

**Request:**

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
