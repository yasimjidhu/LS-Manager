import { PrismaClient, Role, ItemStatus, EventStatus, QuoteStatus, InvoiceStatus, JobStatus, WageModel, WageType, ExpenseCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await prisma.jobExpense.deleteMany();
    await prisma.checkoutLog.deleteMany();
    await prisma.jobRequest.deleteMany();
    await prisma.wage.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.invoiceItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.quotationItem.deleteMany();
    await prisma.quotation.deleteMany();
    await prisma.jobAssignment.deleteMany();
    await prisma.maintenanceLog.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.jobCostLedger.deleteMany();
    await prisma.event.deleteMany();
    await prisma.job.deleteMany();
    await prisma.itemPieceRate.deleteMany();
    await prisma.employeeWageRate.deleteMany();
    await prisma.globalRoleRate.deleteMany();
    await prisma.wagePolicy.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.inventoryCategory.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.user.deleteMany();
    await prisma.systemSettings.deleteMany();
    await prisma.paymentProfile.deleteMany();
    await prisma.companyProfile.deleteMany();

    // 1. Create Company Profile
    console.log('🏢 Creating company profile...');
    const company = await prisma.companyProfile.create({
        data: {
            companyName: 'Elite Sound & Lighting Solutions',
            address: '123 Event Avenue',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
            website: 'www.elitesoundlighting.com',
            supportEmail: 'support@elitesoundlighting.com',
            phone: '+91 98765 43210',
            email: 'info@elitesoundlighting.com',
            gstNumber: '27AABCU9603R1ZM',
            invoiceFooterNote: 'Thank you for your business! Payment due within 30 days.',
        },
    });

    // 2. Create Payment Profile
    await prisma.paymentProfile.create({
        data: {
            companyId: company.id,
            upiId: 'elitesound@paytm',
            bankName: 'HDFC Bank',
            accountNumber: '50200012345678',
            ifscCode: 'HDFC0001234',
            accountName: 'Elite Sound & Lighting Solutions',
            branch: 'Mumbai Main Branch',
            paymentTerms: 'Net 30 days',
        },
    });

    // 3. Create System Settings
    await prisma.systemSettings.create({
        data: {
            companyId: company.id,
            currency: 'INR',
            timezone: 'Asia/Kolkata',
            dateFormat: 'DD/MM/YYYY',
            workingDayStart: '09:00',
            workingDayEnd: '18:00',
            overtimeEnabled: true,
            overtimeThreshold: 8,
            attendanceGracePeriod: 15,
        },
    });

    // 4. Create Users
    console.log('👥 Creating users...');
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const employeePassword = await bcrypt.hash('Employee@123', 10);

    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@elitesound.com',
            password: adminPassword,
            role: Role.ADMIN,
            isActive: true,
        },
    });

    const supervisorUser = await prisma.user.create({
        data: {
            email: 'supervisor@elitesound.com',
            password: await bcrypt.hash('Supervisor@123', 10),
            role: Role.SUPERVISOR,
            isActive: true,
        },
    });

    const employee1User = await prisma.user.create({
        data: {
            email: 'rajesh@elitesound.com',
            password: employeePassword,
            role: Role.EMPLOYEE,
            isActive: true,
        },
    });

    const employee2User = await prisma.user.create({
        data: {
            email: 'priya@elitesound.com',
            password: employeePassword,
            role: Role.EMPLOYEE,
            isActive: true,
        },
    });

    const employee3User = await prisma.user.create({
        data: {
            email: 'amit@elitesound.com',
            password: employeePassword,
            role: Role.EMPLOYEE,
            isActive: true,
        },
    });

    // 5. Create Employees
    console.log('👷 Creating employees...');
    const supervisor = await prisma.employee.create({
        data: {
            firstName: 'Vikram',
            lastName: 'Sharma',
            phone: '+91 98765 11111',
            skills: ['Event Management', 'Team Leadership', 'Sound Engineering'],
            wageModel: WageModel.FIXED,
            baseWage: 50000,
            userId: supervisorUser.id,
        },
    });

    const employee1 = await prisma.employee.create({
        data: {
            firstName: 'Rajesh',
            lastName: 'Kumar',
            phone: '+91 98765 22222',
            skills: ['Sound Engineering', 'Mixing', 'Equipment Setup'],
            wageModel: WageModel.PIECE_RATE,
            baseWage: 1500,
            userId: employee1User.id,
        },
    });

    const employee2 = await prisma.employee.create({
        data: {
            firstName: 'Priya',
            lastName: 'Patel',
            phone: '+91 98765 33333',
            skills: ['Lighting Design', 'DMX Programming', 'Stage Setup'],
            wageModel: WageModel.PIECE_RATE,
            baseWage: 1500,
            userId: employee2User.id,
        },
    });

    const employee3 = await prisma.employee.create({
        data: {
            firstName: 'Amit',
            lastName: 'Singh',
            phone: '+91 98765 44444',
            skills: ['Equipment Transport', 'Stage Setup', 'Cable Management'],
            wageModel: WageModel.FIXED,
            baseWage: 25000,
            userId: employee3User.id,
        },
    });

    // 6. Create Inventory Categories
    console.log('📦 Creating inventory categories...');
    const soundCategory = await prisma.inventoryCategory.create({
        data: {
            name: 'Sound Equipment',
            description: 'Professional audio equipment including speakers, mixers, and microphones',
        },
    });

    const lightingCategory = await prisma.inventoryCategory.create({
        data: {
            name: 'Lighting Equipment',
            description: 'Stage lighting including LED lights, moving heads, and controllers',
        },
    });

    const stageCategory = await prisma.inventoryCategory.create({
        data: {
            name: 'Stage Equipment',
            description: 'Stage platforms, trusses, and structural equipment',
        },
    });

    const accessoriesCategory = await prisma.inventoryCategory.create({
        data: {
            name: 'Accessories',
            description: 'Cables, stands, cases, and other accessories',
        },
    });

    // 7. Create Inventory Items
    console.log('🎵 Creating inventory items...');

    // Sound Equipment
    const speaker1 = await prisma.inventoryItem.create({
        data: {
            name: 'JBL SRX835P Active Speaker',
            description: '15" 3-way powered speaker, 2000W',
            qrCode: 'SND-SPK-001',
            quantity: 8,
            price: 5000,
            status: ItemStatus.AVAILABLE,
            categoryId: soundCategory.id,
        },
    });

    const mixer1 = await prisma.inventoryItem.create({
        data: {
            name: 'Yamaha MG16XU Mixer',
            description: '16-channel analog mixer with effects',
            qrCode: 'SND-MIX-001',
            quantity: 3,
            price: 3500,
            status: ItemStatus.AVAILABLE,
            categoryId: soundCategory.id,
        },
    });

    const mic1 = await prisma.inventoryItem.create({
        data: {
            name: 'Shure SM58 Microphone',
            description: 'Professional vocal microphone',
            qrCode: 'SND-MIC-001',
            quantity: 12,
            price: 300,
            status: ItemStatus.AVAILABLE,
            categoryId: soundCategory.id,
        },
    });

    const subwoofer = await prisma.inventoryItem.create({
        data: {
            name: 'JBL SRX828SP Subwoofer',
            description: 'Dual 18" powered subwoofer, 2000W',
            qrCode: 'SND-SUB-001',
            quantity: 4,
            price: 6000,
            status: ItemStatus.AVAILABLE,
            categoryId: soundCategory.id,
        },
    });

    // Lighting Equipment
    const movingHead = await prisma.inventoryItem.create({
        data: {
            name: 'Chauvet Intimidator Spot 375Z',
            description: 'LED moving head with zoom',
            qrCode: 'LGT-MOV-001',
            quantity: 10,
            price: 2500,
            status: ItemStatus.AVAILABLE,
            categoryId: lightingCategory.id,
        },
    });

    const parLight = await prisma.inventoryItem.create({
        data: {
            name: 'Chauvet SlimPAR Pro H USB',
            description: 'RGBA+UV LED wash light',
            qrCode: 'LGT-PAR-001',
            quantity: 20,
            price: 800,
            status: ItemStatus.AVAILABLE,
            categoryId: lightingCategory.id,
        },
    });

    const dmxController = await prisma.inventoryItem.create({
        data: {
            name: 'Chauvet Obey 70 DMX Controller',
            description: '384-channel DMX lighting controller',
            qrCode: 'LGT-CTL-001',
            quantity: 2,
            price: 1500,
            status: ItemStatus.AVAILABLE,
            categoryId: lightingCategory.id,
        },
    });

    // Stage Equipment
    const truss = await prisma.inventoryItem.create({
        data: {
            name: 'Global Truss F34 (3m)',
            description: 'Aluminum box truss, 290mm x 3m',
            qrCode: 'STG-TRS-001',
            quantity: 15,
            price: 1200,
            status: ItemStatus.AVAILABLE,
            categoryId: stageCategory.id,
        },
    });

    const stagePlatform = await prisma.inventoryItem.create({
        data: {
            name: 'Stage Platform 8x4ft',
            description: 'Modular stage platform with adjustable legs',
            qrCode: 'STG-PLT-001',
            quantity: 12,
            price: 2000,
            status: ItemStatus.AVAILABLE,
            categoryId: stageCategory.id,
        },
    });

    // Accessories
    const xlrCable = await prisma.inventoryItem.create({
        data: {
            name: 'XLR Cable 10m',
            description: 'Professional balanced audio cable',
            qrCode: 'ACC-CBL-001',
            quantity: 50,
            price: 50,
            status: ItemStatus.AVAILABLE,
            categoryId: accessoriesCategory.id,
        },
    });

    const speakerStand = await prisma.inventoryItem.create({
        data: {
            name: 'Speaker Stand Heavy Duty',
            description: 'Adjustable speaker stand, max load 50kg',
            qrCode: 'ACC-STD-001',
            quantity: 16,
            price: 200,
            status: ItemStatus.AVAILABLE,
            categoryId: accessoriesCategory.id,
        },
    });

    // 8. Create Wage Policies
    console.log('💰 Creating wage policies...');
    await prisma.wagePolicy.createMany({
        data: [
            { type: WageType.PIECE_RATE, isActive: true, description: 'Per item/equipment piece rate' },
            { type: WageType.DAILY_WAGE, isActive: true, description: 'Daily wage for workers' },
            { type: WageType.HOURLY_WAGE, isActive: true, description: 'Hourly wage for part-time workers' },
            { type: WageType.FIXED_JOB_RATE, isActive: true, description: 'Fixed rate per job/event' },
        ],
    });

    // 9. Create Global Role Rates
    console.log('💵 Creating global role rates...');
    await prisma.globalRoleRate.createMany({
        data: [
            { roleName: 'Sound Engineer', wageType: WageType.DAILY_WAGE, rate: 2000, description: 'Daily rate for sound engineers' },
            { roleName: 'Lighting Technician', wageType: WageType.DAILY_WAGE, rate: 1800, description: 'Daily rate for lighting technicians' },
            { roleName: 'Stage Hand', wageType: WageType.DAILY_WAGE, rate: 1200, description: 'Daily rate for stage hands' },
            { roleName: 'Event Supervisor', wageType: WageType.FIXED_JOB_RATE, rate: 5000, description: 'Fixed rate per event for supervisors' },
        ],
    });

    // 10. Create Item Piece Rates
    console.log('📊 Creating item piece rates...');
    await prisma.itemPieceRate.createMany({
        data: [
            { itemId: speaker1.id, ratePerUnit: 50 },
            { itemId: mixer1.id, ratePerUnit: 100 },
            { itemId: movingHead.id, ratePerUnit: 75 },
            { itemId: parLight.id, ratePerUnit: 30 },
        ],
    });

    // 11. Create Jobs
    console.log('🎉 Creating jobs...');
    const job1 = await prisma.job.create({
        data: {
            title: 'Corporate Annual Day - Tech Corp',
            date: '2026-02-15',
            duration: '6 hours',
            location: 'Grand Hotel, Mumbai',
            client: 'Tech Corp India Pvt Ltd',
            description: 'Annual day celebration with 500+ attendees. Full sound and lighting setup required.',
            status: JobStatus.CONFIRMED,
            color: 'bg-green-600/20 text-green-400 border-green-600/30',
            requiredWorkers: 4,
        },
    });

    const job2 = await prisma.job.create({
        data: {
            title: 'Wedding Reception - Sharma Family',
            date: '2026-02-20',
            duration: '8 hours',
            location: 'Royal Banquet Hall, Pune',
            client: 'Mr. Rajesh Sharma',
            description: 'Wedding reception for 300 guests. DJ setup, stage lighting, and dance floor lights.',
            status: JobStatus.PLANNED,
            color: 'bg-purple-600/20 text-purple-400 border-purple-600/30',
            requiredWorkers: 3,
        },
    });

    const job3 = await prisma.job.create({
        data: {
            title: 'Music Concert - Rock Band Live',
            date: '2026-03-05',
            duration: '5 hours',
            location: 'Open Air Amphitheater, Bangalore',
            client: 'Rock Nation Events',
            description: 'Live rock concert with 1000+ audience. Professional sound system and stage lighting.',
            status: JobStatus.PENDING,
            color: 'bg-red-600/20 text-red-400 border-red-600/30',
            requiredWorkers: 6,
        },
    });

    // 12. Create Events (Legacy system)
    console.log('📅 Creating events...');
    const event1 = await prisma.event.create({
        data: {
            name: 'College Fest - SpringFest 2026',
            description: 'Annual college festival with multiple stages',
            location: 'IIT Mumbai Campus',
            startDate: new Date('2026-03-10T10:00:00'),
            endDate: new Date('2026-03-12T22:00:00'),
            status: EventStatus.CONFIRMED,
            supervisorId: supervisor.id,
        },
    });

    // 13. Create Job Assignments
    await prisma.jobAssignment.createMany({
        data: [
            { eventId: event1.id, employeeId: employee1.id, role: 'Sound Engineer' },
            { eventId: event1.id, employeeId: employee2.id, role: 'Lighting Technician' },
            { eventId: event1.id, employeeId: employee3.id, role: 'Stage Hand' },
        ],
    });

    // 14. Create Job Requests
    await prisma.jobRequest.createMany({
        data: [
            { jobId: job1.id, employeeId: employee1.id, status: 'APPROVED' },
            { jobId: job1.id, employeeId: employee2.id, status: 'APPROVED' },
            { jobId: job2.id, employeeId: employee3.id, status: 'PENDING' },
        ],
    });

    // 15. Create Quotation
    console.log('📝 Creating quotations...');
    const quotation1 = await prisma.quotation.create({
        data: {
            eventId: event1.id,
            clientName: 'IIT Mumbai',
            clientPhone: '+91 22 2576 7890',
            clientEmail: 'events@iitb.ac.in',
            subtotal: 150000,
            laborCost: 25000,
            transportCost: 5000,
            taxRate: 18,
            taxAmount: 32400,
            discount: 10000,
            totalAmount: 202400,
            status: QuoteStatus.ACCEPTED,
            validUntil: new Date('2026-03-01'),
        },
    });

    // 16. Create Quotation Items
    await prisma.quotationItem.createMany({
        data: [
            { quotationId: quotation1.id, itemId: speaker1.id, quantity: 8, unitPrice: 5000, totalPrice: 40000 },
            { quotationId: quotation1.id, itemId: mixer1.id, quantity: 2, unitPrice: 3500, totalPrice: 7000 },
            { quotationId: quotation1.id, itemId: movingHead.id, quantity: 10, unitPrice: 2500, totalPrice: 25000 },
            { quotationId: quotation1.id, itemId: parLight.id, quantity: 20, unitPrice: 800, totalPrice: 16000 },
            { quotationId: quotation1.id, itemId: truss.id, quantity: 10, unitPrice: 1200, totalPrice: 12000 },
        ],
    });

    // 17. Create Invoice
    console.log('🧾 Creating invoices...');
    const invoice1 = await prisma.invoice.create({
        data: {
            eventId: event1.id,
            clientName: 'IIT Mumbai',
            createdBy: adminUser.id,
            subtotal: 150000,
            laborCost: 25000,
            transportCost: 5000,
            taxAmount: 32400,
            discount: 10000,
            totalAmount: 202400,
            paidAmount: 100000,
            balanceAmount: 102400,
            status: InvoiceStatus.PARTIALLY_PAID,
            dueDate: new Date('2026-04-10'),
        },
    });

    // 18. Create Invoice Items
    await prisma.invoiceItem.createMany({
        data: [
            { invoiceId: invoice1.id, itemId: speaker1.id, quantity: 8, unitPrice: 5000, totalPrice: 40000, description: 'JBL SRX835P Active Speakers' },
            { invoiceId: invoice1.id, itemId: mixer1.id, quantity: 2, unitPrice: 3500, totalPrice: 7000, description: 'Yamaha MG16XU Mixers' },
            { invoiceId: invoice1.id, itemId: movingHead.id, quantity: 10, unitPrice: 2500, totalPrice: 25000, description: 'Moving Head Lights' },
            { invoiceId: invoice1.id, itemId: parLight.id, quantity: 20, unitPrice: 800, totalPrice: 16000, description: 'LED PAR Lights' },
        ],
    });

    // 19. Create Payments
    await prisma.payment.create({
        data: {
            invoiceId: invoice1.id,
            amount: 100000,
            mode: 'BANK_TRANSFER',
            referenceNo: 'TXN20260205001',
            collectedById: adminUser.id,
            paymentDate: new Date('2026-02-05'),
        },
    });

    // 20. Create Checkout Logs
    console.log('📤 Creating checkout logs...');
    await prisma.checkoutLog.createMany({
        data: [
            { jobId: job1.id, itemId: speaker1.id, assignedToId: employee1.id, quantity: 4, status: 'CHECKED_OUT' },
            { jobId: job1.id, itemId: mixer1.id, assignedToId: employee1.id, quantity: 1, status: 'CHECKED_OUT' },
            { jobId: job1.id, itemId: movingHead.id, assignedToId: employee2.id, quantity: 6, status: 'CHECKED_OUT' },
        ],
    });

    // 21. Create Job Expenses
    console.log('💸 Creating job expenses...');
    await prisma.jobExpense.createMany({
        data: [
            {
                jobId: job1.id,
                title: 'Fuel for transport',
                amount: 2500,
                category: ExpenseCategory.FUEL,
                description: 'Diesel for equipment transport truck',
                recordedById: supervisorUser.id,
            },
            {
                jobId: job1.id,
                title: 'Team lunch',
                amount: 1200,
                category: ExpenseCategory.FOOD,
                description: 'Lunch for 4 team members',
                recordedById: supervisorUser.id,
            },
        ],
    });

    // 22. Create Wages
    console.log('💵 Creating wages...');
    await prisma.wage.createMany({
        data: [
            {
                employeeId: employee1.id,
                eventId: event1.id,
                amount: 6000,
                status: 'APPROVED',
                description: 'Sound Engineer - 3 days',
                breakdown: JSON.stringify({ days: 3, ratePerDay: 2000 }),
            },
            {
                employeeId: employee2.id,
                eventId: event1.id,
                amount: 5400,
                status: 'APPROVED',
                description: 'Lighting Technician - 3 days',
                breakdown: JSON.stringify({ days: 3, ratePerDay: 1800 }),
            },
            {
                employeeId: employee3.id,
                jobId: job1.id,
                amount: 2400,
                status: 'PAID',
                isPaid: true,
                paidAt: new Date('2026-02-05'),
                description: 'Stage setup - 2 days',
                breakdown: JSON.stringify({ days: 2, ratePerDay: 1200 }),
            },
        ],
    });

    // 23. Create Notifications
    console.log('🔔 Creating notifications...');
    await prisma.notification.createMany({
        data: [
            {
                userId: adminUser.id,
                title: 'New Job Request',
                message: 'Amit Singh requested to join Wedding Reception job',
                type: 'INFO',
                isRead: false,
            },
            {
                userId: supervisorUser.id,
                title: 'Payment Received',
                message: '₹1,00,000 received for College Fest invoice',
                type: 'SUCCESS',
                isRead: false,
            },
            {
                userId: employee1User.id,
                title: 'Job Assignment',
                message: 'You have been assigned to Corporate Annual Day event',
                type: 'INFO',
                isRead: true,
            },
        ],
    });

    // 24. Create Maintenance Logs
    await prisma.maintenanceLog.create({
        data: {
            itemId: mixer1.id,
            reportedById: employee1User.id,
            description: 'Channel 5 fader needs cleaning, crackling sound',
            cost: 500,
            status: ItemStatus.MAINTENANCE,
        },
    });

    // 25. Create Audit Logs
    await prisma.auditLog.createMany({
        data: [
            {
                userId: adminUser.id,
                action: 'CREATED_INVOICE',
                details: JSON.stringify({ invoiceId: invoice1.id, amount: 202400 }),
                ipAddress: '192.168.1.100',
            },
            {
                userId: supervisorUser.id,
                action: 'APPROVED_WAGE',
                details: JSON.stringify({ employeeId: employee1.id, amount: 6000 }),
                ipAddress: '192.168.1.101',
            },
        ],
    });

    console.log('✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Users: 5 (1 admin, 1 supervisor, 3 employees)');
    console.log('- Employees: 4');
    console.log('- Inventory Categories: 4');
    console.log('- Inventory Items: 11');
    console.log('- Jobs: 3');
    console.log('- Events: 1');
    console.log('- Quotations: 1');
    console.log('- Invoices: 1');
    console.log('- Payments: 1');
    console.log('\n🔐 Login Credentials:');
    console.log('Admin: admin@elitesound.com / Admin@123');
    console.log('Supervisor: supervisor@elitesound.com / Supervisor@123');
    console.log('Employee: rajesh@elitesound.com / Employee@123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
