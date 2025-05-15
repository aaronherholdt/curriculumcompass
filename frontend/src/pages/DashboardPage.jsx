import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { formatDate } from "../utils/date";
import { useState, useEffect } from "react";
import axios from "axios";
import { 
	Users, Book, CreditCard, Plus, Edit, Download, Trash2, 
	Eye, LogOut, CheckCircle, AlertCircle, FileText
} from "lucide-react";
import React from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Add Profile Modal moved outside DashboardPage component
const AddProfileModal = React.forwardRef(({ newProfile, setNewProfile, setShowAddProfileModal, handleSaveProfile, isEditing }, ref) => {
	const [currentStep, setCurrentStep] = useState(1); // Step 1: Basic Info, Step 2: Interests, Step 3: Learning Styles
	const [isSaving, setIsSaving] = useState(false);
	
	// Expose the setIsSaving function to parent via ref
	React.useImperativeHandle(ref, () => ({
		setSaving: (value) => setIsSaving(value),
		resetStep: () => setCurrentStep(1), // Add a way to reset the step
	}));
	
	// Interest categories with sub-interests
	const interestCategories = [
		{
			name: "Science",
			subInterests: ["Physics", "Chemistry", "Biology", "Astronomy", "Earth Science"]
		},
		{
			name: "Arts",
			subInterests: ["Drawing", "Painting", "Music", "Dance", "Theater"]
		},
		{
			name: "Languages",
			subInterests: ["English", "Spanish", "French", "Chinese", "Sign Language"]
		},
		{
			name: "Mathematics",
			subInterests: ["Algebra", "Geometry", "Statistics", "Calculus"]
		},
		{
			name: "Social Studies",
			subInterests: ["History", "Geography", "Civics", "Economics"]
		}
	];
	
	// Learning style options
	const learningStyles = [
		"Visual", "Auditory", "Reading/Writing", "Kinesthetic", 
		"Logical", "Social", "Solitary"
	];
	
	// Selected category for sub-interests
	const [selectedCategory, setSelectedCategory] = useState(null);

	// Handle interest category selection
	const handleCategorySelect = (category) => {
		setSelectedCategory(category);
	};

	// Handle sub-interest selection
	const handleSubInterestToggle = (subInterest) => {
		if (newProfile.interests.includes(subInterest)) {
			// Remove if already selected
			setNewProfile({
				...newProfile,
				interests: newProfile.interests.filter(interest => interest !== subInterest)
			});
		} else {
			// Add if not selected
			setNewProfile({
				...newProfile,
				interests: [...newProfile.interests, subInterest]
			});
		}
	};

	// Handle learning style selection
	const handleLearningStyleToggle = (style) => {
		if (newProfile.learningStyles.includes(style)) {
			// Remove if already selected
			setNewProfile({
				...newProfile,
				learningStyles: newProfile.learningStyles.filter(s => s !== style)
			});
		} else {
			// Add if not selected
			setNewProfile({
				...newProfile,
				learningStyles: [...newProfile.learningStyles, style]
			});
		}
	};
	
	// Continue to next step
	const handleContinue = () => {
		if (currentStep < 3) {
			setCurrentStep(currentStep + 1);
		} else {
			// On final step, create or update the profile
			setIsSaving(true);
			handleSaveProfile(); // Use the passed-in save handler
		}
	};
	
	// Go back to previous step
	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
			// Clear selected category if going back from sub-interests
			if (currentStep === 2) {
				setSelectedCategory(null);
			}
		}
	};
	
	// Render different steps
	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					// Basic Info Step
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-1">Child's Name</label>
							<input 
								type="text"
								value={newProfile.name}
								onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
								className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
								text-white focus:outline-none focus:ring-2 focus:ring-green-500"
								placeholder="Enter child's name"
							/>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-1">Grade Level</label>
							<select
								value={newProfile.grade}
								onChange={(e) => setNewProfile({...newProfile, grade: e.target.value})}
								className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
								text-white focus:outline-none focus:ring-2 focus:ring-green-500"
							>
								<option>Kindergarten</option>
								<option>Grade 1</option>
								<option>Grade 2</option>
								<option>Grade 3</option>
								<option>Grade 4</option>
								<option>Grade 5</option>
								<option>Grade 6</option>
								<option>Grade 7</option>
								<option>Grade 8</option>
								<option>Grade 9</option>
								<option>Grade 10</option>
								<option>Grade 11</option>
								<option>Grade 12</option>
							</select>
						</div>
					</div>
				);
			case 2:
				return (
					// Interests Step
					<div className="space-y-4">
						<h4 className="text-lg font-medium text-green-400 mb-2">Select Interests</h4>
						
						{!selectedCategory ? (
							// Show main categories if no category is selected
							<div className="grid grid-cols-2 gap-3">
								{interestCategories.map((category) => (
									<motion.button
										key={category.name}
										whileHover={{ scale: 1.03 }}
										whileTap={{ scale: 0.97 }}
										onClick={() => handleCategorySelect(category)}
										className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 text-left"
									>
										<p className="font-medium text-white">{category.name}</p>
										<p className="text-xs text-gray-400 mt-1">{category.subInterests.length} topics</p>
									</motion.button>
								))}
							</div>
						) : (
							// Show sub-interests for selected category
							<div>
								<div className="flex items-center mb-3">
									<button 
										onClick={() => setSelectedCategory(null)}
										className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
									>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
										</svg>
										Back to Categories
									</button>
								</div>
								
								<h5 className="text-md font-medium text-white mb-2">{selectedCategory.name}</h5>
								
								<div className="grid grid-cols-2 gap-2">
									{selectedCategory.subInterests.map((subInterest) => {
										const isSelected = newProfile.interests.includes(subInterest);
										return (
											<motion.button
												key={subInterest}
												whileHover={{ scale: 1.03 }}
												whileTap={{ scale: 0.97 }}
												onClick={() => handleSubInterestToggle(subInterest)}
												className={`p-2 rounded-lg text-left border ${
													isSelected 
														? 'bg-green-600 bg-opacity-20 border-green-500' 
														: 'bg-gray-700 border-gray-600 hover:bg-gray-600'
												}`}
											>
												<div className="flex items-center">
													<div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${
														isSelected ? 'bg-green-500' : 'bg-gray-600'
													}`}>
														{isSelected && (
															<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
															</svg>
														)}
													</div>
													<span className={`${isSelected ? 'text-green-400' : 'text-white'}`}>
														{subInterest}
													</span>
												</div>
											</motion.button>
										);
									})}
								</div>
							</div>
						)}
						
						{/* Show selected interests */}
						{newProfile.interests.length > 0 && (
							<div className="mt-4">
								<p className="text-sm text-gray-400 mb-2">Selected Interests ({newProfile.interests.length})</p>
								<div className="flex flex-wrap gap-2">
									{newProfile.interests.map(interest => (
										<span key={interest} className="text-xs px-2 py-1 bg-green-600 bg-opacity-30 border border-green-500 rounded-full text-green-400">
											{interest}
										</span>
									))}
								</div>
							</div>
						)}
					</div>
				);
			case 3:
				return (
					// Learning Styles Step
					<div className="space-y-4">
						<h4 className="text-lg font-medium text-green-400 mb-2">Learning Styles</h4>
						<p className="text-sm text-gray-400 mb-3">Select learning styles that best fit your child</p>
						
						<div className="grid grid-cols-2 gap-2">
							{learningStyles.map((style) => {
								const isSelected = newProfile.learningStyles.includes(style);
								return (
									<motion.button
										key={style}
										whileHover={{ scale: 1.03 }}
										whileTap={{ scale: 0.97 }}
										onClick={() => handleLearningStyleToggle(style)}
										className={`p-2 rounded-lg text-left border ${
											isSelected 
												? 'bg-blue-600 bg-opacity-20 border-blue-500' 
												: 'bg-gray-700 border-gray-600 hover:bg-gray-600'
										}`}
									>
										<div className="flex items-center">
											<div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${
												isSelected ? 'bg-blue-500' : 'bg-gray-600'
											}`}>
												{isSelected && (
													<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
													</svg>
												)}
											</div>
											<span className={`${isSelected ? 'text-blue-400' : 'text-white'}`}>
												{style}
											</span>
										</div>
									</motion.button>
								);
							})}
						</div>
						
						{/* Show selected learning styles */}
						{newProfile.learningStyles.length > 0 && (
							<div className="mt-4">
								<p className="text-sm text-gray-400 mb-2">Selected Learning Styles ({newProfile.learningStyles.length})</p>
								<div className="flex flex-wrap gap-2">
									{newProfile.learningStyles.map(style => (
										<span key={style} className="text-xs px-2 py-1 bg-blue-600 bg-opacity-30 border border-blue-500 rounded-full text-blue-400">
											{style}
										</span>
									))}
								</div>
							</div>
						)}
					</div>
				);
			default:
				return null;
		}
	};
	
	// Progress indicator
	const renderProgressIndicator = () => (
		<div className="flex justify-between mb-6">
			{[1, 2, 3].map((step) => (
				<div key={step} className="flex items-center">
					<div className={`w-8 h-8 rounded-full flex items-center justify-center ${
						step === currentStep 
							? 'bg-green-500 text-white' 
							: step < currentStep 
								? 'bg-green-700 text-white' 
								: 'bg-gray-700 text-gray-400'
					}`}>
						{step < currentStep ? (
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						) : (
							step
						)}
					</div>
					
					{step < 3 && (
						<div className={`h-1 w-8 ${
							step < currentStep ? 'bg-green-500' : 'bg-gray-700'
						}`} />
					)}
				</div>
			))}
		</div>
	);
	
	return (
		<div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
			<motion.div 
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
			>
				<h3 className="text-xl font-bold text-green-400 mb-2">{isEditing ? "Edit Child Profile" : "Add Child Profile"}</h3>
				<p className="text-gray-400 text-sm mb-4">
					{currentStep === 1 && (isEditing ? "Update basic information" : "Basic information about your child")}
					{currentStep === 2 && (isEditing ? "Update interests" : "Select topics your child is interested in")}
					{currentStep === 3 && (isEditing ? "Update learning styles" : "How does your child learn best?")}
				</p>
				
				{renderProgressIndicator()}
				
				<div className="min-h-[260px]">
					{renderStepContent()}
				</div>
				
				<div className="flex justify-between mt-6 gap-3">
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={currentStep === 1 ? () => setShowAddProfileModal(false) : handleBack}
						className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
						disabled={isSaving}
					>
						{currentStep === 1 ? "Cancel" : "Back"}
					</motion.button>
					
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleContinue}
						disabled={
							isSaving ||
							(currentStep === 1 && !newProfile.name) ||
							(currentStep === 3 && newProfile.learningStyles.length === 0)
						}
						className={`px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
						font-medium rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700
						focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800
						${(isSaving || (currentStep === 1 && !newProfile.name) || (currentStep === 3 && newProfile.learningStyles.length === 0)) 
							? 'opacity-50 cursor-not-allowed' : ''}`}
					>
						{isSaving ? (
							<span className="flex items-center">
								<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Saving...
							</span>
						) : (
							currentStep < 3 ? "Continue" : (isEditing ? "Save Changes" : "Create Profile")
						)}
					</motion.button>
				</div>
			</motion.div>
		</div>
	);
});

