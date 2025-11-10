import React, { useEffect, useState } from 'react';
import { Settings, Save, Mail, Phone, CreditCard, Shield, Server } from 'lucide-react';
import { Card, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import PageHeader from '../../components/Layout/PageHeader';
import PageSection from '../../components/Layout/PageSection';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;

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
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [settings, setSettings] = useState<SystemSettings>({
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      emailFrom: ''
    },
    sms: {
      provider: 'twilio',
      twilioAccountSid: '',
      twilioPhoneNumber: ''
    },
    payment: {
      paymongoSecretKey: '',
      paymongoPublicKey: '',
      gcashClientId: '',
      mayaClientId: ''
    },
    security: {
      jwtExpiresIn: '24h',
      jwtRefreshExpiresIn: '7d',
      bcryptRounds: 12,
      rateLimitWindow: 900000,
      rateLimitMax: 100
    },
    app: {
      appName: 'E-VioPay',
      appUrl: '',
      frontendUrl: ''
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const defaultSettings: SystemSettings = {
        email: {
          smtpHost: process.env.REACT_APP_SMTP_HOST || '',
          smtpPort: Number.parseInt(process.env.REACT_APP_SMTP_PORT || '587', 10),
          smtpUser: '',
          emailFrom: process.env.REACT_APP_EMAIL_FROM || ''
        },
        sms: {
          provider: 'twilio',
          twilioAccountSid: '',
          twilioPhoneNumber: ''
        },
        payment: {
          paymongoSecretKey: '',
          paymongoPublicKey: '',
          gcashClientId: '',
          mayaClientId: ''
        },
        security: {
          jwtExpiresIn: '24h',
          jwtRefreshExpiresIn: '7d',
          bcryptRounds: 12,
          rateLimitWindow: 900000,
          rateLimitMax: 100
        },
        app: {
          appName: 'E-VioPay',
          appUrl: process.env.REACT_APP_API_URL || '',
          frontendUrl: process.env.REACT_APP_FRONTEND_URL || ''
        }
      };

      try {
        const response = await apiService.getSystemSettings();
        setSettings(response.data ?? defaultSettings);
      } catch {
        setSettings(defaultSettings);
      }
    } catch (error) {
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
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof SystemSettings, field: string, value: string | number) => {
    setSettings((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 pb-12 pt-8">
      <PageHeader
        title="Configuration"
        subtitle="Harden communications, payments, and security before shipping changes to citizens."
        icon={Settings}
        actions={(
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving} className="px-5">
            <Save className="mr-2 h-4 w-4" />
            Save all
          </Button>
        )}
      />

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <PageSection title="Messaging" description="Configure SMTP and SMS gateways for official notices.">
            <div className="space-y-6">
              <div className="rounded-3xl border border-primary-50 bg-primary-50/60 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary-600 p-2 text-white">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Email delivery</h3>
                    <p className="text-sm text-gray-600">Used for payment receipts and verification links.</p>
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  <Input
                    name="smtpHost"
                    label="SMTP host"
                    value={settings.email.smtpHost}
                    onChange={(event: InputChangeEvent) => updateSettings('email', 'smtpHost', event.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      name="smtpPort"
                      label="SMTP port"
                      type="number"
                      value={settings.email.smtpPort.toString()}
                      onChange={(event: InputChangeEvent) => updateSettings('email', 'smtpPort', Number.parseInt(event.target.value || '587', 10))}
                      placeholder="587"
                    />
                    <Input
                      name="smtpUser"
                      label="SMTP username"
                      value={settings.email.smtpUser}
                      onChange={(event: InputChangeEvent) => updateSettings('email', 'smtpUser', event.target.value)}
                      placeholder="notifications@laspinas.gov.ph"
                    />
                  </div>
                  <Input
                    name="emailFrom"
                    label="Default from email"
                    value={settings.email.emailFrom}
                    onChange={(event: InputChangeEvent) => updateSettings('email', 'emailFrom', event.target.value)}
                    placeholder="traffic@laspinas.gov.ph"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-secondary-100 bg-secondary-50/60 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-secondary-600 p-2 text-white">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">SMS reminders</h3>
                    <p className="text-sm text-gray-600">Citizens receive due date alerts straight to their phones.</p>
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  <label className="form-label">Provider</label>
                  <select
                    value={settings.sms.provider}
                    onChange={(event: SelectChangeEvent) => updateSettings('sms', 'provider', event.target.value)}
                    className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="twilio">Twilio</option>
                  </select>
                  <Input
                    name="twilioAccountSid"
                    label="Twilio Account SID"
                    value={settings.sms.twilioAccountSid}
                    onChange={(event: InputChangeEvent) => updateSettings('sms', 'twilioAccountSid', event.target.value)}
                    placeholder="ACxxxxxxxxxxxx"
                  />
                  <Input
                    name="twilioPhoneNumber"
                    label="Twilio sender number"
                    value={settings.sms.twilioPhoneNumber}
                    onChange={(event: InputChangeEvent) => updateSettings('sms', 'twilioPhoneNumber', event.target.value)}
                    placeholder="+63xxxxxxxxxx"
                  />
                </div>
              </div>
            </div>
          </PageSection>

          <PageSection title="Payments & security" description="Manage payment gateways and platform hardening policies.">
            <div className="grid gap-6">
              <div className="rounded-3xl border border-warning-100 bg-warning-50/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-warning-500/90 p-2 text-white">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Payment gateways</h3>
                    <p className="text-sm text-gray-600">Key the live credentials securely from the treasury office.</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Input
                    name="paymongoSecretKey"
                    label="PayMongo secret key"
                    type="password"
                    value={settings.payment.paymongoSecretKey}
                    onChange={(event: InputChangeEvent) => updateSettings('payment', 'paymongoSecretKey', event.target.value)}
                    placeholder="sk_live_..."
                  />
                  <Input
                    name="paymongoPublicKey"
                    label="PayMongo public key"
                    type="password"
                    value={settings.payment.paymongoPublicKey}
                    onChange={(event: InputChangeEvent) => updateSettings('payment', 'paymongoPublicKey', event.target.value)}
                    placeholder="pk_live_..."
                  />
                  <Input
                    name="gcashClientId"
                    label="GCash client ID"
                    type="password"
                    value={settings.payment.gcashClientId}
                    onChange={(event: InputChangeEvent) => updateSettings('payment', 'gcashClientId', event.target.value)}
                    placeholder="GCash client ID"
                  />
                  <Input
                    name="mayaClientId"
                    label="Maya client ID"
                    type="password"
                    value={settings.payment.mayaClientId}
                    onChange={(event: InputChangeEvent) => updateSettings('payment', 'mayaClientId', event.target.value)}
                    placeholder="Maya client ID"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-danger-100 bg-danger-50/60 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-danger-500/90 p-2 text-white">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Security posture</h3>
                    <p className="text-sm text-gray-600">Token expiry, hashing cost, and API rate limiting.</p>
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      name="jwtExpiresIn"
                      label="JWT expiry"
                      value={settings.security.jwtExpiresIn}
                      onChange={(event: InputChangeEvent) => updateSettings('security', 'jwtExpiresIn', event.target.value)}
                      placeholder="24h"
                    />
                    <Input
                      name="jwtRefreshExpiresIn"
                      label="Refresh token expiry"
                      value={settings.security.jwtRefreshExpiresIn}
                      onChange={(event: InputChangeEvent) => updateSettings('security', 'jwtRefreshExpiresIn', event.target.value)}
                      placeholder="7d"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Input
                      name="bcryptRounds"
                      label="BCrypt rounds"
                      type="number"
                      value={settings.security.bcryptRounds.toString()}
                      onChange={(event: InputChangeEvent) => updateSettings('security', 'bcryptRounds', Number.parseInt(event.target.value || '12', 10))}
                      placeholder="12"
                    />
                    <Input
                      name="rateLimitWindow"
                      label="Rate limit window (ms)"
                      type="number"
                      value={settings.security.rateLimitWindow.toString()}
                      onChange={(event: InputChangeEvent) => updateSettings('security', 'rateLimitWindow', Number.parseInt(event.target.value || '900000', 10))}
                      placeholder="900000"
                    />
                    <Input
                      name="rateLimitMax"
                      label="Max requests"
                      type="number"
                      value={settings.security.rateLimitMax.toString()}
                      onChange={(event: InputChangeEvent) => updateSettings('security', 'rateLimitMax', Number.parseInt(event.target.value || '100', 10))}
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </PageSection>
        </div>

        <div className="space-y-6">
          <PageSection title="Application identity" headerAlignment="left">
            <Card className="border border-gray-100 bg-white/95 shadow-xl">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-600 p-2 text-white">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Routing</h3>
                    <p className="text-sm text-gray-600">Ensure the URLs match deployed infrastructure.</p>
                  </div>
                </div>
                <Input
                  name="appName"
                  label="Application name"
                  value={settings.app.appName}
                  onChange={(event: InputChangeEvent) => updateSettings('app', 'appName', event.target.value)}
                  placeholder="E-VioPay"
                />
                <Input
                  name="appUrl"
                  label="Backend URL"
                  value={settings.app.appUrl}
                  onChange={(event: InputChangeEvent) => updateSettings('app', 'appUrl', event.target.value)}
                  placeholder="https://api.laspinas.gov.ph"
                />
                <Input
                  name="frontendUrl"
                  label="Frontend URL"
                  value={settings.app.frontendUrl}
                  onChange={(event: InputChangeEvent) => updateSettings('app', 'frontendUrl', event.target.value)}
                  placeholder="https://pay.laspinas.gov.ph"
                />
              </CardContent>
            </Card>
          </PageSection>

          <PageSection title="Deployment checklist" headerAlignment="left" className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                <span className="h-2 w-2 rounded-full bg-success-300" />
                Verify DNS records and SSL renewal dates.
              </li>
              <li className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                <span className="h-2 w-2 rounded-full bg-success-300" />
                Rotate PayMongo and Twilio keys quarterly.
              </li>
              <li className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                <span className="h-2 w-2 rounded-full bg-success-300" />
                Validate webhook endpoints on staging before promotion.
              </li>
            </ul>
          </PageSection>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
