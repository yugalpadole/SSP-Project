# eBazaar - Local Market Digital System

eBazaar is a digital marketplace platform connecting local shopkeepers and customers.

## Features
- **Customer Portal**: Browse products, search, category filtering, cart management, and order placement.
- **Shopkeeper Dashboard**: Manage inventory, track live orders, view revenue analytics, and update store status.
- **Backend & Database**: Express.js server integrated with SQLite and Supabase real-time synchronization.

## Project Structure
- `client/`: React + Vite + TypeScript frontend
- `server/`: Express + TypeScript backend API
- `data/`: Sample and initial seed data
- `supabase_schema.sql`: Database schema definition for Supabase

## Setup & Run
### Backend
```bash
npm install
npm run server
```

### Frontend
```bash
cd client
npm install
npm run dev
```