const DashboardPage = () => {
	const { user, logout } = useAuthStore();
	const [activeTab, setActiveTab] = useState("profiles");
	const [selectedChild, setSelectedChild] = useState(null);
	const [showAddProfileModal, setShowAddProfileModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	
	// State for data from API
	const [childProfiles, setChildProfiles] = useState([]);
	const [lessonPlans, setLessonPlans] = useState([]);
	const [subscriptionData, setSubscriptionData] = useState(null);
	
	// State for add/edit profile form
	const [newProfile, setNewProfile] = useState({
		name: "",
		grade: "Kindergarten",
		interests: [],
		learningStyles: []
	});
	const [isEditing, setIsEditing] = useState(false);
	const [currentEditingProfileId, setCurrentEditingProfileId] = useState(null);
	
	// Create a ref for the add profile modal
	const modalRef = React.useRef();
	
	// Fetch dashboard data
	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setLoading(true);
				setError(null);
				
				const response = await axios.get(`${API_BASE_URL}/dashboard`, {
					withCredentials: true
				});
				
				if (response.data.success) {
					setChildProfiles(response.data.childProfiles);
					setLessonPlans(response.data.lessonPlans);
					setSubscriptionData(response.data.subscription);
				} else {
					setError("Failed to load dashboard data");
				}
			} catch (err) {
				console.error("Error fetching dashboard data:", err);
				setError("Failed to load dashboard data. Please try again.");
			} finally {
				setLoading(false);
			}
		};
		
		fetchDashboardData();
	}, []);
	
	// Handle profile creation or update
	const handleSaveProfile = async () => {
		// modalRef.current?.setSaving(true) is called from within modal's handleContinue
		// setLoading(true) here might be redundant if modal handles its own saving state visually
		try {
			setError(null);
			let response;
			
			if (isEditing) {
				// Update existing profile
				response = await axios.put(
					`${API_BASE_URL}/child-profiles/${currentEditingProfileId}`,
					{
						name: newProfile.name,
						grade: newProfile.grade,
						interests: newProfile.interests,
						learningStyles: newProfile.learningStyles
					},
					{ withCredentials: true }
				);
				
				if (response.data.success) {
					setChildProfiles(childProfiles.map(profile => 
						profile.id === currentEditingProfileId ? response.data.childProfile : profile
					));
				}
			} else {
				// Create new profile
				response = await axios.post(
					`${API_BASE_URL}/child-profiles`,
					{
						name: newProfile.name,
						grade: newProfile.grade,
						interests: newProfile.interests,
						learningStyles: newProfile.learningStyles
					},
					{ withCredentials: true }
				);
				
				if (response.data.success) {
					setChildProfiles([...childProfiles, response.data.childProfile]);
				}
			}
			
			if (response.data.success) {
				setNewProfile({
					name: "",
					grade: "Kindergarten",
					interests: [],
					learningStyles: []
				});
				setShowAddProfileModal(false);
				setIsEditing(false);
				setCurrentEditingProfileId(null);
				modalRef.current?.resetStep(); // Reset modal step
				// Optionally, show success notification
			} else {
				setError(response.data.message || `Failed to ${isEditing ? 'update' : 'create'} profile`);
				if (modalRef.current) {
					modalRef.current.setSaving(false);
				}
			}
		} catch (err) {
			console.error(`Error ${isEditing ? 'updating' : 'creating'} profile:`, err);
			setError(`Failed to ${isEditing ? 'update' : 'create'} profile. Please try again.`);
			if (modalRef.current) {
				modalRef.current.setSaving(false);
			}
		} finally {
			// setLoading(false); // If you set loading(true) at the start of this func
		}
	};

	const handleOpenAddModal = () => {
		setIsEditing(false);
		setCurrentEditingProfileId(null);
		setNewProfile({ // Reset form for adding
			name: "",
			grade: "Kindergarten",
			interests: [],
			learningStyles: []
		});
		modalRef.current?.resetStep();
		setShowAddProfileModal(true);
	};

	const handleOpenEditModal = (profile) => {
		setIsEditing(true);
		setCurrentEditingProfileId(profile.id);
		setNewProfile({ // Populate form for editing
			name: profile.name,
			grade: profile.grade,
			interests: profile.interests || [],
			learningStyles: profile.learningStyles || []
		});
		modalRef.current?.resetStep();
		setShowAddProfileModal(true);
	};
	
	// Handle profile deletion
	const handleDeleteProfile = async (profileId) => {
		if (window.confirm("Are you sure you want to delete this profile? This action cannot be undone.")) {
			try {
				setLoading(true);
				setError(null);
				
				const response = await axios.delete(
					`${API_BASE_URL}/child-profiles/${profileId}`,
					{ withCredentials: true }
				);
				
				if (response.data.success) {
					setChildProfiles(childProfiles.filter(profile => profile.id !== profileId));
					// Optionally, show a success notification here
				} else {
					setError(response.data.message || "Failed to delete profile");
				}
			} catch (err) {
				console.error("Error deleting profile:", err);
				setError("Failed to delete profile. Please try again.");
			} finally {
				setLoading(false);
			}
		}
	};
	
	const handleLogout = () => {
		logout();
	};
	
	// Select child and show lesson plans
	const viewChildLessonPlans = (childId) => {
		setSelectedChild(childId);
		setActiveTab("lessons");
	};
	
	const getChildNameById = (childId) => {
		const child = childProfiles.find(p => p.id === childId);
		return child ? child.name : "";
	};
	
	// Components for different tabs
	const ChildProfilesTab = () => (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h3 className="text-xl font-semibold text-green-400">Child Profiles</h3>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={handleOpenAddModal}
					className="py-2 px-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
					font-medium rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700
					focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900
					flex items-center"
				>
					<Plus size={18} className="mr-1" />
					Add Profile
				</motion.button>
			</div>
			
			{loading ? (
				<div className="p-6 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 text-center">
					<p className="text-gray-300">Loading profiles...</p>
				</div>
			) : error ? (
				<div className="p-6 bg-gray-800 bg-opacity-50 rounded-lg border border-red-700 text-center">
					<AlertCircle size={40} className="mx-auto mb-2 text-red-500" />
					<h4 className="text-lg font-semibold text-white mb-2">Error Loading Profiles</h4>
					<p className="text-gray-400 mb-4">{error}</p>
				</div>
			) : childProfiles.length === 0 ? (
				<div className="p-6 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 text-center">
					<Users size={40} className="mx-auto mb-2 text-gray-500" />
					<h4 className="text-lg font-semibold text-white mb-2">No Child Profiles Yet</h4>
					<p className="text-gray-400 mb-4">Create your first child profile to get started</p>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleOpenAddModal}
						className="py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
						font-medium rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700
						focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900
						inline-flex items-center"
					>
						<Plus size={18} className="mr-1" />
						Add Profile
					</motion.button>
				</div>
			) : (
				<div className="grid gap-4">
					{childProfiles.map(profile => (
						<motion.div
							key={profile.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700"
						>
							<div className="flex justify-between mb-2">
								<h4 className="text-lg font-semibold text-white">{profile.name}</h4>
								<span className="text-xs font-medium px-2 py-1 bg-gray-700 rounded-full text-green-400">
									{profile.grade}
								</span>
							</div>
							
							<div className="mb-2">
								<span className="text-xs text-gray-400">Interests:</span>
								<div className="flex flex-wrap gap-1 mt-1">
									{profile.interests.map(interest => (
										<span key={interest} className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-green-300">
											{interest}
										</span>
									))}
									{profile.interests.length === 0 && (
										<span className="text-xs text-gray-500">None specified</span>
									)}
								</div>
							</div>
							
							<div className="mb-3">
								<span className="text-xs text-gray-400">Learning Styles:</span>
								<div className="flex flex-wrap gap-1 mt-1">
									{profile.learningStyles.map(style => (
										<span key={style} className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-blue-300">
											{style}
										</span>
									))}
									{profile.learningStyles.length === 0 && (
										<span className="text-xs text-gray-500">None specified</span>
									)}
								</div>
							</div>
							
							<div className="flex justify-between items-center mt-3">
								<span className="text-sm text-gray-300">
									{profile.lessonPlans.length} {profile.lessonPlans.length === 1 ? "Lesson Plan" : "Lesson Plans"}
								</span>
								
								<div className="flex gap-2">
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										onClick={() => viewChildLessonPlans(profile.id)}
										className="p-1.5 bg-green-600 text-white rounded-md hover:bg-green-700"
										title="View Lesson Plans"
									>
										<Eye size={16} />
									</motion.button>
									
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										onClick={() => handleOpenEditModal(profile)}
										className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
										title="Edit Profile"
									>
										<Edit size={16} />
									</motion.button>
									
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700"
										title="Delete Profile"
										onClick={() => handleDeleteProfile(profile.id)}
									>
										<Trash2 size={16} />
									</motion.button>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			)}
		</div>
	);

	const LessonPlansTab = () => {
		const filteredLessonPlans = selectedChild 
			? lessonPlans.filter(plan => plan.childId === selectedChild)
			: lessonPlans;
			
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h3 className="text-xl font-semibold text-green-400">
						{selectedChild ? `Lesson Plans for ${getChildNameById(selectedChild)}` : "All Lesson Plans"}
					</h3>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="py-2 px-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
						font-medium rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700
						focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900
						flex items-center"
					>
						<Plus size={18} className="mr-1" />
						Create Lesson Plan
					</motion.button>
				</div>
				
				{loading ? (
					<div className="p-6 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 text-center">
						<p className="text-gray-300">Loading lesson plans...</p>
					</div>
				) : error ? (
					<div className="p-6 bg-gray-800 bg-opacity-50 rounded-lg border border-red-700 text-center">
						<AlertCircle size={40} className="mx-auto mb-2 text-red-500" />
						<h4 className="text-lg font-semibold text-white mb-2">Error Loading Lesson Plans</h4>
						<p className="text-gray-400 mb-4">{error}</p>
					</div>
				) : filteredLessonPlans.length === 0 ? (
					<div className="p-6 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 text-center">
						<FileText size={40} className="mx-auto mb-2 text-gray-500" />
						<h4 className="text-lg font-semibold text-white mb-2">No Lesson Plans Yet</h4>
						<p className="text-gray-400 mb-4">Create your first lesson plan to get started</p>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
							font-medium rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700
							focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900
							inline-flex items-center"
						>
							<Plus size={18} className="mr-1" />
							Create Lesson Plan
						</motion.button>
					</div>
				) : (
					<div className="grid gap-4">
						{filteredLessonPlans.map(plan => (
							<motion.div
								key={plan.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700"
							>
								<div className="flex justify-between mb-2">
									<h4 className="text-lg font-semibold text-white">{plan.title}</h4>
									<span className="text-xs font-medium px-2 py-1 bg-gray-700 rounded-full text-green-400">
										{plan.subject}
									</span>
								</div>
								
								<div className="mb-3">
									<span className="text-sm text-gray-300">
										Created on {new Date(plan.createdAt).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric"
										})}
									</span>
								</div>
								
								<div className="flex justify-end gap-2 mt-2">
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="py-1.5 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 
										flex items-center text-sm"
									>
										<Eye size={16} className="mr-1" />
										View
									</motion.button>
									
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="py-1.5 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 
										flex items-center text-sm"
									>
										<Download size={16} className="mr-1" />
										Download PDF
									</motion.button>
								</div>
							</motion.div>
						))}
					</div>
				)}
			</div>
		);
	};

	const SubscriptionTab = () => {
		if (loading) {
			return (
				<div className="p-6 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 text-center">
					<p className="text-gray-300">Loading subscription data...</p>
				</div>
			);
		}
		
		if (error) {
			return (
				<div className="p-6 bg-gray-800 bg-opacity-50 rounded-lg border border-red-700 text-center">
					<AlertCircle size={40} className="mx-auto mb-2 text-red-500" />
					<h4 className="text-lg font-semibold text-white mb-2">Error Loading Subscription</h4>
					<p className="text-gray-400 mb-4">{error}</p>
				</div>
			);
		}
		
		return (
			<div className="space-y-6">
				<h3 className="text-xl font-semibold text-green-400">Subscription Details</h3>
				
				<div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div>
							<span className="text-sm text-gray-400">Plan Type</span>
							<p className="text-white font-semibold">{subscriptionData?.plan || 'Free Plan'}</p>
						</div>
						<div>
							<span className="text-sm text-gray-400">Price</span>
							<p className="text-white font-semibold">{subscriptionData?.price || '$0.00'}</p>
						</div>
						<div>
							<span className="text-sm text-gray-400">Next Billing Date</span>
							<p className="text-white font-semibold">{subscriptionData?.nextBillingDate || 'N/A'}</p>
						</div>
						<div>
							<span className="text-sm text-gray-400">Payment Method</span>
							<p className="text-white font-semibold">{subscriptionData?.paymentMethod || 'None'}</p>
						</div>
					</div>
					
					<div className="flex gap-3 mt-4">
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="py-2 px-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
							font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700
							focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
							flex items-center text-sm"
						>
							Update Payment Method
						</motion.button>
						
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="py-2 px-3 bg-gray-700 text-white 
							font-medium rounded-lg shadow-md hover:bg-gray-600
							focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900
							flex items-center text-sm"
						>
							Cancel Subscription
						</motion.button>
					</div>
				</div>
				
				<h3 className="text-xl font-semibold text-green-400 mt-6">Billing History</h3>
				
				{(subscriptionData?.billingHistory?.length || 0) > 0 ? (
					<div className="bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 overflow-hidden">
						<table className="w-full">
							<thead className="bg-gray-700 bg-opacity-50">
								<tr>
									<th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Date</th>
									<th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Plan</th>
									<th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Amount</th>
									<th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Status</th>
								</tr>
							</thead>
							<tbody>
								{subscriptionData?.billingHistory?.map((item, index) => (
									<tr key={index} className="border-t border-gray-700">
										<td className="py-2 px-4 text-sm text-gray-300">{item.date}</td>
										<td className="py-2 px-4 text-sm text-gray-300">{item.plan}</td>
										<td className="py-2 px-4 text-sm text-gray-300">{item.amount}</td>
										<td className="py-2 px-4 text-sm">
											<span className="inline-flex items-center text-green-400">
												<CheckCircle size={14} className="mr-1" />
												{item.status}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 text-center">
						<p className="text-gray-400">No billing history available</p>
					</div>
				)}
			</div>
		);
	};
	
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ duration: 0.5 }}
			className="max-w-3xl w-full mx-auto mt-8 p-6 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800"
		>
			{/* Header with user info and logout */}
			<div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
				<div>
					<h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
						Curriculum Compass
					</h2>
					<p className="text-gray-400">Welcome back, {user.name}</p>
				</div>
				
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={handleLogout}
					className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white"
					title="Logout"
				>
					<LogOut size={20} />
				</motion.button>
			</div>
			
			{/* Tab navigation */}
			<div className="flex border-b border-gray-800 mb-6">
				<button
					className={`px-4 py-2 font-medium text-sm flex items-center ${
						activeTab === "profiles" 
							? "text-green-400 border-b-2 border-green-400" 
							: "text-gray-400 hover:text-gray-300"
					}`}
					onClick={() => setActiveTab("profiles")}
				>
					<Users size={18} className="mr-2" />
					Child Profiles
				</button>
				
				<button
					className={`px-4 py-2 font-medium text-sm flex items-center ${
						activeTab === "lessons" 
							? "text-green-400 border-b-2 border-green-400" 
							: "text-gray-400 hover:text-gray-300"
					}`}
					onClick={() => {
						setActiveTab("lessons");
						setSelectedChild(null);
					}}
				>
					<Book size={18} className="mr-2" />
					Lesson Plans
				</button>
				
				<button
					className={`px-4 py-2 font-medium text-sm flex items-center ${
						activeTab === "subscription" 
							? "text-green-400 border-b-2 border-green-400" 
							: "text-gray-400 hover:text-gray-300"
					}`}
					onClick={() => setActiveTab("subscription")}
				>
					<CreditCard size={18} className="mr-2" />
					Subscription
				</button>
			</div>
			
			{/* Tab content */}
			<div className="mt-4">
				{activeTab === "profiles" && <ChildProfilesTab />}
				{activeTab === "lessons" && <LessonPlansTab />}
				{activeTab === "subscription" && <SubscriptionTab />}
			</div>
			
			{/* Add Profile Modal with props */}
			{showAddProfileModal && (
				<AddProfileModal 
					newProfile={newProfile}
					setNewProfile={setNewProfile}
					setShowAddProfileModal={setShowAddProfileModal}
					handleSaveProfile={handleSaveProfile}
					isEditing={isEditing}
					ref={modalRef}
				/>
			)}
		</motion.div>
	);
};

export default DashboardPage;
