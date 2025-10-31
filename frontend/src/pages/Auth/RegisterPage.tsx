import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react';
import Button from '../../components/UI/Button';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  // Optional: only validate length if user provided a non-empty value
  driverLicenseNumber: yup
    .string()
    .nullable()
    .transform((val, origVal) => origVal === '' ? null : val)
    .test(
      'len-when-present',
      'Driver license number must be between 5 and 20 characters',
      function(val) {
        if (!val || val === '' || val === null) {
          return true; // Skip validation if empty
        }
        return val.length >= 5 && val.length <= 20;
      }
    ),
}).required();

type RegisterFormData = yup.InferType<typeof schema>;

const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      navigate('/dashboard');
    } catch (error: any) {
      if (error.response?.data?.message) {
        setError('root', {
          type: 'manual',
          message: error.response.data.message,
        });
      } else {
        setError('root', {
          type: 'manual',
          message: 'Registration failed. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">LP</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('firstName')}
                    id="firstName"
                    type="text"
                    className={`
                      appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 
                      placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                      focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm
                      ${errors.firstName ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}
                    `}
                    placeholder="First name"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-danger-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last name
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('lastName')}
                    id="lastName"
                    type="text"
                    className={`
                      appearance-none relative block w-full px-3 py-2 border border-gray-300 
                      placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                      focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm
                      ${errors.lastName ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}
                    `}
                    placeholder="Last name"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-danger-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`
                    appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 
                    placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                    focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm
                    ${errors.email ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}
                  `}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('phoneNumber')}
                  id="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  className={`
                    appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 
                    placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                    focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm
                    ${errors.phoneNumber ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}
                  `}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-danger-600">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="driverLicenseNumber" className="block text-sm font-medium text-gray-700">
                Driver's License Number (Optional)
              </label>
              <div className="mt-1">
                <input
                  {...register('driverLicenseNumber')}
                  id="driverLicenseNumber"
                  type="text"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 
                    placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                    focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your driver's license number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`
                    appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 
                    placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                    focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm
                    ${errors.password ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}
                  `}
                  placeholder="Create a password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`
                    appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 
                    placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
                    focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm
                    ${errors.confirmPassword ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}
                  `}
                  placeholder="Confirm your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-danger-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {errors.root && (
            <div className="rounded-md bg-danger-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-danger-800">
                    {errors.root.message}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full"
            >
              Create Account
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;



