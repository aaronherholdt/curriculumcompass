import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
} from "../sendgrid/emails.js";
import { User } from "../models/user.model.js";
import prisma from "../db/prisma.js";

export const signup = async (req, res) => {
	const { email, password, name } = req.body;

	try {
		if (!email || !password || !name) {
			throw new Error("All fields are required");
		}

		const userAlreadyExists = await User.findByEmail(email);

		if (userAlreadyExists) {
			return res.status(400).json({ success: false, message: "User already exists" });
		}

		const hashedPassword = await bcryptjs.hash(password, 10);
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
		const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		const user = await User.create({
			email,
			password: hashedPassword,
			name,
			verificationToken,
			verificationTokenExpiresAt,
		});

		// jwt
		await generateTokenAndSetCookie(res, user.id);

		await sendVerificationEmail(user.email, verificationToken);

		res.status(201).json({
			success: true,
			message: "User created successfully",
			user: {
				...user,
				password: undefined,
			},
		});
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
	}
};

export const verifyEmail = async (req, res) => {
	const { code } = req.body;
	try {
		const user = await prisma.user.findFirst({
			where: {
				verificationToken: code,
				verificationTokenExpiresAt: {
					gt: new Date()
				}
			}
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}

		const updatedUser = await User.update(user.id, {
			isVerified: true,
			verificationToken: null,
			verificationTokenExpiresAt: null,
		});

		await sendWelcomeEmail(updatedUser.email, updatedUser.name);

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...updatedUser,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findByEmail(email);
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}
		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		await generateTokenAndSetCookie(res, user.id);

		const updatedUser = await User.update(user.id, {
			lastLogin: new Date()
		});

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				...updatedUser,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("Error in login ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const logout = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findByEmail(email);

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetPasswordExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

		await User.update(user.id, {
			resetPasswordToken: resetToken,
			resetPasswordExpiresAt
		});

		// send email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await prisma.user.findFirst({
			where: {
				resetPasswordToken: token,
				resetPasswordExpiresAt: {
					gt: new Date()
				}
			}
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// update password
		const hashedPassword = await bcryptjs.hash(password, 10);

		await User.update(user.id, {
			password: hashedPassword,
			resetPasswordToken: null,
			resetPasswordExpiresAt: null
		});

		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ 
			success: true, 
			user: {
				...user,
				password: undefined
			} 
		});
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};
