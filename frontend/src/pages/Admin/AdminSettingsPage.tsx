import React, { useState, useEffect } from 'react';
import { Settings, Save, Mail, Phone, CreditCard, Shield, Database, Server } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface SystemSettings {
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    emailFrom: string;
  };
  sms: {
    provider: string;
    twilioAccountSid: string;
    twilioPhoneNumber: string;
  };
  payment: {
    paymongoSecretKey: string;
    paymongoPublicKey: string;
    gcashClientId: string;
    mayaClientId: string;
  };
  security: {
    jwtExpiresIn: string;
    jwtRefreshExpiresIn: string;
    bcryptRounds: number;
    rateLimitWindow: number;
    rateLimitMax: number;
  };
  app: {
    appName: string;
    appUrl: string;
    frontendUrl: string;
  };
}

const AdminSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      emailFrom: '',
    },
    sms: {
      provider: 'twilio',
      twilioAccountSid: '',
      twilioPhoneNumber: '',
    },
    payment: {
      paymongoSecretKey: '',
      paymongoPublicKey: '',
      gcashClientId: '',
      mayaClientId: '',
    },
    security: {
      jwtExpiresIn: '24h',
      jwtRefreshExpiresIn: '7d',
      bcryptRounds: 12,
      rateLimitWindow: 900000,
      rateLimitMax: 100,
    },
    app: {
      appName: 'E-VioPay',
      appUrl: '',
      frontendUrl: '',
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // * For now, we'll use environment-based defaults
      // * In production, this would fetch from backend/database
      const defaultSettings: SystemSettings = {
        email: {
          smtpHost: process.env.REACT_APP_SMTP_HOST || '',
          smtpPort: parseInt(process.env.REACT_APP_SMTP_PORT || '587'),
          smtpUser: '',
          emailFrom: process.env.REACT_APP_EMAIL_FROM || '',
        },
        sms: {
          provider: 'twilio',
          twilioAccountSid: '',
          twilioPhoneNumber: '',
        },
        payment: {
          paymongoSecretKey: '',
          paymongoPublicKey: '',
          gcashClientId: '',
          mayaClientId: '',
        },
        security: {
          jwtExpiresIn: '24h',
          jwtRefreshExpiresIn: '7d',
          bcryptRounds: 12,
          rateLimitWindow: 900000,
          rateLimitMax: 100,
        },
        app: {
          appName: 'E-VioPay',
          appUrl: process.env.REACT_APP_API_URL || '',
          frontendUrl: process.env.REACT_APP_FRONTEND_URL || '',
        },
      };
      
      // * Try to fetch from API if endpoint exists
      try {
        const response = await apiService.getSystemSettings();
        if (response.data) {
          setSettings(response.data);
        } else {
          setSettings(defaultSettings);
        }
      } catch {
        // * Fallback to defaults if API doesn't exist yet
        setSettings(defaultSettings);
      }
    } catch (error: any) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiService.updateSystemSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure system-wide settings and integrations.
        </p>
      </div>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary-600" />
            <CardTitle>Email Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="SMTP Host"
              value={settings.email.smtpHost}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('email', 'smtpHost', e.target.value)}
              placeholder="smtp.gmail.com"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="SMTP Port"
                type="number"
                value={settings.email.smtpPort.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('email', 'smtpPort', parseInt(e.target.value) || 587)}
                placeholder="587"
              />
              <Input
                label="SMTP User"
                type="email"
                value={settings.email.smtpUser}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('email', 'smtpUser', e.target.value)}
                placeholder="your-email@gmail.com"
              />
            </div>
            <Input
              label="From Email"
              type="email"
              value={settings.email.emailFrom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('email', 'emailFrom', e.target.value)}
              placeholder="traffic@laspinas.gov.ph"
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-success-600" />
            <CardTitle>SMS Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="form-label">SMS Provider</label>
              <select
                value={settings.sms.provider}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateSettings('sms', 'provider', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="twilio">Twilio</option>
              </select>
            </div>
            <Input
              label="Twilio Account SID"
              value={settings.sms.twilioAccountSid}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('sms', 'twilioAccountSid', e.target.value)}
              placeholder="ACxxxxxxxxxxxxx"
            />
            <Input
              label="Twilio Phone Number"
              value={settings.sms.twilioPhoneNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('sms', 'twilioPhoneNumber', e.target.value)}
              placeholder="+1234567890"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Gateway Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-secondary-600" />
            <CardTitle>Payment Gateway Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="PayMongo Secret Key"
                type="password"
                value={settings.payment.paymongoSecretKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('payment', 'paymongoSecretKey', e.target.value)}
                placeholder="sk_test_..."
              />
              <Input
                label="PayMongo Public Key"
                type="password"
                value={settings.payment.paymongoPublicKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('payment', 'paymongoPublicKey', e.target.value)}
                placeholder="pk_test_..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="GCash Client ID"
                type="password"
                value={settings.payment.gcashClientId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('payment', 'gcashClientId', e.target.value)}
                placeholder="GCash Client ID"
              />
              <Input
                label="Maya Client ID"
                type="password"
                value={settings.payment.mayaClientId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('payment', 'mayaClientId', e.target.value)}
                placeholder="Maya Client ID"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-danger-600" />
            <CardTitle>Security Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="JWT Token Expiry"
                value={settings.security.jwtExpiresIn}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('security', 'jwtExpiresIn', e.target.value)}
                placeholder="24h"
              />
              <Input
                label="Refresh Token Expiry"
                value={settings.security.jwtRefreshExpiresIn}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('security', 'jwtRefreshExpiresIn', e.target.value)}
                placeholder="7d"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="BCrypt Rounds"
                type="number"
                value={settings.security.bcryptRounds.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('security', 'bcryptRounds', parseInt(e.target.value) || 12)}
                placeholder="12"
              />
              <Input
                label="Rate Limit Window (ms)"
                type="number"
                value={settings.security.rateLimitWindow.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('security', 'rateLimitWindow', parseInt(e.target.value) || 900000)}
                placeholder="900000"
              />
              <Input
                label="Rate Limit Max Requests"
                type="number"
                value={settings.security.rateLimitMax.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('security', 'rateLimitMax', parseInt(e.target.value) || 100)}
                placeholder="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-warning-600" />
            <CardTitle>Application Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Application Name"
              value={settings.app.appName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('app', 'appName', e.target.value)}
              placeholder="E-VioPay"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Backend URL"
                value={settings.app.appUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('app', 'appUrl', e.target.value)}
                placeholder="http://localhost:5000"
              />
              <Input
                label="Frontend URL"
                value={settings.app.frontendUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('app', 'frontendUrl', e.target.value)}
                placeholder="http://localhost:3000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSave}
          loading={saving}
          size="lg"
        >
          <Save className="h-5 w-5 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
