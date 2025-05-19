import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = async (res, userId) => {
	// Get user from database to include email in token
	const user = await import("../models/user.model.js").then(module => module.User.findById(userId));
	
	const token = jwt.sign(
		{ 
			userId: user.id, 
			email: user.email 
		}, 
		process.env.JWT_SECRET, 
		{
			expiresIn: "7d",
		}
	);

	res.cookie("token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production", // true in production (HTTPS)
		sameSite: "lax",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});

	return token;
};
