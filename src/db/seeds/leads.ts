import { db } from '@/db';
import { leads } from '@/db/schema';

async function main() {
    const sampleLeads = [
        {
            email: 'priya.sharma@gmail.com',
            createdAt: new Date('2024-12-15T10:30:00Z').toISOString(),
        },
        {
            email: 'rajesh.kumar@yahoo.in',
            createdAt: new Date('2024-12-14T14:15:00Z').toISOString(),
        },
        {
            email: 'anita.singh@outlook.com',
            createdAt: new Date('2024-12-13T09:45:00Z').toISOString(),
        },
        {
            email: 'vikram.gupta@gmail.com',
            createdAt: new Date('2024-12-12T16:20:00Z').toISOString(),
        },
        {
            email: 'neha.agarwal@yahoo.in',
            createdAt: new Date('2024-12-11T11:00:00Z').toISOString(),
        },
        {
            email: 'amit.patel@gmail.com',
            createdAt: new Date('2024-12-10T13:45:00Z').toISOString(),
        },
        {
            email: 'kavya.reddy@outlook.com',
            createdAt: new Date('2024-12-09T08:30:00Z').toISOString(),
        },
        {
            email: 'rohit.verma@gmail.com',
            createdAt: new Date('2024-12-08T15:15:00Z').toISOString(),
        },
        {
            email: 'deepika.jain@yahoo.in',
            createdAt: new Date('2024-12-07T12:30:00Z').toISOString(),
        },
        {
            email: 'arjun.mehta@outlook.com',
            createdAt: new Date('2024-12-06T17:00:00Z').toISOString(),
        }
    ];

    await db.insert(leads).values(sampleLeads);
    
    console.log('✅ Leads seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});