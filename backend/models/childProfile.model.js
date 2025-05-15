import prisma from '../db/prisma.js';

export const ChildProfile = {
  findById: (id) => {
    return prisma.childProfile.findUnique({
      where: { id },
      include: {
        lessonPlans: true
      }
    });
  },
  
  findByUserId: (userId) => {
    return prisma.childProfile.findMany({
      where: { userId },
      include: {
        lessonPlans: {
          select: {
            id: true,
            title: true,
            subject: true,
            createdAt: true
          }
        }
      }
    });
  },
  
  create: (data) => {
    return prisma.childProfile.create({
      data,
      include: {
        lessonPlans: true
      }
    });
  },
  
  update: (id, data) => {
    return prisma.childProfile.update({
      where: { id },
      data,
      include: {
        lessonPlans: true
      }
    });
  },
  
  delete: (id) => {
    return prisma.childProfile.delete({
      where: { id }
    });
  }
}; 