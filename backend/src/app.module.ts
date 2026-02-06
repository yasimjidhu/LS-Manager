import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { JobAssignmentsModule } from './modules/job-assignments/job-assignments.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { WagesModule } from './modules/wages/wages.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { AuditModule } from './modules/audit/audit.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SettingsModule } from './modules/settings/settings.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { JobRequestsModule } from './modules/job-requests/job-requests.module';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { WagePoliciesModule } from './modules/wage-policies/wage-policies.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { JobExpensesModule } from './modules/job-expenses/job-expenses.module';
import { DiscussionModule } from './modules/discussion/discussion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    QuotationsModule,
    EmployeesModule,
    InventoryModule,
    JobsModule,
    JobAssignmentsModule,
    InvoicesModule,
    WagesModule,
    AttendanceModule,
    MaintenanceModule,
    AuditModule,
    ReportsModule,
    SettingsModule,
    CheckoutModule,
    NotificationsModule,
    JobRequestsModule,
    AnalyticsModule,
    WagePoliciesModule,
    JobExpensesModule,
    DiscussionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
