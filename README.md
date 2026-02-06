# LS Manager - Light & Sound Event Management System

A comprehensive event management system for light and sound equipment rental businesses. Built with modern technologies and designed for scalability.

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **TanStack Query** (React Query) for data management
- **React Router** for navigation
- **Recharts** for data visualization
- **Lucide React** for icons
- **Tailwind CSS** for styling

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Robust database
- **TypeScript** - Type safety
- **Class Validator** - DTO validation
- **Bcrypt** - Password hashing

## 📋 Features

### ✅ Fully Implemented

#### 1. Employee Management
- Complete CRUD operations
- Multi-step employee creation form
- Employee detail page with tabs
- Block/Unblock functionality
- User account creation with roles
- Skills management
- Wage configuration (Piece Rate, Daily, Fixed Job)

#### 2. Job Management
- My Jobs page for employees
- Job status workflow (Planned → Ongoing → Completed)
- Real-time job tracking
- Job assignment
- Budget tracking

#### 3. Invoice System
- Create and manage invoices
- Invoice preview and print
- Item-based billing
- Client linking
- Status tracking

#### 4. Quotation System
- Create quotations
- Item management
- Client selection
- Convert to jobs

#### 5. Inventory Management
- QR code generation
- Category management
- Stock tracking
- Maintenance logs

#### 6. Client Management
- Client CRUD operations
- Contact management
- Job history

### 🎨 UI Complete (Mock Data)

#### 7. Dashboard
- Revenue vs Expenses charts
- Job status visualization
- Key metrics cards
- Recent activities feed
- Quick actions

#### 8. Wages & Payments
- Wage calculation dashboard
- Payment history
- Weekly distribution charts
- Filter by date/employee/status

#### 9. Reports & Analytics
- Revenue reports
- Job performance metrics
- Employee performance
- Export functionality

#### 10. Wage Policies
- Piece rate configuration
- Daily wage settings
- Fixed job wage settings

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run start:dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with backend URL

# Start development server
npm run dev
```

## 📁 Project Structure

```
LS Manager/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── employees/
│   │   │   ├── jobs/
│   │   │   ├── invoices/
│   │   │   ├── quotations/
│   │   │   ├── inventory/
│   │   │   ├── clients/
│   │   │   └── wages/
│   │   ├── database/
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── dashboard/
    │   │   ├── employees/
    │   │   ├── jobs/
    │   │   ├── invoices/
    │   │   ├── quotations/
    │   │   ├── inventory/
    │   │   ├── clients/
    │   │   ├── wages/
    │   │   ├── reports/
    │   │   └── settings/
    │   ├── services/
    │   ├── components/
    │   └── routes/
    └── package.json
```

## 🔑 Key Features Explained

### Wage Management System

The system supports three wage models:

1. **Piece Rate** - Pay per item handled
   - Example: LED Light = ₹5 per light
   - Technician handles 100 lights = ₹500

2. **Daily Wage** - Pay per day worked
   - Example: Helper = ₹800 per day
   - Works 1 day = ₹800

3. **Fixed Job Wage** - Fixed pay per event
   - Example: Driver = ₹500 per job
   - Assigned to job = ₹500

### Workflow Example

```
1. Admin configures wage rates in Settings
2. Job is created and employees assigned
3. During event:
   - Technician logs items handled
   - Helper attendance marked
   - Driver auto-assigned
4. System auto-calculates wages
5. Supervisor verifies work logs
6. Admin approves payment
7. Payment marked as paid
```

## 🎯 API Endpoints

### Employees
- `GET /employees` - List all employees
- `POST /employees` - Create employee
- `GET /employees/:id` - Get employee details
- `PATCH /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

### Jobs
- `GET /jobs` - List all jobs
- `POST /jobs` - Create job
- `GET /jobs/:id` - Get job details
- `PATCH /jobs/:id` - Update job
- `DELETE /jobs/:id` - Delete job

### Invoices
- `GET /invoices` - List all invoices
- `POST /invoices` - Create invoice
- `GET /invoices/:id` - Get invoice details
- `PATCH /invoices/:id` - Update invoice

### Quotations
- `GET /quotations` - List all quotations
- `POST /quotations` - Create quotation
- `GET /quotations/:id` - Get quotation details

## 🎨 Design System

### Colors
- **Background:** `#0B0E14`
- **Cards:** `#151A21`
- **Borders:** `#1F2937`
- **Primary:** Blue `#3b82f6`
- **Success:** Green `#10b981`
- **Warning:** Amber `#f59e0b`
- **Danger:** Red `#ef4444`

### Typography
- **Font Family:** System fonts
- **Headings:** Bold, White
- **Body:** Regular, Gray-200
- **Labels:** Medium, Gray-400

## 📱 Responsive Design

All pages are fully responsive:
- **Desktop:** Full layout with sidebars
- **Tablet:** Adaptive grid layouts
- **Mobile:** Stacked layouts, hamburger menu

## 🔒 Security

- Password hashing with bcrypt
- JWT authentication (ready)
- Role-based access control
- Input validation with class-validator
- SQL injection prevention with Prisma

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## 📦 Build for Production

### Backend
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend
```bash
cd frontend
npm run build
# Serve dist folder with your preferred server
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Prisma team for the excellent ORM
- React team for the UI library
- All open-source contributors

## 📞 Support

For support, email support@lsmanager.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Email integration
- [ ] SMS notifications
- [ ] Payment gateway integration

---

**Made with ❤️ for the Light & Sound industry**
