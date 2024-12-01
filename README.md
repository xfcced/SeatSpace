# SeatSpace

This is a project for WWW service design course at Aalto university.

# Features

- Real-view of Seats
- Comment
- User-friendly interface

# Usage

Add required environment variables:

1. `DATABASE_URL`: Database url and passwd.
2. `DIST_DIR`: Path to host html files.
3. `STATIC_DIR`: Path to host static image files.

To start the application, run:

1. `npm install` to install requeired libraies.
2. `npm run init-db-client` to generate prisma client.
3. `npm run start` to start the service.

This project use Prisma.js as ORM tool, detail information:
https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma

# For Course Staff

For the purpose of course grading, the .env file contains real database keys. Please ensure they are not disclosed. Thank you.
