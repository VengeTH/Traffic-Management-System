import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useAuth } from "../../contexts/AuthContext"
import { apiService } from "../../services/api"
import toast from "react-hot-toast"
import {
  Car,
  Mail,
  Phone,
  Shield,
  User as UserIcon,
  Copy,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent } from "../../components/UI/Card"
import Button from "../../components/UI/Button"
import Input from "../../components/UI/Input"
import PageHeader from "../../components/Layout/PageHeader"
import PageSection from "../../components/Layout/PageSection"
import Modal from "../../components/UI/Modal"

const schema = yup
  .object({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    email: yup
      .string()
      .email("Please enter a valid email")
      .required("Email is required"),
    phoneNumber: yup.string().required("Phone number is required"),
    driverLicenseNumber: yup.string().optional(),
  })
  .required()

type ProfileFormData = yup.InferType<typeof schema>

const passwordChangeSchema = yup
  .object({
    currentPassword: yup.string().required("Current password is required"),
    newPassword: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      )
      .required("New password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("newPassword")], "Passwords must match")
      .required("Please confirm your password"),
  })
  .required()

type PasswordChangeFormData = yup.InferType<typeof passwordChangeSchema>

const ProfilePage: React.FC = () => {
  const { user, updateUser, refreshAuth } = useAuth()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false)
  const [show2FAModal, setShow2FAModal] = useState<boolean>(false)
  const [twoFactorData, setTwoFactorData] = useState<{
    secret: string
    qrCodeUrl: string
  } | null>(null)
  const [copiedSecret, setCopiedSecret] = useState<boolean>(false)
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false)
  const [twoFactorLoading, setTwoFactorLoading] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      driverLicenseNumber: user?.driverLicenseNumber ?? "",
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true)
      await apiService.updateUserProfile(data)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  // Password change form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordChangeFormData>({
    resolver: yupResolver(passwordChangeSchema),
  })

  const onPasswordChange = async (data: PasswordChangeFormData) => {
    try {
      setPasswordLoading(true)
      await apiService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success("Password changed successfully!")
      setShowPasswordModal(false)
      resetPasswordForm()
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to change password"
      toast.error(message)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleEnable2FA = async () => {
    try {
      setTwoFactorLoading(true)
      const response = await apiService.enable2FA()
      setTwoFactorData({
        secret: response.data.secret,
        qrCodeUrl: response.data.qrCodeUrl,
      })
      setShow2FAModal(true)
      toast.success(
        "Two-factor authentication enabled! Please scan the QR code."
      )
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to enable 2FA"
      toast.error(message)
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (
      !window.confirm(
        "Are you sure you want to disable two-factor authentication? This will reduce your account security."
      )
    ) {
      return
    }

    try {
      setTwoFactorLoading(true)
      await apiService.disable2FA()
      await refreshAuth() // Refresh user data to update UI
      toast.success("Two-factor authentication disabled successfully")
      setShow2FAModal(false)
      setTwoFactorData(null)
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to disable 2FA"
      toast.error(message)
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleCopySecret = () => {
    if (twoFactorData?.secret) {
      navigator.clipboard.writeText(twoFactorData.secret)
      setCopiedSecret(true)
      toast.success("Secret code copied to clipboard!")
      setTimeout(() => setCopiedSecret(false), 2000)
    }
  }

  const handle2FAModalClose = async () => {
    setShow2FAModal(false)
    if (twoFactorData) {
      // Refresh user data after enabling 2FA
      await refreshAuth()
    }
    setTwoFactorData(null)
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-gray-200 bg-gray-50 px-6 py-12 text-center">
        <UserIcon className="h-12 w-12 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900">User not found</h2>
        <p className="text-sm text-gray-600">
          Sign in again to load your profile.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 px-4 pb-12 pt-8">
      <PageHeader
        title="Profile & security"
        subtitle="Keep your contact information precise to receive timely violation notices and payment confirmations."
        icon={UserIcon}
      />

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <PageSection
          title="Personal information"
          description="Update your identity and contact details."
        >
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="First name"
                  placeholder="Juan"
                  {...register("firstName")}
                  error={errors.firstName?.message}
                  required
                />
                <Input
                  label="Last name"
                  placeholder="Dela Cruz"
                  {...register("lastName")}
                  error={errors.lastName?.message}
                  required
                />
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                error={errors.email?.message}
                required
              />

              <Input
                label="Phone number"
                placeholder="0917 123 4567"
                {...register("phoneNumber")}
                error={errors.phoneNumber?.message}
                required
              />

              <Input
                label="Driver's license number"
                placeholder="Optional"
                {...register("driverLicenseNumber")}
                error={errors.driverLicenseNumber?.message}
              />

              <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="shadow-lg"
                >
                  Save changes
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <ContactRow
                icon={<UserIcon className="h-4 w-4 text-primary-600" />}
                label="Full name"
                value={
                  `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                  "Not provided"
                }
              />
              <ContactRow
                icon={<Mail className="h-4 w-4 text-primary-600" />}
                label="Email"
                value={user.email || "Not provided"}
              />
              <ContactRow
                icon={<Phone className="h-4 w-4 text-primary-600" />}
                label="Phone"
                value={user.phoneNumber || "Not provided"}
              />
              <ContactRow
                icon={<Car className="h-4 w-4 text-primary-600" />}
                label="Driver's license"
                value={user.driverLicenseNumber || "Not provided"}
              />

              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
                className="shadow-lg"
              >
                Edit profile
              </Button>
            </div>
          )}
        </PageSection>

        <div className="space-y-6">
          <PageSection title="Account status" headerAlignment="left">
            <Card className="border border-gray-100 bg-white/95 shadow-xl">
              <CardContent className="space-y-4 p-6 text-sm text-gray-700">
                <StatusRow
                  label="Role"
                  value={user.role ? user.role.toUpperCase() : "Unknown"}
                />
                <StatusRow
                  label="Account"
                  value={user.isActive !== false ? "Active" : "Inactive"}
                  tone={user.isActive !== false ? "success" : "danger"}
                />
                <StatusRow
                  label="Email verification"
                  value={user.isEmailVerified ? "Verified" : "Pending"}
                  tone={user.isEmailVerified ? "success" : "warning"}
                />
                <StatusRow
                  label="Two-factor"
                  value={user.twoFactorEnabled ? "Enabled" : "Disabled"}
                  tone={user.twoFactorEnabled ? "success" : "neutral"}
                />
                <StatusRow
                  label="Last login"
                  value={
                    user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString()
                      : "No record"
                  }
                />
              </CardContent>
            </Card>
          </PageSection>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false)
          resetPasswordForm()
        }}
        title="Change Password"
        size="md"
      >
        <form
          onSubmit={handlePasswordSubmit(onPasswordChange)}
          className="space-y-4"
        >
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter your current password"
            {...registerPassword("currentPassword")}
            error={passwordErrors.currentPassword?.message}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Enter your new password"
            {...registerPassword("newPassword")}
            error={passwordErrors.newPassword?.message}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm your new password"
            {...registerPassword("confirmPassword")}
            error={passwordErrors.confirmPassword?.message}
            required
          />

          <div className="pt-4 flex gap-3">
            <Button
              type="submit"
              variant="primary"
              loading={passwordLoading}
              className="flex-1"
            >
              Change Password
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowPasswordModal(false)
                resetPasswordForm()
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2FA Setup Modal */}
      <Modal
        isOpen={show2FAModal}
        onClose={handle2FAModalClose}
        title="Two-Factor Authentication Setup"
        size="lg"
      >
        {twoFactorData ? (
          <div className="space-y-6">
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <p className="text-sm text-primary-800 font-medium mb-2">
                Scan this QR code with your authenticator app (Google
                Authenticator, Authy, etc.)
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=1&data=${encodeURIComponent(twoFactorData.qrCodeUrl)}`}
                  alt="2FA QR Code"
                  className="w-56 h-56 mx-auto"
                  onError={(e) => {
                    // Fallback if QR service fails
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                  }}
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Code (Backup)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 font-mono text-sm break-all">
                    {twoFactorData.secret}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="p-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors"
                    title="Copy secret"
                  >
                    {copiedSecret ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Save this secret code in a safe place. You'll need it if you
                  lose access to your authenticator app.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                Instructions:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Open your authenticator app on your mobile device</li>
                <li>Tap the "+" or "Add Account" button</li>
                <li>
                  Scan the QR code above or enter the secret code manually
                </li>
                <li>Enter the 6-digit code from your app when logging in</li>
              </ol>
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                onClick={handle2FAModalClose}
                className="w-full"
              >
                I've Set Up My Authenticator App
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading 2FA setup...</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

interface ContactRowProps {
  icon: React.ReactNode
  label: string
  value: string
}

const ContactRow: React.FC<ContactRowProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-3xl border border-gray-100 bg-white/95 p-4 shadow-sm">
    <div className="rounded-xl bg-primary-50 p-2 text-primary-600">{icon}</div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-gray-700">{value}</p>
    </div>
  </div>
)

interface StatusRowProps {
  label: string
  value: string
  tone?: "success" | "warning" | "danger" | "neutral"
}

const StatusRow: React.FC<StatusRowProps> = ({
  label,
  value,
  tone = "neutral",
}) => {
  const toneClasses: Record<NonNullable<StatusRowProps["tone"]>, string> = {
    success: "bg-success-100 text-success-700",
    warning: "bg-warning-100 text-warning-700",
    danger: "bg-danger-100 text-danger-700",
    neutral: "bg-gray-100 text-gray-700",
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}
      >
        {value}
      </span>
    </div>
  )
}

export default ProfilePage
