import prisma from '../db/prisma.js';

// Exporting functions to interact with the User model through Prisma
export const User = {
	findById: (id) => {
		return prisma.user.findUnique({
			where: { id }
		});
	},
	
	findByEmail: (email) => {
		return prisma.user.findUnique({
			where: { email }
		});
	},
	
	create: (userData) => {
		return prisma.user.create({
			data: userData
		});
	},
	
	update: (id, data) => {
		return prisma.user.update({
			where: { id },
			data
		});
	},
	
	delete: (id) => {
		return prisma.user.delete({
			where: { id }
		});
	}
};
