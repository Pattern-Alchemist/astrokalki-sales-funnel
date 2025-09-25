import { db } from '@/db';
import { orders } from '@/db/schema';

async function main() {
    const sampleOrders = [
        {
            razorpayOrderId: 'order_P1a2b3c4d5e6f7g8',
            amount: 99900,
            currency: 'INR',
            status: 'created',
            product: 'Premium Consultation',
            receipt: 'rcpt_1737289200001',
            notes: JSON.stringify({ consultation_type: 'premium', duration: '60min' }),
            bookingId: 1,
            createdAt: new Date('2024-01-15T10:30:00').toISOString(),
        },
        {
            razorpayOrderId: 'order_Q2b3c4d5e6f7g8h9',
            amount: 199900,
            currency: 'INR',
            status: 'created',
            product: 'Detailed Analysis',
            receipt: 'rcpt_1737375600002',
            notes: JSON.stringify({ consultation_type: 'detailed', includes: 'report' }),
            bookingId: 2,
            createdAt: new Date('2024-01-16T14:15:00').toISOString(),
        },
        {
            razorpayOrderId: 'order_R3c4d5e6f7g8h9i0',
            amount: 49900,
            currency: 'INR',
            status: 'paid',
            product: 'Basic Reading',
            receipt: 'rcpt_1737462000003',
            notes: JSON.stringify({ consultation_type: 'basic', duration: '30min' }),
            bookingId: 3,
            createdAt: new Date('2024-01-17T09:45:00').toISOString(),
        },
        {
            razorpayOrderId: 'order_S4d5e6f7g8h9i0j1',
            amount: 149900,
            currency: 'INR',
            status: 'paid',
            product: 'Premium Consultation',
            receipt: 'rcpt_1737548400004',
            notes: JSON.stringify({ consultation_type: 'premium', includes: 'followup' }),
            bookingId: null,
            createdAt: new Date('2024-01-18T16:20:00').toISOString(),
        },
        {
            razorpayOrderId: 'order_T5e6f7g8h9i0j1k2',
            amount: 79900,
            currency: 'INR',
            status: 'paid',
            product: 'Relationship Reading',
            receipt: 'rcpt_1737634800005',
            notes: JSON.stringify({ consultation_type: 'relationship', focus: 'compatibility' }),
            bookingId: null,
            createdAt: new Date('2024-01-19T11:30:00').toISOString(),
        },
        {
            razorpayOrderId: 'order_U6f7g8h9i0j1k2l3',
            amount: 99900,
            currency: 'INR',
            status: 'failed',
            product: 'Career Guidance',
            receipt: 'rcpt_1737721200006',
            notes: JSON.stringify({ consultation_type: 'career', focus: 'growth_opportunities' }),
            bookingId: null,
            createdAt: new Date('2024-01-20T13:45:00').toISOString(),
        }
    ];

    await db.insert(orders).values(sampleOrders);
    
    console.log('✅ Orders seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});