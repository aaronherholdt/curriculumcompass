import prisma from './prisma.js';

export const connectDB = async () => {
	try {
		await prisma.$connect();
		console.log(`PostgreSQL Connected via Prisma`);
	} catch (error) {
		console.log("Error connecting to PostgreSQL: ", error.message);
		process.exit(1); // 1 is failure, 0 status code is success
	}
};
