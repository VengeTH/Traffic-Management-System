import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { apiService } from "../../services/api"
import { Violation } from "../../types"
import {
  Search,
  Car,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/UI/Card"
import Button from "../../components/UI/Button"
import Input from "../../components/UI/Input"
import LoadingSpinner from "../../components/UI/LoadingSpinner"

const schema = yup
  .object({
    searchType: yup.string().required("Please select a search type"),
    searchValue: yup.string().required("Please enter a search value"),
  })
  .required()

type SearchFormData = yup.InferType<typeof schema>

const ViolationSearchPage: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SearchFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      searchType: "ovr",
    },
  })

  const searchType = watch("searchType")

  const onSubmit = async (data: SearchFormData) => {
    try {
      setLoading(true)
      setSearched(true)

      const response = await apiService.searchViolations(
        data.searchType,
        data.searchValue
      )

      setViolations(response.data.violations || [])
    } catch (error: any) {
      console.error("Search failed:", error)
      setViolations([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-success-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-warning-600" />
      case "overdue":
        return <AlertTriangle className="h-5 w-5 text-danger-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-success-600 bg-success-50"
      case "pending":
        return "text-warning-600 bg-warning-50"
      case "overdue":
        return "text-danger-600 bg-danger-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case "ovr":
        return "Enter OVR number (e.g., OVR-2024-001)"
      case "plate":
        return "Enter plate number (e.g., ABC-123)"
      case "license":
        return "Enter driver's license number"
      default:
        return "Enter search value"
    }
  }

  return (
    <div className="space-y-6 pt-8 px-4 pb-8">
      {/* Header */}
      <div className="relative lux-card animated-gradient-border premium-glow p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-100/30 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-100/20 rounded-full -ml-36 -mb-36 blur-2xl"></div>
        <div className="relative flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-xl premium-glow">
            <Search className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gradient-premium">
              Search Violations
            </h1>
            <p className="text-gray-600 mt-2 text-base font-medium">
              Look up traffic violations using OVR number, plate number, or
              driver's license number.
            </p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <Card className="lux-card animated-gradient-border premium-glow hover-lift">
        <CardHeader className="bg-gradient-to-r from-primary-50/50 to-white border-b border-gray-100">
          <CardTitle className="text-xl font-bold text-gradient-premium flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-lg shadow-md premium-glow">
              <FileText className="h-5 w-5 text-secondary-700" />
            </div>
            Search Criteria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Type
                </label>
                <select
                  {...register("searchType")}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="ovr">OVR Number</option>
                  <option value="plate">Plate Number</option>
                  <option value="license">Driver's License Number</option>
                </select>
              </div>

              <div>
                <Input
                  label="Search Value"
                  placeholder={getSearchPlaceholder()}
                  {...register("searchValue")}
                  error={errors.searchValue?.message}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Search className="h-5 w-5 mr-2" />
                Search Violations
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searched && (
        <Card className="lux-card animated-gradient-border premium-glow">
          <CardHeader className="bg-gradient-to-r from-primary-50/50 to-white border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gradient-premium flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg shadow-md premium-glow">
                <FileText className="h-5 w-5 text-primary-700" />
              </div>
              Search Results
              {violations.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({violations.length} violation
                  {violations.length !== 1 ? "s" : ""} found)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : violations.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gray-100 rounded-full blur-xl"></div>
                  <FileText className="relative mx-auto h-16 w-16 text-gray-300" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  No violations found
                </h3>
                <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
                  No traffic violations match your search criteria. Try a
                  different search value.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {violations.map((violation) => (
                  <div
                    key={violation.id}
                    className="group relative overflow-hidden bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-300 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50/30 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-100/40 transition-colors"></div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="flex-shrink-0">
                            <Car className="h-8 w-8 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {violation.violationType
                                .replace("_", " ")
                                .toUpperCase()}
                            </h3>
                            <p className="text-sm text-gray-500">
                              OVR: {violation.ovrNumber} • Citation:{" "}
                              {violation.citationNumber}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              <span className="font-medium">Plate:</span>{" "}
                              {violation.plateNumber}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              <span className="font-medium">Date:</span>{" "}
                              {new Date(
                                violation.violationDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              <span className="font-medium">Location:</span>{" "}
                              {violation.violationLocation}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              <span className="font-medium">Fine:</span> ₱
                              {Number(violation.totalFine).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(violation.status)}`}
                            >
                              {getStatusIcon(violation.status)}
                              <span className="ml-1">
                                {violation.status.toUpperCase()}
                              </span>
                            </span>
                            {violation.status === "pending" && (
                              <span className="text-xs text-gray-500">
                                Due:{" "}
                                {new Date(
                                  violation.dueDate
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          <div className="flex space-x-2 relative z-10">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `/violations/${violation.id}`,
                                  "_blank"
                                )
                              }
                              className="border-2 hover:bg-gray-50 transition-colors"
                            >
                              View Details
                            </Button>
                            {violation.status === "pending" && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() =>
                                  window.open(
                                    `/payment/${violation.id}`,
                                    "_blank"
                                  )
                                }
                                className="shadow-md hover:shadow-lg transition-all"
                              >
                                Pay Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ViolationSearchPage
