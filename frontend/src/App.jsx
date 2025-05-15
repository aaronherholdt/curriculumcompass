import { Navigate, Route, Routes } from "react-router-dom";
import FloatingShape from "./components/FloatingShape";

import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PricingPage from "./pages/PricingPage";
import LandingPage from "./pages/LandingPage";
import CreateChildProfilePage from "./pages/CreateChildProfilePage";
import LessonSearchPage from "./pages/LessonSearchPage";
import CurriculumSearchPage from "./pages/CurriculumSearchPage";
import SearchResultsPage from "./pages/SearchResultsPage";

import LoadingSpinner from "./components/LoadingSpinner";

import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	if (!user.isVerified) {
		return <Navigate to='/verify-email' replace />;
	}

	return children;
};

// redirect authenticated users to the dashboard
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (isAuthenticated && user.isVerified) {
		return <Navigate to='/dashboard' replace />;
	}

	return children;
};

function App() {
	const { isCheckingAuth, checkAuth } = useAuthStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (isCheckingAuth) return <LoadingSpinner />;

	return (
		<div
			className='min-h-screen bg-gradient-to-br
    from-gray-900 via-green-900 to-emerald-900 relative overflow-hidden'
		>
			<FloatingShape color='bg-green-500' size='w-64 h-64' top='-5%' left='10%' delay={0} />
			<FloatingShape color='bg-emerald-500' size='w-48 h-48' top='70%' left='80%' delay={5} />
			<FloatingShape color='bg-lime-500' size='w-32 h-32' top='40%' left='-10%' delay={2} />

			<Routes>
				{/* Public home page */}
				<Route path='/' element={<LandingPage />} />
				
				{/* Child profile and curriculum search pages */}
				<Route path='/create-profile' element={<CreateChildProfilePage />} />
				<Route path='/curriculum-search' element={<CurriculumSearchPage />} />
				<Route path='/search-results' element={<SearchResultsPage />} />
				<Route 
					path='/lesson-search/:profileId' 
					element={
						<ProtectedRoute>
							<LessonSearchPage />
						</ProtectedRoute>
					}
				/>
				
				{/* Protected dashboard route */}
				<Route
					path='/dashboard'
					element={
						<ProtectedRoute>
							<DashboardPage />
						</ProtectedRoute>
					}
				/>
				
				{/* Auth pages with centered layout */}
				<Route
					path='/signup'
					element={
						<RedirectAuthenticatedUser>
							<div className="flex items-center justify-center min-h-screen w-full">
								<SignUpPage />
							</div>
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path='/login'
					element={
						<RedirectAuthenticatedUser>
							<div className="flex items-center justify-center min-h-screen w-full">
								<LoginPage />
							</div>
						</RedirectAuthenticatedUser>
					}
				/>
				<Route 
					path='/verify-email' 
					element={
						<div className="flex items-center justify-center min-h-screen w-full">
							<EmailVerificationPage />
						</div>
					} 
				/>
				<Route 
					path='/pricing' 
					element={<PricingPage />} 
				/>
				<Route
					path='/forgot-password'
					element={
						<RedirectAuthenticatedUser>
							<div className="flex items-center justify-center min-h-screen w-full">
								<ForgotPasswordPage />
							</div>
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path='/reset-password/:token'
					element={
						<RedirectAuthenticatedUser>
							<div className="flex items-center justify-center min-h-screen w-full">
								<ResetPasswordPage />
							</div>
						</RedirectAuthenticatedUser>
					}
				/>
				{/* catch all routes */}
				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
			<Toaster />
		</div>
	);
}

export default App;
