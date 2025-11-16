import React, { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useAuth } from "../../contexts/AuthContext"
import { Eye, EyeOff, User, Mail, Phone, Lock, Car } from "lucide-react"
import Button from "../../components/UI/Button"
import Input from "../../components/UI/Input"

const schema = yup
  .object({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    email: yup
      .string()
      .email("Please enter a valid email")
      .required("Email is required"),
    phoneNumber: yup.string().required("Phone number is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      )
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Please confirm your password"),
    // Optional: only validate length if user provided a non-empty value
    driverLicenseNumber: yup
      .string()
      .nullable()
      .transform((val, origVal) => (origVal === "" ? null : val))
      .test(
        "len-when-present",
        "Driver license number must be between 5 and 20 characters",
        function (val) {
          if (!val || val === "" || val === null) {
            return true // Skip validation if empty
          }
          return val.length >= 5 && val.length <= 20
        }
      ),
    acceptTerms: yup
      .boolean()
      .oneOf([true], "You must accept the Terms of Service and Privacy Policy to continue")
      .required("You must accept the Terms of Service and Privacy Policy"),
  })
  .required()

type RegisterFormData = yup.InferType<typeof schema>

const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasReadTerms, setHasReadTerms] = useState(false)
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false)

  const location = useLocation()

  // * Check if user has read both documents
  useEffect(() => {
    const checkReadStatus = () => {
      const termsRead = localStorage.getItem("terms_read") === "true"
      const privacyRead = localStorage.getItem("privacy_read") === "true"
      setHasReadTerms(termsRead)
      setHasReadPrivacy(privacyRead)
    }

    checkReadStatus()
    // * Check when component mounts or when location changes (user returns from reading)
    // * This ensures the checkbox state updates when user navigates back
  }, [location])

  // * Also check periodically to catch when user returns from reading
  useEffect(() => {
    const interval = setInterval(() => {
      const termsRead = localStorage.getItem("terms_read") === "true"
      const privacyRead = localStorage.getItem("privacy_read") === "true"
      setHasReadTerms(termsRead)
      setHasReadPrivacy(privacyRead)
    }, 500) // * Check every 500ms for faster response

    return () => clearInterval(interval)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
  })

  const acceptTermsValue = watch("acceptTerms")

  const handleOpenTerms = (e: React.MouseEvent) => {
    e.preventDefault()
    navigate("/terms", { state: { from: "register" } })
  }

  const handleOpenPrivacy = (e: React.MouseEvent) => {
    e.preventDefault()
    navigate("/privacy", { state: { from: "register" } })
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasReadTerms || !hasReadPrivacy) {
      e.preventDefault()
      return
    }
    setValue("acceptTerms", e.target.checked)
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      // * Transform empty driverLicenseNumber to undefined before sending
      const submitData = {
        ...data,
        driverLicenseNumber: data.driverLicenseNumber?.trim() || undefined,
      }
      await registerUser(submitData)
      // * Clear the read flags after successful registration
      localStorage.removeItem("terms_read")
      localStorage.removeItem("privacy_read")
      navigate("/dashboard")
    } catch (error: any) {
      if (error.response?.data?.message) {
        setError("root", {
          type: "manual",
          message: error.response.data.message,
        })
      } else {
        setError("root", {
          type: "manual",
          message: "Registration failed. Please try again.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center sm:justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 sm:py-12 px-2 sm:px-4 md:px-6 lg:px-8 gradient-mesh"
      style={{ marginTop: "0", paddingTop: "20px" }}
    >
      <div
        className="max-w-md w-full space-y-8 animate-fade-in-up mx-auto sm:mx-auto"
        style={{ textAlign: "left" }}
      >
        <div>
          <div className="mx-auto h-14 w-14 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl premium-glow">
            <span className="text-white font-black text-xl">EV</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-gradient-premium">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="rounded-3xl border-2 border-gray-100/50 bg-white/95 backdrop-blur-sm p-4 sm:p-6 md:p-8 shadow-2xl premium-glow glassmorphism">
          <form
            className="space-y-6"
            onSubmit={handleSubmit(onSubmit)}
            style={{ textAlign: "left" }}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  {...register("firstName")}
                  label="First name"
                  placeholder="First name"
                  type="text"
                  startIcon={<User className="h-5 w-5" />}
                  error={errors.firstName?.message}
                  required
                />

                <Input
                  {...register("lastName")}
                  label="Last name"
                  placeholder="Last name"
                  type="text"
                  startIcon={<User className="h-5 w-5" />}
                  error={errors.lastName?.message}
                  required
                />
              </div>

              <Input
                {...register("email")}
                label="Email address"
                placeholder="Enter your email"
                type="email"
                autoComplete="email"
                startIcon={<Mail className="h-5 w-5" />}
                error={errors.email?.message}
                required
              />

              <Input
                {...register("phoneNumber")}
                label="Phone number"
                placeholder="Enter your phone number"
                type="tel"
                autoComplete="tel"
                startIcon={<Phone className="h-5 w-5" />}
                error={errors.phoneNumber?.message}
                required
              />

              <Input
                {...register("driverLicenseNumber")}
                label="Driver's License Number (Optional)"
                placeholder="Enter your driver's license number"
                type="text"
                startIcon={<Car className="h-5 w-5" />}
              />

              <Input
                {...register("password")}
                label="Password"
                placeholder="Create a password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                startIcon={<Lock className="h-5 w-5" />}
                endAdornment={
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
                }
                error={errors.password?.message}
                required
              />

              <Input
                {...register("confirmPassword")}
                label="Confirm Password"
                placeholder="Confirm your password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                startIcon={<Lock className="h-5 w-5" />}
                endAdornment={
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
                }
                error={errors.confirmPassword?.message}
                required
              />
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

            {/* Terms and Conditions Acceptance */}
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    {...register("acceptTerms")}
                    id="acceptTerms"
                    type="checkbox"
                    disabled={!hasReadTerms || !hasReadPrivacy}
                    onChange={handleCheckboxChange}
                    checked={acceptTermsValue || false}
                    className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded ${
                      !hasReadTerms || !hasReadPrivacy
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  />
                </div>
                <div className="ml-3 text-sm flex-1">
                  <label
                    htmlFor="acceptTerms"
                    className={`text-gray-700 ${
                      !hasReadTerms || !hasReadPrivacy
                        ? "cursor-not-allowed opacity-75"
                        : "cursor-pointer"
                    }`}
                  >
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={handleOpenTerms}
                      className="text-primary-600 hover:text-primary-700 font-semibold underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={handleOpenPrivacy}
                      className="text-primary-600 hover:text-primary-700 font-semibold underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    >
                      Privacy Policy
                    </button>
                  </label>
                  {errors.acceptTerms && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.acceptTerms.message}
                    </p>
                  )}
                </div>
              </div>
              {(!hasReadTerms || !hasReadPrivacy) && (
                <div className="ml-8">
                  <p className="text-xs text-gray-600">
                    {!hasReadTerms && !hasReadPrivacy ? (
                      <span>
                        Please read both the{" "}
                        <button
                          type="button"
                          onClick={handleOpenTerms}
                          className="text-primary-600 hover:text-primary-700 font-semibold underline"
                        >
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          onClick={handleOpenPrivacy}
                          className="text-primary-600 hover:text-primary-700 font-semibold underline"
                        >
                          Privacy Policy
                        </button>{" "}
                        before accepting.
                      </span>
                    ) : !hasReadTerms ? (
                      <span>
                        Please read the{" "}
                        <button
                          type="button"
                          onClick={handleOpenTerms}
                          className="text-primary-600 hover:text-primary-700 font-semibold underline"
                        >
                          Terms of Service
                        </button>{" "}
                        before accepting.
                      </span>
                    ) : (
                      <span>
                        Please read the{" "}
                        <button
                          type="button"
                          onClick={handleOpenPrivacy}
                          className="text-primary-600 hover:text-primary-700 font-semibold underline"
                        >
                          Privacy Policy
                        </button>{" "}
                        before accepting.
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

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
                Already have an account?{" "}
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
    </div>
  )
}

export default RegisterPage
