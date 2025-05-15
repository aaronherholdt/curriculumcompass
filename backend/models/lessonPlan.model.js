import prisma from '../db/prisma.js';

export const LessonPlan = {
  findById: (id) => {
    return prisma.lessonPlan.findUnique({
      where: { id },
      include: {
        childProfile: true
      }
    });
  },
  
  findByChildProfileId: (childProfileId) => {
    return prisma.lessonPlan.findMany({
      where: { childProfileId }
    });
  },

  findByUserId: (userId) => {
    return prisma.lessonPlan.findMany({
      where: {
        childProfile: {
          userId
        }
      },
      include: {
        childProfile: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  },
  
  create: (data) => {
    return prisma.lessonPlan.create({
      data
    });
  },
  
  update: (id, data) => {
    return prisma.lessonPlan.update({
      where: { id },
      data
    });
  },
  
  delete: (id) => {
    return prisma.lessonPlan.delete({
      where: { id }
    });
  }
}; 