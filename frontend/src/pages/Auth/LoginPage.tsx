import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, ShieldCheck, Smartphone, CreditCard } from 'lucide-react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

const schema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required')
}).required();

type LoginFormData = yup.InferType<typeof schema>;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error: unknown) {
      let message = 'Login failed. Please try again.';
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const serverError = error as { response?: { data?: { message?: string } } };
        message = serverError.response?.data?.message ?? message;
      }
      setError('root', {
        type: 'manual',
        message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 py-12 overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative overflow-hidden rounded-[32px] border border-primary-100/30 bg-white p-10 shadow-lg">
          <div className="relative space-y-8">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-xl">
                <span className="text-lg font-extrabold">EV</span>
              </div>
              <h1 className="mt-6 text-4xl font-black text-gray-900">
                Welcome back to E-VioPay
              </h1>
              <p className="mt-3 max-w-md text-sm text-gray-600">
                Securely monitor traffic violations, settle payments, and receive instant confirmations in one modern portal.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-primary-100/30 bg-primary-50/50 p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-bold text-gray-900">Government grade security</p>
                <p className="mt-1 text-xs text-gray-700 leading-relaxed">Two-factor ready with audit trails.</p>
              </div>
              <div className="rounded-2xl border border-secondary-100/30 bg-secondary-50/50 p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-100 text-secondary-700">
                  <CreditCard className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-bold text-gray-900">Cashless payments</p>
                <p className="mt-1 text-xs text-gray-700 leading-relaxed">PayMongo, GCash, Maya, cards.</p>
              </div>
              <div className="rounded-2xl border border-accent-100/30 bg-accent-50/50 p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
                  <Smartphone className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-bold text-gray-900">Mobile optimized</p>
                <p className="mt-1 text-xs text-gray-700 leading-relaxed">Responsive on any device.</p>
              </div>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500">Demo access</h3>
              <div className="mt-4 grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
                <p><span className="font-semibold text-gray-900">Admin:</span> admin@laspinas.gov.ph / admin123456</p>
                <p><span className="font-semibold text-gray-900">Citizen 1:</span> pedro.garcia@email.com / citizen123</p>
                <p><span className="font-semibold text-gray-900">Enforcer 1:</span> enforcer1@laspinas.gov.ph / enforcer123</p>
                <p><span className="font-semibold text-gray-900">Enforcer 2:</span> enforcer2@laspinas.gov.ph / enforcer123</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center lg:pl-6">
          <div className="w-full rounded-[28px] border border-gray-100/30 bg-white p-10 shadow-lg">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl">
                <Mail className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-3xl font-black text-gray-900">Sign in to continue</h2>
              <p className="mt-2 text-sm text-gray-600">
                New to E-VioPay?{' '}
                <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
                  Create an account
                </Link>
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-5">
                <Input
                  {...register('email')}
                  label="Email address"
                  placeholder="your@email.com"
                  type="email"
                  autoComplete="email"
                  startIcon={<Mail className="h-5 w-5" />} 
                  error={errors.email?.message}
                  required
                />

                <Input
                  {...register('password')}
                  label="Password"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  startIcon={<Lock className="h-5 w-5" />}
                  endAdornment={(
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  )}
                  error={errors.password?.message}
                  required
                />
              </div>

              {errors.root && (
                <div className="rounded-2xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700">
                  {errors.root.message}
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="font-semibold text-primary-600 hover:text-primary-700">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                Sign in
              </Button>

              <p className="text-center text-sm text-gray-600">
                Need an account?{' '}
                <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
                  Sign up here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


