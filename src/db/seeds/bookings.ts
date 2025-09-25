import { db } from '@/db';
import { bookings } from '@/db/schema';

async function main() {
    const sampleBookings = [
        {
            name: 'Priya Sharma',
            email: 'priya.sharma@gmail.com',
            phone: '+91-9876543210',
            topic: 'Birth Chart Reading',
            preferredDate: new Date('2024-01-28').toISOString(),
            status: 'pending',
            createdAt: new Date('2024-01-18').toISOString(),
        },
        {
            name: 'Rajesh Kumar',
            email: 'rajesh.kumar@yahoo.com',
            phone: '+91-8765432109',
            topic: 'Career Consultation',
            preferredDate: new Date('2024-01-30').toISOString(),
            status: 'confirmed',
            createdAt: new Date('2024-01-17').toISOString(),
        },
        {
            name: 'Anita Patel',
            email: 'anita.patel@outlook.com',
            phone: '+91-7654321098',
            topic: 'Relationship Guidance',
            preferredDate: new Date('2024-02-02').toISOString(),
            status: 'pending',
            createdAt: new Date('2024-01-19').toISOString(),
        },
        {
            name: 'Vikram Singh',
            email: 'vikram.singh@gmail.com',
            phone: '+91-9543210987',
            topic: 'Health Astrology',
            preferredDate: new Date('2024-02-05').toISOString(),
            status: 'pending',
            createdAt: new Date('2024-01-16').toISOString(),
        },
        {
            name: 'Sunita Reddy',
            email: 'sunita.reddy@hotmail.com',
            phone: '+91-8432109876',
            topic: 'Birth Chart Reading',
            preferredDate: new Date('2024-01-31').toISOString(),
            status: 'confirmed',
            createdAt: new Date('2024-01-20').toISOString(),
        },
        {
            name: 'Arjun Gupta',
            email: 'arjun.gupta@gmail.com',
            phone: '+91-7321098765',
            topic: 'Career Consultation',
            preferredDate: new Date('2024-02-03').toISOString(),
            status: 'cancelled',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            name: 'Kavya Menon',
            email: 'kavya.menon@yahoo.in',
            phone: '+91-9210987654',
            topic: 'Relationship Guidance',
            preferredDate: new Date('2024-02-07').toISOString(),
            status: 'pending',
            createdAt: new Date('2024-01-21').toISOString(),
        },
        {
            name: 'Rohit Joshi',
            email: 'rohit.joshi@gmail.com',
            phone: '+91-8109876543',
            topic: 'Health Astrology',
            preferredDate: new Date('2024-02-04').toISOString(),
            status: 'pending',
            createdAt: new Date('2024-01-22').toISOString(),
        }
    ];

    await db.insert(bookings).values(sampleBookings);
    
    console.log('✅ Bookings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});