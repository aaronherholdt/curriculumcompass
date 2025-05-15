import { LessonPlan } from '../models/lessonPlan.model.js';
import { ChildProfile } from '../models/childProfile.model.js';

// Get all lesson plans for a user
export const getLessonPlans = async (req, res) => {
  try {
    const userId = req.userId;
    const { childProfileId } = req.query;
    
    let lessonPlans;
    if (childProfileId) {
      // Verify the child profile belongs to the user
      const childProfile = await ChildProfile.findById(childProfileId);
      if (!childProfile || childProfile.userId !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to access this child profile' 
        });
      }
      
      lessonPlans = await LessonPlan.findByChildProfileId(childProfileId);
    } else {
      lessonPlans = await LessonPlan.findByUserId(userId);
    }
    
    res.status(200).json({
      success: true,
      lessonPlans
    });
  } catch (error) {
    console.error('Error in getLessonPlans:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get a specific lesson plan
export const getLessonPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const lessonPlan = await LessonPlan.findById(id);
    
    if (!lessonPlan) {
      return res.status(404).json({ success: false, message: 'Lesson plan not found' });
    }
    
    // Verify the lesson plan belongs to a child profile of the requesting user
    const childProfile = await ChildProfile.findById(lessonPlan.childProfileId);
    if (!childProfile || childProfile.userId !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this lesson plan' 
      });
    }
    
    res.status(200).json({
      success: true,
      lessonPlan
    });
  } catch (error) {
    console.error('Error in getLessonPlan:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new lesson plan
export const createLessonPlan = async (req, res) => {
  try {
    const { title, subject, content, childProfileId } = req.body;
    
    if (!title || !subject || !childProfileId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, subject, and child profile ID are required' 
      });
    }
    
    // Verify the child profile belongs to the requesting user
    const childProfile = await ChildProfile.findById(childProfileId);
    if (!childProfile) {
      return res.status(404).json({ success: false, message: 'Child profile not found' });
    }
    
    if (childProfile.userId !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to create a lesson plan for this child profile' 
      });
    }
    
    const lessonPlanData = {
      title,
      subject,
      content: content || '',
      childProfileId
    };
    
    const lessonPlan = await LessonPlan.create(lessonPlanData);
    
    res.status(201).json({
      success: true,
      message: 'Lesson plan created successfully',
      lessonPlan
    });
  } catch (error) {
    console.error('Error in createLessonPlan:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update a lesson plan
export const updateLessonPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, content } = req.body;
    
    // Verify the lesson plan exists
    const existingLessonPlan = await LessonPlan.findById(id);
    if (!existingLessonPlan) {
      return res.status(404).json({ success: false, message: 'Lesson plan not found' });
    }
    
    // Verify the lesson plan belongs to a child profile of the requesting user
    const childProfile = await ChildProfile.findById(existingLessonPlan.childProfileId);
    if (!childProfile || childProfile.userId !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this lesson plan' 
      });
    }
    
    const updateData = {};
    if (title) updateData.title = title;
    if (subject) updateData.subject = subject;
    if (content !== undefined) updateData.content = content;
    
    const updatedLessonPlan = await LessonPlan.update(id, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Lesson plan updated successfully',
      lessonPlan: updatedLessonPlan
    });
  } catch (error) {
    console.error('Error in updateLessonPlan:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a lesson plan
export const deleteLessonPlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify the lesson plan exists
    const existingLessonPlan = await LessonPlan.findById(id);
    if (!existingLessonPlan) {
      return res.status(404).json({ success: false, message: 'Lesson plan not found' });
    }
    
    // Verify the lesson plan belongs to a child profile of the requesting user
    const childProfile = await ChildProfile.findById(existingLessonPlan.childProfileId);
    if (!childProfile || childProfile.userId !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this lesson plan' 
      });
    }
    
    await LessonPlan.delete(id);
    
    res.status(200).json({
      success: true,
      message: 'Lesson plan deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteLessonPlan:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}; 