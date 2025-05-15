import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function cleanup() {
  try {
    // Delete all billing records first due to relation constraints
    await prisma.billingRecord.deleteMany({});
    console.log('All billing records deleted');
    
    // Delete all billing history
    await prisma.billingHistory.deleteMany({});
    console.log('All billing history deleted');
    
    // Delete all lesson plans
    await prisma.lessonPlan.deleteMany({});
    console.log('All lesson plans deleted');
    
    // Delete all child profiles
    await prisma.childProfile.deleteMany({});
    console.log('All child profiles deleted');
    
    // Delete all subscriptions
    await prisma.subscription.deleteMany({});
    console.log('All subscriptions deleted');
    
    // Delete all users
    await prisma.user.deleteMany({});
    console.log('All users deleted');
    
    console.log('Database cleaned successfully');
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup(); 