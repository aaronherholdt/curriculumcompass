import prisma from '../db/prisma.js';

export const Subscription = {
  findById: (id) => {
    return prisma.subscription.findUnique({
      where: { id },
      include: {
        billingHistory: {
          orderBy: {
            date: 'desc'
          }
        }
      }
    });
  },
  
  findByUserId: (userId) => {
    return prisma.subscription.findUnique({
      where: { userId },
      include: {
        billingHistory: {
          orderBy: {
            date: 'desc'
          }
        }
      }
    });
  },
  
  create: (data) => {
    return prisma.subscription.create({
      data,
      include: {
        billingHistory: true
      }
    });
  },
  
  update: (id, data) => {
    return prisma.subscription.update({
      where: { id },
      data,
      include: {
        billingHistory: true
      }
    });
  },
  
  addBillingRecord: (subscriptionId, billingData) => {
    return prisma.billingRecord.create({
      data: {
        ...billingData,
        subscriptionId
      }
    });
  },
  
  delete: (id) => {
    return prisma.subscription.delete({
      where: { id }
    });
  }
}; 