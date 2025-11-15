import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useAuth } from "../../contexts/AuthContext"
import { Eye, EyeOff, User, Mail, Phone, Lock, Car } from "lucide-react"
import Button from "../../components/UI/Button"

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
  })
  .required()

type RegisterFormData = yup.InferType<typeof schema>

const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      // * Transform empty driverLicenseNumber to undefined before sending
      const submitData = {
        ...data,
        driverLicenseNumber: data.driverLicenseNumber?.trim() || undefined,
      }
      await registerUser(submitData)
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
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First name <span className="text-danger-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none hidden sm:flex">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register("firstName")}
                      id="firstName"
                      type="text"
                      style={{ textAlign: "left", direction: "ltr" }}
                      className={`
                      appearance-none relative block w-full pl-2 sm:pl-10 pr-3 py-2 border border-gray-300 
                      placeholder-gray-500 text-gray-900 text-left rounded-md focus:outline-none 
                      focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm
                      ${errors.firstName ? "border-danger-300 focus:border-danger-500 focus:ring-danger-500" : ""}
                    `}
                      placeholder="First name"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last name <span className="text-danger-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none hidden sm:flex">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register("lastName")}
                      id="lastName"
                      type="text"
                      style={{ textAlign: "left", direction: "ltr" }}
                      className={`
                      appearance-none relative block w-full pl-2 sm:pl-10 pr-3 py-2 border border-gray-300 
                      placeholder-gray-500 text-gray-900 text-left rounded-md focus:outline-none 
                      focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm
                      ${errors.lastName ? "border-danger-300 focus:border-danger-500 focus:ring-danger-500" : ""}
                    `}
                      placeholder="Last name"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address <span className="text-danger-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none hidden sm:flex">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("email")}
                    id="email"
                    type="email"
                    autoComplete="email"
                    style={{ textAlign: "left", direction: "ltr" }}
                    className={`
                    appearance-none relative block w-full pl-2 sm:pl-10 pr-3 py-2 border border-gray-300 
                    placeholder-gray-500 text-gray-900 text-left rounded-md focus:outline-none 
                    focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm
                    ${errors.email ? "border-danger-300 focus:border-danger-500 focus:ring-danger-500" : ""}
                  `}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-danger-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone number <span className="text-danger-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none hidden sm:flex">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("phoneNumber")}
                    id="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    style={{ textAlign: "left", direction: "ltr" }}
                    className={`
                    appearance-none relative block w-full pl-2 sm:pl-10 pr-3 py-2 border border-gray-300 
                    placeholder-gray-500 text-gray-900 text-left rounded-md focus:outline-none 
                    focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm
                    ${errors.phoneNumber ? "border-danger-300 focus:border-danger-500 focus:ring-danger-500" : ""}
                  `}
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-danger-600">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="driverLicenseNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Driver's License Number (Optional)
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none hidden sm:flex">
                    <Car className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("driverLicenseNumber")}
                    id="driverLicenseNumber"
                    type="text"
                    style={{ textAlign: "left", direction: "ltr" }}
                    className="appearance-none relative block w-full pl-2 sm:pl-10 pr-3 py-2 border border-gray-300 
                    placeholder-gray-500 text-gray-900 text-left rounded-md focus:outline-none 
                    focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your driver's license number"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password <span className="text-danger-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none hidden sm:flex">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    style={{ textAlign: "left", direction: "ltr" }}
                    className={`
                    appearance-none relative block w-full pl-2 sm:pl-10 pr-10 py-2 border border-gray-300 
                    placeholder-gray-500 text-gray-900 text-left rounded-md focus:outline-none 
                    focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm
                    ${errors.password ? "border-danger-300 focus:border-danger-500 focus:ring-danger-500" : ""}
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
                  <p className="mt-1 text-sm text-danger-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password <span className="text-danger-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none hidden sm:flex">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("confirmPassword")}
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    style={{ textAlign: "left", direction: "ltr" }}
                    className={`
                    appearance-none relative block w-full pl-2 sm:pl-10 pr-10 py-2 border border-gray-300 
                    placeholder-gray-500 text-gray-900 text-left rounded-md focus:outline-none 
                    focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm
                    ${errors.confirmPassword ? "border-danger-300 focus:border-danger-500 focus:ring-danger-500" : ""}
                  `}
                    placeholder="Confirm your password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
                  <p className="mt-1 text-sm text-danger-600">
                    {errors.confirmPassword.message}
                  </p>
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
