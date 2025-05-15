import { ChildProfile } from '../models/childProfile.model.js';
import { LessonPlan } from '../models/lessonPlan.model.js';
import { Subscription } from '../models/subscription.model.js';

// Get all dashboard data for a user
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all child profiles for the user
    const childProfiles = await ChildProfile.findByUserId(userId);
    
    // Get all lesson plans for the user
    const lessonPlans = await LessonPlan.findByUserId(userId);
    
    // Get subscription information
    const subscription = await Subscription.findByUserId(userId);
    
    // Format the data to match the frontend expectations
    const formattedChildProfiles = childProfiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      grade: profile.grade,
      interests: profile.interests,
      learningStyles: profile.learningStyles,
      lessonPlans: profile.lessonPlans.length
    }));
    
    const formattedLessonPlans = lessonPlans.map(plan => ({
      id: plan.id,
      childId: plan.childProfile.id,
      title: plan.title,
      createdAt: plan.createdAt,
      subject: plan.subject
    }));
    
    // Format subscription data if it exists
    let subscriptionData = null;
    if (subscription) {
      subscriptionData = {
        plan: subscription.plan,
        price: `$${subscription.price.toFixed(2)}${subscription.plan !== 'Free' ? '/month' : ''}`,
        nextBillingDate: subscription.nextBillingDate ? 
          new Date(subscription.nextBillingDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) : null,
        paymentMethod: subscription.paymentMethod || 'None',
        billingHistory: subscription.billingHistory.map(record => ({
          date: new Date(record.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          plan: record.plan,
          amount: `$${record.amount.toFixed(2)}`,
          status: record.status
        }))
      };
    } else {
      // Create default free subscription if none exists
      subscriptionData = {
        plan: 'Free Plan',
        price: '$0.00',
        nextBillingDate: null,
        paymentMethod: 'None',
        billingHistory: []
      };
    }
    
    res.status(200).json({
      success: true,
      childProfiles: formattedChildProfiles,
      lessonPlans: formattedLessonPlans,
      subscription: subscriptionData
    });
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}; 