# Ministry Tracker

A student ministry interaction tracking system for college ministry staff.

## Features

- **Student Database**: Manage student profiles with contact info, year, major, and custom tags
- **Interaction Logging**: Record meetings, calls, and conversations with detailed notes
- **Follow-Up System**: Schedule and track follow-up reminders with priority levels
- **Prayer Requests**: Log and track prayer requests with status updates
- **Calendar View**: Visualize interactions and follow-ups in a calendar format
- **Staff Management**: Multiple staff accounts with different permission levels
- **Reports**: Export data to CSV for reporting and analysis

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd ministry-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run setup
   ```
   This will:
   - Generate Prisma client
   - Create the SQLite database
   - Seed with sample data

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**

   Visit [http://localhost:3000](http://localhost:3000)

### Default Login Credentials

| Role  | Email               | Password    |
|-------|---------------------|-------------|
| Admin | admin@ministry.local | changeme    |
| Staff | john@ministry.local  | password123 |

**Important**: Change the default passwords after first login!

## Usage Guide

### Dashboard
The dashboard provides an overview of:
- Total active students
- Recent interactions
- Overdue follow-ups
- Active prayer requests
- Pending action items

### Students
- View all students in a card-based layout
- Search by name, email, or major
- Filter by year or status
- Click on a student card to view their full profile

### Student Profile
From a student's profile, you can:
- View their contact information
- See all past interactions
- Schedule follow-ups
- Add prayer requests
- Track action items
- Edit or delete the student (admin only)

### Interactions
When logging an interaction:
- Select the interaction type (1-on-1, Small group, Event, etc.)
- Add location and notes
- Mark topics discussed
- Flag as confidential if needed (only visible to you and admins)

### Follow-Ups
- View overdue, today's, and upcoming follow-ups
- Mark as complete when done
- Set priority levels (High, Medium, Low)

### Calendar
- View all interactions and follow-ups in calendar format
- Switch between month and week views
- Click events to see details

### Reports
Export data to CSV:
- Student list with activity counts
- Interaction summary by date range
- Follow-up status report
- Prayer requests list

### Settings (Admin Only)
- Add new staff members
- Edit existing staff accounts
- Set roles and colors
- Delete staff accounts

## User Roles

| Role      | Permissions |
|-----------|-------------|
| Admin     | Full access, manage staff, delete students, see all confidential notes |
| Staff     | View/edit students, log interactions, manage own follow-ups and prayers |
| Volunteer | Limited access, view shared data only |

## Database

The application uses SQLite with Prisma ORM. The database file is stored at `prisma/dev.db`.

### Database Commands

```bash
# Open Prisma Studio (GUI for viewing/editing data)
npm run db:studio

# Reset and reseed the database
npm run db:push && npm run db:seed

# Generate Prisma client after schema changes
npm run db:generate
```

## Security Notes

- All passwords are hashed with bcrypt
- Sessions are JWT-based with secure cookies
- Confidential interactions are only visible to creators and admins
- Private prayer requests are only visible to assigned staff
- All data is stored locally (not in the cloud)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma
- **Authentication**: NextAuth.js v5
- **Calendar**: FullCalendar
- **Forms**: React Hook Form
- **Icons**: Lucide React

## File Structure

```
ministry-tracker/
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── seed.ts          # Seed data
│   └── dev.db           # SQLite database (created after setup)
├── src/
│   ├── app/
│   │   ├── (dashboard)/ # Protected pages
│   │   ├── api/         # API routes
│   │   └── login/       # Login page
│   ├── components/      # React components
│   ├── lib/             # Utilities (auth, prisma)
│   └── types/           # TypeScript types
├── .env                 # Environment variables
└── package.json
```

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-key-here"
AUTH_URL="http://localhost:3000"
```

## Contributing

This is a local-first application designed for privacy. All data stays on your machine.

## License

MIT
