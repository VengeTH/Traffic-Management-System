import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiService } from '../../services/api';
import { Violation } from '../../types';
import { Search, Car, FileText, AlertTriangle, CheckCircle, Clock, MapPin, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const schema = yup.object({
  searchType: yup.string().required('Please select a search type'),
  searchValue: yup.string().required('Please enter a search value'),
}).required();

type SearchFormData = yup.InferType<typeof schema>;

const ViolationSearchPage: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<SearchFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      searchType: 'ovr',
    },
  });

  const searchType = watch('searchType');

  const onSubmit = async (data: SearchFormData) => {
    try {
      setLoading(true);
      setSearched(true);
      
      const response = await apiService.searchViolations(data.searchType, data.searchValue);
      
      setViolations(response.data.violations || []);
    } catch (error: any) {
      console.error('Search failed:', error);
      setViolations([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-success-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning-600" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-danger-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-success-600 bg-success-50';
      case 'pending':
        return 'text-warning-600 bg-warning-50';
      case 'overdue':
        return 'text-danger-600 bg-danger-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'ovr':
        return 'Enter OVR number (e.g., OVR-2024-001)';
      case 'plate':
        return 'Enter plate number (e.g., ABC-123)';
      case 'license':
        return 'Enter driver\'s license number';
      default:
        return 'Enter search value';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Search Violations</h1>
        <p className="text-gray-600 mt-1">
          Look up traffic violations using OVR number, plate number, or driver's license number.
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Type
                </label>
                <select
                  {...register('searchType')}
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
                  {...register('searchValue')}
                  error={errors.searchValue?.message}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="flex items-center"
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
        <Card>
          <CardHeader>
            <CardTitle>
              Search Results
              {violations.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({violations.length} violation{violations.length !== 1 ? 's' : ''} found)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : violations.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No violations found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No traffic violations match your search criteria.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {violations.map((violation) => (
                  <div
                    key={violation.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="flex-shrink-0">
                            <Car className="h-8 w-8 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {violation.violationType.replace('_', ' ').toUpperCase()}
                            </h3>
                            <p className="text-sm text-gray-500">
                              OVR: {violation.ovrNumber} • Citation: {violation.citationNumber}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              <span className="font-medium">Plate:</span> {violation.plateNumber}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              <span className="font-medium">Date:</span> {new Date(violation.violationDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              <span className="font-medium">Location:</span> {violation.violationLocation}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              <span className="font-medium">Fine:</span> ₱{violation.totalFine.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(violation.status)}`}>
                              {getStatusIcon(violation.status)}
                              <span className="ml-1">{violation.status.toUpperCase()}</span>
                            </span>
                            {violation.status === 'pending' && (
                              <span className="text-xs text-gray-500">
                                Due: {new Date(violation.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/violations/${violation.id}`, '_blank')}
                            >
                              View Details
                            </Button>
                            {violation.status === 'pending' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => window.open(`/payment/${violation.id}`, '_blank')}
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
  );
};

export default ViolationSearchPage;
