import { db } from '@/db';
import { payments } from '@/db/schema';

async function main() {
    const samplePayments = [
        {
            razorpayPaymentId: 'pay_MkN2oP3qR4sT5uV6',
            orderId: 2,
            amount: 5000,
            currency: 'INR',
            status: 'captured',
            method: 'card',
            email: 'sarah.wilson@techcorp.com',
            contact: '+918765432109',
            fees: 118,
            tax: 21,
            createdAt: new Date('2024-01-15T14:30:00').toISOString(),
        },
        {
            razorpayPaymentId: 'pay_AbC7dE8fG9hI0jK1',
            orderId: 3,
            amount: 7500,
            currency: 'INR',
            status: 'captured',
            method: 'upi',
            email: 'rahul.sharma@startup.io',
            contact: '+919876543210',
            fees: 178,
            tax: 32,
            createdAt: new Date('2024-01-18T10:15:00').toISOString(),
        },
        {
            razorpayPaymentId: 'pay_XyZ3mN4oP5qR6sT7',
            orderId: 4,
            amount: 12000,
            currency: 'INR',
            status: 'failed',
            method: 'netbanking',
            email: 'priya.patel@consulting.com',
            contact: '+917654321098',
            fees: null,
            tax: null,
            createdAt: new Date('2024-01-22T16:45:00').toISOString(),
        },
        {
            razorpayPaymentId: 'pay_LmN8oP9qR0sT1uV2',
            orderId: 5,
            amount: 8500,
            currency: 'INR',
            status: 'authorized',
            method: 'card',
            email: 'amit.kumar@enterprise.com',
            contact: '+918765432109',
            fees: 201,
            tax: 36,
            createdAt: new Date('2024-01-25T11:20:00').toISOString(),
        },
        {
            razorpayPaymentId: 'pay_DeF4gH5iJ6kL7mN8',
            orderId: 6,
            amount: 15000,
            currency: 'INR',
            status: 'captured',
            method: 'upi',
            email: 'maya.singh@tech.solutions',
            contact: '+919012345678',
            fees: 295,
            tax: 53,
            createdAt: new Date('2024-01-28T09:30:00').toISOString(),
        }
    ];

    await db.insert(payments).values(samplePayments);
    
    console.log('✅ Payments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});