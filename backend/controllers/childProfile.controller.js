import { ChildProfile } from '../models/childProfile.model.js';

// Get all child profiles for a user
export const getChildProfiles = async (req, res) => {
  try {
    const userId = req.userId;
    const childProfiles = await ChildProfile.findByUserId(userId);
    
    res.status(200).json({
      success: true,
      childProfiles
    });
  } catch (error) {
    console.error('Error in getChildProfiles:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get a specific child profile
export const getChildProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const childProfile = await ChildProfile.findById(id);
    
    if (!childProfile) {
      return res.status(404).json({ success: false, message: 'Child profile not found' });
    }
    
    // Verify the profile belongs to the requesting user
    if (childProfile.userId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this profile' });
    }
    
    res.status(200).json({
      success: true,
      childProfile
    });
  } catch (error) {
    console.error('Error in getChildProfile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new child profile
export const createChildProfile = async (req, res) => {
  try {
    const { name, grade, interests, learningStyles } = req.body;
    const userId = req.userId;
    
    if (!name || !grade) {
      return res.status(400).json({ success: false, message: 'Name and grade are required' });
    }
    
    const childProfileData = {
      name,
      grade,
      interests: interests || [],
      learningStyles: learningStyles || [],
      userId
    };
    
    const childProfile = await ChildProfile.create(childProfileData);
    
    res.status(201).json({
      success: true,
      message: 'Child profile created successfully',
      childProfile
    });
  } catch (error) {
    console.error('Error in createChildProfile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update a child profile
export const updateChildProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, grade, interests, learningStyles } = req.body;
    
    // Verify the profile exists
    const existingProfile = await ChildProfile.findById(id);
    if (!existingProfile) {
      return res.status(404).json({ success: false, message: 'Child profile not found' });
    }
    
    // Verify the profile belongs to the requesting user
    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (grade) updateData.grade = grade;
    if (interests) updateData.interests = interests;
    if (learningStyles) updateData.learningStyles = learningStyles;
    
    const updatedProfile = await ChildProfile.update(id, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Child profile updated successfully',
      childProfile: updatedProfile
    });
  } catch (error) {
    console.error('Error in updateChildProfile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a child profile
export const deleteChildProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify the profile exists
    const existingProfile = await ChildProfile.findById(id);
    if (!existingProfile) {
      return res.status(404).json({ success: false, message: 'Child profile not found' });
    }
    
    // Verify the profile belongs to the requesting user
    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this profile' });
    }
    
    await ChildProfile.delete(id);
    
    res.status(200).json({
      success: true,
      message: 'Child profile deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteChildProfile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}; 