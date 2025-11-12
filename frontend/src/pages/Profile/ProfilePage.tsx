import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import {
  Car,
  Mail,
  Phone,
  Shield,
  User as UserIcon
} from 'lucide-react';
import { Card, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import PageHeader from '../../components/Layout/PageHeader';
import PageSection from '../../components/Layout/PageSection';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  driverLicenseNumber: yup.string().optional()
}).required();

type ProfileFormData = yup.InferType<typeof schema>;

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phoneNumber: user?.phoneNumber ?? '',
      driverLicenseNumber: user?.driverLicenseNumber ?? ''
    }
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
      <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-gray-200 bg-gray-50 px-6 py-12 text-center">
        <UserIcon className="h-12 w-12 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900">User not found</h2>
        <p className="text-sm text-gray-600">Sign in again to load your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 pb-12 pt-8">
      <PageHeader
        title="Profile & security"
        subtitle="Keep your contact information precise to receive timely violation notices and payment confirmations."
        icon={UserIcon}
      />

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <PageSection title="Personal information" description="Update your identity and contact details.">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="First name"
                  placeholder="Juan"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                  required
                />
                <Input
                  label="Last name"
                  placeholder="Dela Cruz"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                  required
                />
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                error={errors.email?.message}
                required
              />

              <Input
                label="Phone number"
                placeholder="0917 123 4567"
                {...register('phoneNumber')}
                error={errors.phoneNumber?.message}
                required
              />

              <Input
                label="Driver's license number"
                placeholder="Optional"
                {...register('driverLicenseNumber')}
                error={errors.driverLicenseNumber?.message}
              />

              <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">
                <Button type="submit" variant="primary" loading={loading} className="shadow-lg">
                  Save changes
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <ContactRow icon={<UserIcon className="h-4 w-4 text-primary-600" />} label="Full name" value={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Not provided'} />
              <ContactRow icon={<Mail className="h-4 w-4 text-primary-600" />} label="Email" value={user.email || 'Not provided'} />
              <ContactRow icon={<Phone className="h-4 w-4 text-primary-600" />} label="Phone" value={user.phoneNumber || 'Not provided'} />
              <ContactRow icon={<Car className="h-4 w-4 text-primary-600" />} label="Driver's license" value={user.driverLicenseNumber || 'Not provided'} />

              <Button variant="primary" onClick={() => setIsEditing(true)} className="shadow-lg">
                Edit profile
              </Button>
            </div>
          )}
        </PageSection>

        <div className="space-y-6">
          <PageSection title="Account status" headerAlignment="left">
            <Card className="border border-gray-100 bg-white/95 shadow-xl">
              <CardContent className="space-y-4 p-6 text-sm text-gray-700">
                <StatusRow label="Role" value={user.role ? user.role.toUpperCase() : 'Unknown'} />
                <StatusRow label="Account" value={user.isActive !== false ? 'Active' : 'Inactive'} tone={user.isActive !== false ? 'success' : 'danger'} />
                <StatusRow label="Email verification" value={user.isEmailVerified ? 'Verified' : 'Pending'} tone={user.isEmailVerified ? 'success' : 'warning'} />
                <StatusRow label="Two-factor" value={user.twoFactorEnabled ? 'Enabled' : 'Disabled'} tone={user.twoFactorEnabled ? 'success' : 'neutral'} />
                <StatusRow label="Last login" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'No record'} />
              </CardContent>
            </Card>
          </PageSection>

          <PageSection title="Security controls" headerAlignment="left">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between">
                <span>Change password</span>
                <Shield className="h-4 w-4 text-primary-500" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>{user.twoFactorEnabled ? 'Disable two-factor authentication' : 'Enable two-factor authentication'}</span>
                <Shield className="h-4 w-4 text-primary-500" />
              </Button>
            </div>
          </PageSection>
        </div>
      </div>
    </div>
  );
};

interface ContactRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const ContactRow: React.FC<ContactRowProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-3xl border border-gray-100 bg-white/95 p-4 shadow-sm">
    <div className="rounded-xl bg-primary-50 p-2 text-primary-600">{icon}</div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</p>
      <p className="mt-1 text-sm text-gray-700">{value}</p>
    </div>
  </div>
);

interface StatusRowProps {
  label: string;
  value: string;
  tone?: 'success' | 'warning' | 'danger' | 'neutral';
}

const StatusRow: React.FC<StatusRowProps> = ({ label, value, tone = 'neutral' }) => {
  const toneClasses: Record<NonNullable<StatusRowProps['tone']>, string> = {
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    danger: 'bg-danger-100 text-danger-700',
    neutral: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{value}</span>
    </div>
  );
};

export default ProfilePage;
