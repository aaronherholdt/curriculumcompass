import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";

/**
 * Middleware to protect routes, ensuring only authenticated users can access.
 * Supports JWT in Authorization header (Bearer) or in an HttpOnly cookie named 'token'.
 */
export const protectRoute = async (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized - no token provided" 
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - invalid token" 
      });
    }

    // Set userId from token
    req.userId = decoded.userId;
    
    // Fetch the actual user data and attach to request
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Set the full user object
    req.user = user;
    
    next();
  } catch (error) {
    console.log("Error in authentication middleware:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
}; 