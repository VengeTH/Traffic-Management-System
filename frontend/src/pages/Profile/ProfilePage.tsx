import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { User, Shield, User as UserIcon, Mail, Phone, Car } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  driverLicenseNumber: yup.string().optional(),
}).required();

type ProfileFormData = yup.InferType<typeof schema>;

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      driverLicenseNumber: user?.driverLicenseNumber || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      await apiService.updateUserProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">User not found</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-8 px-4 pb-8">
      {/* Header */}
      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/30 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-100/20 rounded-full -ml-36 -mb-36 blur-2xl"></div>
        <div className="relative flex items-center gap-3">
          <div className="p-3 bg-purple-600 rounded-xl shadow-lg border-2 border-purple-700">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Profile
            </h1>
            <p className="text-gray-600 mt-2 text-base font-medium">
              Manage your account information and preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card className="border border-slate-200 shadow-lg">
            <CardHeader className="bg-white border-b-2 border-slate-200">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <User className="h-5 w-5 text-secondary-700" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="First Name"
                      placeholder="Enter your first name"
                      {...register('firstName')}
                      error={errors.firstName?.message}
                      required
                    />
                    <Input
                      label="Last Name"
                      placeholder="Enter your last name"
                      {...register('lastName')}
                      error={errors.lastName?.message}
                      required
                    />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email address"
                    {...register('email')}
                    error={errors.email?.message}
                    required
                  />

                  <Input
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    {...register('phoneNumber')}
                    error={errors.phoneNumber?.message}
                    required
                  />

                  <Input
                    label="Driver's License Number"
                    placeholder="Enter your driver's license number (optional)"
                    {...register('driverLicenseNumber')}
                    error={errors.driverLicenseNumber?.message}
                  />

                  <div className="flex space-x-4 pt-4 border-t border-gray-100">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={loading}
                      className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="border-2 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">First Name</label>
                      <p className="mt-1 text-sm text-gray-900">{user.firstName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Name</label>
                      <p className="mt-1 text-sm text-gray-900">{user.lastName}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email Address</label>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                    <p className="mt-1 text-sm text-gray-900">{user.phoneNumber}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Driver's License Number</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.driverLicenseNumber || 'Not provided'}
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => setIsEditing(true)}
                    className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Edit Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Status */}
        <div className="space-y-6">
          <Card className="border border-slate-200 shadow-lg">
            <CardHeader className="bg-white border-b-2 border-slate-200">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Shield className="h-4 w-4 text-blue-700" />
                </div>
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Account Type:</span>
                  <span className="text-sm text-gray-900 capitalize">{user.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive ? 'text-success-600 bg-success-50' : 'text-danger-600 bg-danger-50'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Email Verified:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isEmailVerified ? 'text-success-600 bg-success-50' : 'text-warning-600 bg-warning-50'
                  }`}>
                    {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">2FA Enabled:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.twoFactorEnabled ? 'text-success-600 bg-success-50' : 'text-gray-600 bg-gray-50'
                  }`}>
                    {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Last Login:</span>
                  <span className="text-sm text-gray-900">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-lg">
            <CardHeader className="bg-white border-b-2 border-slate-200">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-red-100 rounded-lg">
                  <Shield className="h-4 w-4 text-red-700" />
                </div>
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {/* TODO: Implement change password */}}
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {/* TODO: Implement 2FA toggle */}}
                >
                  {user.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
