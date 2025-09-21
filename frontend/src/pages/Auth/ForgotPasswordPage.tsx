import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

const schema = yup.object({
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
}).required();

type ForgotPasswordFormData = yup.InferType<typeof schema>;

const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const { register, handleSubmit, formState: { errors }, setError } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setEmail(data.email);
      await forgotPassword(data.email);
      setIsSubmitted(true);
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.message || 'Failed to send reset email. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-success-600">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Check your email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="mt-2 text-center text-sm text-gray-500">
              If you don't see the email, check your spam folder.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsSubmitted(false)}
              className="w-full"
            >
              Send another email
            </Button>
            <Link
              to="/login"
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 text-primary-600">
            <Mail className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Input
              label="Email address"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              error={errors.email?.message}
              required
            />
          </div>

          {errors.root && (
            <div className="rounded-md bg-danger-50 p-4">
              <div className="text-sm text-danger-700">
                {errors.root.message}
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
              Send reset link
            </Button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
