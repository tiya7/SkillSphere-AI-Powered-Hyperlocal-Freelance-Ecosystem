import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  loginUser, registerUser, logoutUser, googleAuth,
  verifyTwoFactor, fetchMe, clearError,
  selectUser, selectIsAuthenticated, selectIsLoading,
  selectAuthError, selectRequiresTwoFactor, selectTwoFactorUserId,
  selectIsInitialized,
} from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);
  const requiresTwoFactor = useSelector(selectRequiresTwoFactor);
  const twoFactorUserId = useSelector(selectTwoFactorUserId);
  const isInitialized = useSelector(selectIsInitialized);

  const login = async (credentials) => {
    const result = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(result)) {
      if (!result.payload.requiresTwoFactor) {
        toast.success('Welcome back!');
        redirectByRole(result.payload.user?.role);
      }
    } else {
      toast.error(result.payload || 'Login failed');
    }
    return result;
  };

  const register = async (data) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Please check your email to verify.');
      navigate('/login');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
    return result;
  };

  const loginWithGoogle = async (credential, role) => {
    const result = await dispatch(googleAuth({ credential, role }));
    if (googleAuth.fulfilled.match(result)) {
      toast.success('Signed in with Google!');
      redirectByRole(result.payload.user?.role);
    } else {
      toast.error(result.payload || 'Google sign-in failed');
    }
    return result;
  };

  const verify2FA = async (token) => {
    const result = await dispatch(verifyTwoFactor({ userId: twoFactorUserId, token }));
    if (verifyTwoFactor.fulfilled.match(result)) {
      toast.success('Welcome back!');
      redirectByRole(result.payload.user?.role);
    } else {
      toast.error(result.payload || '2FA failed');
    }
    return result;
  };

  const logout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out');
    navigate('/login');
  };

  const refreshUser = () => dispatch(fetchMe());

  const redirectByRole = (role) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/dashboard');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    requiresTwoFactor,
    isInitialized,
    login,
    register,
    loginWithGoogle,
    verify2FA,
    logout,
    refreshUser,
    clearError: () => dispatch(clearError()),
    isFreelancer: user?.role === 'freelancer',
    isClient: user?.role === 'client',
    isAdmin: user?.role === 'admin',
    isEmailVerified: user?.isEmailVerified,
  };
};
