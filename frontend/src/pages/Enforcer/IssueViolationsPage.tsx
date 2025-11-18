import React, { useState, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Shield, MapPin, Calendar, Clock, FileText, Car, User, CreditCard } from "lucide-react";
import { Card, CardContent } from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import PageHeader from "../../components/Layout/PageHeader";
import PageSection from "../../components/Layout/PageSection";
import { apiService, unwrapApiResponse } from "../../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const violationTypes = [
  "speeding",
  "reckless_driving",
  "illegal_parking",
  "no_license_plate",
  "expired_registration",
  "no_drivers_license",
  "driving_under_influence",
  "disregarding_traffic_signals",
  "illegal_overtaking",
  "overloading",
  "no_helmet",
  "no_seatbelt",
  "illegal_turn",
  "blocking_intersection",
  "other"
];

const vehicleTypes = ["motorcycle", "car", "truck", "bus", "tricycle", "other"];

const formatViolationLabel = (value: string | undefined | null) => {
  if (!value) return "Unknown violation";
  return value.replace(/_/g, " ");
};

const schema = yup.object({
  // Vehicle Information
  plateNumber: yup.string().required("Plate number is required").min(5, "Plate number must be at least 5 characters").max(15, "Plate number must not exceed 15 characters"),
  vehicleType: yup.string().oneOf(vehicleTypes, "Invalid vehicle type").required("Vehicle type is required"),
  vehicleMake: yup.string().optional(),
  vehicleModel: yup.string().optional(),
  vehicleColor: yup.string().optional(),
  vehicleYear: yup.string().optional(),

  // Driver Information
  driverName: yup.string().required("Driver name is required").min(2, "Driver name must be at least 2 characters"),
  driverLicenseNumber: yup.string().optional(),
  driverAddress: yup.string().optional(),
  driverPhone: yup.string().optional(),

  // Violation Information
  violationType: yup.string().oneOf(violationTypes, "Invalid violation type").required("Violation type is required"),
  violationDescription: yup.string().required("Violation description is required").min(10, "Description must be at least 10 characters"),
  violationLocation: yup.string().required("Violation location is required").min(5, "Location must be at least 5 characters"),
  violationDate: yup.string().required("Violation date is required"),
  violationTime: yup.string().required("Violation time is required"),

  // Fine Information
  baseFine: yup.number().required("Base fine is required").min(0, "Base fine must be positive"),
  additionalPenalties: yup.number().optional().min(0, "Additional penalties must be positive"),
  demeritPoints: yup.number().optional().min(0, "Demerit points must be positive"),
  notes: yup.string().optional()
});

type ViolationFormData = yup.InferType<typeof schema>;

const IssueViolationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<ViolationFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      vehicleType: "car",
      violationType: "speeding",
      baseFine: 0,
      additionalPenalties: 0,
      demeritPoints: 0,
      violationDate: new Date().toISOString().split("T")[0],
      violationTime: new Date().toTimeString().slice(0, 5)
    }
  });

  const baseFine = watch("baseFine") || 0;
  const additionalPenalties = watch("additionalPenalties") || 0;
  const totalFine = Number(baseFine) + Number(additionalPenalties);

  const onSubmit = async (data: ViolationFormData) => {
    try {
      setLoading(true);
      const response = await apiService.createViolation({
        ...data,
        plateNumber: data.plateNumber.toUpperCase(),
        totalFine: totalFine
      });
      const payload = unwrapApiResponse<{ violation?: { id: string } }>(response);
      const violationId = payload?.violation?.id;

      toast.success("Violation issued successfully!");
      if (violationId) {
        navigate(`/violations/${violationId}`);
      }
    } catch (error: any) {
      console.error("Failed to create violation:", error);
      toast.error(error.response?.data?.message || "Failed to issue violation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 px-4 pb-12 pt-8">
      <PageHeader
        title="Issue Violation"
        subtitle="Record a new traffic violation citation with complete details."
        icon={Shield}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Vehicle Information */}
        <PageSection title="Vehicle Information">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2">
              <label className="form-label">
                Plate Number <span className="text-danger-600">*</span>
              </label>
              <Input
                {...register("plateNumber")}
                placeholder="ABC-1234"
                error={errors.plateNumber?.message}
                startIcon={<Car className="h-5 w-5" />}
              />
            </div>

            <div>
              <label className="form-label">
                Vehicle Type <span className="text-danger-600">*</span>
              </label>
              <select
                {...register("vehicleType")}
                className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${errors.vehicleType ? "border-danger-500" : ""}`}
              >
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatViolationLabel(type).replace(/\b\w/g, (letter: string) => letter.toUpperCase())}
                  </option>
                ))}
              </select>
              {errors.vehicleType && <p className="mt-1 text-xs text-danger-600">{errors.vehicleType.message}</p>}
            </div>

            <div>
              <label className="form-label">Vehicle Make</label>
              <Input
                {...register("vehicleMake")}
                placeholder="Toyota"
                error={errors.vehicleMake?.message}
              />
            </div>

            <div>
              <label className="form-label">Vehicle Model</label>
              <Input
                {...register("vehicleModel")}
                placeholder="Vios"
                error={errors.vehicleModel?.message}
              />
            </div>

            <div>
              <label className="form-label">Vehicle Color</label>
              <Input
                {...register("vehicleColor")}
                placeholder="White"
                error={errors.vehicleColor?.message}
              />
            </div>

            <div>
              <label className="form-label">Vehicle Year</label>
              <Input
                {...register("vehicleYear")}
                placeholder="2020"
                error={errors.vehicleYear?.message}
                type="number"
              />
            </div>
          </div>
        </PageSection>

        {/* Driver Information */}
        <PageSection title="Driver Information">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">
                Driver Name <span className="text-danger-600">*</span>
              </label>
              <Input
                {...register("driverName")}
                placeholder="Juan Dela Cruz"
                error={errors.driverName?.message}
                startIcon={<User className="h-5 w-5" />}
              />
            </div>

            <div>
              <label className="form-label">Driver License Number</label>
              <Input
                {...register("driverLicenseNumber")}
                placeholder="D01-23-456789"
                error={errors.driverLicenseNumber?.message}
              />
            </div>

            <div>
              <label className="form-label">Driver Address</label>
              <Input
                {...register("driverAddress")}
                placeholder="123 Main Street, Las Piñas City"
                error={errors.driverAddress?.message}
              />
            </div>

            <div>
              <label className="form-label">Driver Phone</label>
              <Input
                {...register("driverPhone")}
                placeholder="09123456789"
                error={errors.driverPhone?.message}
                type="tel"
              />
            </div>
          </div>
        </PageSection>

        {/* Violation Information */}
        <PageSection title="Violation Details">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">
                Violation Type <span className="text-danger-600">*</span>
              </label>
              <select
                {...register("violationType")}
                className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${errors.violationType ? "border-danger-500" : ""}`}
              >
                {violationTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatViolationLabel(type).replace(/\b\w/g, (letter: string) => letter.toUpperCase())}
                  </option>
                ))}
              </select>
              {errors.violationType && <p className="mt-1 text-xs text-danger-600">{errors.violationType.message}</p>}
            </div>

            <div>
              <label className="form-label">
                Violation Location <span className="text-danger-600">*</span>
              </label>
              <Input
                {...register("violationLocation")}
                placeholder="Alabang-Zapote Road, Las Piñas"
                error={errors.violationLocation?.message}
                startIcon={<MapPin className="h-5 w-5" />}
              />
            </div>

            <div>
              <label className="form-label">
                Violation Date <span className="text-danger-600">*</span>
              </label>
              <Input
                {...register("violationDate")}
                type="date"
                error={errors.violationDate?.message}
                startIcon={<Calendar className="h-5 w-5" />}
              />
            </div>

            <div>
              <label className="form-label">
                Violation Time <span className="text-danger-600">*</span>
              </label>
              <Input
                {...register("violationTime")}
                type="time"
                error={errors.violationTime?.message}
                startIcon={<Clock className="h-5 w-5" />}
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">
                Violation Description <span className="text-danger-600">*</span>
              </label>
              <textarea
                {...register("violationDescription")}
                rows={4}
                placeholder="Provide detailed description of the violation..."
                className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${errors.violationDescription ? "border-danger-500" : ""}`}
              />
              {errors.violationDescription && <p className="mt-1 text-xs text-danger-600">{errors.violationDescription.message}</p>}
            </div>
          </div>
        </PageSection>

        {/* Fine Information */}
        <PageSection title="Fine & Penalties">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="form-label">
                Base Fine (₱) <span className="text-danger-600">*</span>
              </label>
              <Input
                {...register("baseFine", { valueAsNumber: true })}
                type="number"
                placeholder="0.00"
                error={errors.baseFine?.message}
                startIcon={<CreditCard className="h-5 w-5" />}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const value = parseFloat(e.target.value) || 0;
                  setValue("baseFine", value);
                }}
              />
            </div>

            <div>
              <label className="form-label">Additional Penalties (₱)</label>
              <Input
                {...register("additionalPenalties", { valueAsNumber: true })}
                type="number"
                placeholder="0.00"
                error={errors.additionalPenalties?.message}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const value = parseFloat(e.target.value) || 0;
                  setValue("additionalPenalties", value);
                }}
              />
            </div>

            <div>
              <label className="form-label">Demerit Points</label>
              <Input
                {...register("demeritPoints", { valueAsNumber: true })}
                type="number"
                placeholder="0"
                error={errors.demeritPoints?.message}
              />
            </div>

            <div>
              <label className="form-label">Total Fine (₱)</label>
              <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-lg font-bold text-primary-700">
                {totalFine.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Notes</label>
              <textarea
                {...register("notes")}
                rows={3}
                placeholder="Additional notes or observations..."
                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
        </PageSection>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Issuing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Issue Violation
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default IssueViolationsPage;

