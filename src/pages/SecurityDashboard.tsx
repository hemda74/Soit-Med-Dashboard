import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, AlertTriangle, CheckCircle, Settings, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SecurityConfiguration {
  id: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  
  // HTTPS Security
  enableHttpsRedirect: boolean;
  enableHsts: boolean;
  hstsMaxAge: number;
  hstsIncludeSubDomains: boolean;
  hstsPreload: boolean;
  
  // Content Security Policy
  enableCsp: boolean;
  cspDefaultSrc: string;
  cspScriptSrc: string;
  cspStyleSrc: string;
  cspImgSrc: string;
  cspConnectSrc: string;
  cspFontSrc: string;
  cspObjectSrc: string;
  cspMediaSrc: string;
  cspFrameSrc: string;
  
  // XSS Protection
  enableXssProtection: boolean;
  enableXssFilter: boolean;
  enableXssBlockMode: boolean;
  
  // Frame Protection
  enableFrameOptions: boolean;
  frameOptions: string;
  
  // Content Type Protection
  enableContentTypeOptions: boolean;
  
  // Rate Limiting
  enableRateLimiting: boolean;
  rateLimitRequestsPerMinute: number;
  rateLimitBurstSize: number;
  rateLimitAuthRequestsPerMinute: number;
  rateLimitAuthBurstSize: number;
  
  // CSRF Protection
  enableCsrfProtection: boolean;
  csrfHeaderName: string;
  csrfCookieName: string;
  
  // JWT Security
  enableHttpOnlyCookies: boolean;
  enableSecureCookies: boolean;
  enableSameSiteStrict: boolean;
  jwtExpirationMinutes: number;
  jwtRefreshExpirationDays: number;
  
  // Audit Logging
  enableAuditLogging: boolean;
  logFailedAuthAttempts: boolean;
  logSuccessfulAuthAttempts: boolean;
  logApiCalls: boolean;
  logSecurityEvents: boolean;
  
  // IP Security
  enableIpWhitelist: boolean;
  allowedIpRanges: string;
  enableIpBlacklist: boolean;
  blockedIpRanges: string;
  
  // Advanced Security
  enableInputSanitization: boolean;
  enableSqlInjectionProtection: boolean;
  enableRequestSizeLimit: boolean;
  maxRequestSizeBytes: number;
  
  // Security Headers
  enableReferrerPolicy: boolean;
  referrerPolicy: string;
  enablePermissionsPolicy: boolean;
  permissionsPolicy: string;
}

interface SecurityStatus {
  isConfigured: boolean;
  enabledFeaturesCount: number;
  totalFeaturesCount: number;
  securityScore: number;
  enabledFeatures: string[];
  disabledFeatures: string[];
  recommendations: string[];
  lastUpdated: string;
  lastUpdatedBy: string;
}

const SecurityDashboard: React.FC = () => {
  const [config, setConfig] = useState<SecurityConfiguration | null>(null);
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      const [configResponse, statusResponse] = await Promise.all([
        fetch('/api/security/configuration').then(r => r.json()),
        fetch('/api/security/status').then(r => r.json())
      ]);

      setConfig(configResponse);
      setStatus(statusResponse);
    } catch (error) {
      console.error('Error loading security data:', error);
      toast.error('Failed to load security configuration');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (featureName: string, enabled: boolean) => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/security/feature/${featureName}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enabled),
      });

      if (response.ok) {
        await loadSecurityData();
        toast.success(`Security feature ${enabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        throw new Error('Failed to toggle feature');
      }
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast.error('Failed to update security feature');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all security settings to defaults? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      
      const response = await fetch('/api/security/reset', {
        method: 'POST',
      });

      if (response.ok) {
        await loadSecurityData();
        toast.success('Security configuration reset to defaults');
      } else {
        throw new Error('Failed to reset configuration');
      }
    } catch (error) {
      console.error('Error resetting configuration:', error);
      toast.error('Failed to reset security configuration');
    } finally {
      setSaving(false);
    }
  };

  const testSecurityHeaders = async () => {
    try {
      const response = await fetch('/api/security/test');
      const data = await response.json();
      
      console.log('Security headers test result:', data);
      toast.success('Security headers test completed');
    } catch (error) {
      console.error('Error testing security headers:', error);
      toast.error('Failed to test security headers');
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSecurityScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-8 w-8 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-8 w-8 text-yellow-600" />;
    return <AlertTriangle className="h-8 w-8 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Security Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor application security settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testSecurityHeaders} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Test Headers
          </Button>
          <Button onClick={resetToDefaults} variant="destructive" disabled={saving}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Score</p>
                  <p className={`text-2xl font-bold ${getSecurityScoreColor(status.securityScore)}`}>
                    {status.securityScore}%
                  </p>
                </div>
                {getSecurityScoreIcon(status.securityScore)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Enabled Features</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {status.enabledFeaturesCount}/{status.totalFeaturesCount}
                  </p>
                </div>
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Configuration Status</p>
                  <p className="text-lg font-semibold">
                    {status.isConfigured ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Configured
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        Not Configured
                      </Badge>
                    )}
                  </p>
                </div>
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-sm font-semibold">
                    {status.lastUpdatedBy}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(status.lastUpdated).toLocaleString()}
                  </p>
                </div>
                <RefreshCw className="h-6 w-6 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {status && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Security Recommendations</CardTitle>
                  <CardDescription>
                    Suggestions to improve your security posture
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {status.recommendations.length > 0 ? (
                    <div className="space-y-2">
                      {status.recommendations.map((recommendation, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{recommendation}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <p className="text-green-600 font-medium">
                      All security features are properly configured!
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Enabled Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {status.enabledFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Disabled Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {status.disabledFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          {config && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Security Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="https-redirect">HTTPS Redirect</Label>
                    <Switch
                      id="https-redirect"
                      checked={config.enableHttpsRedirect}
                      onCheckedChange={(checked) => toggleFeature('httpsredirect', checked)}
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="hsts">HTTP Strict Transport Security</Label>
                    <Switch
                      id="hsts"
                      checked={config.enableHsts}
                      onCheckedChange={(checked) => toggleFeature('hsts', checked)}
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="xss-protection">XSS Protection</Label>
                    <Switch
                      id="xss-protection"
                      checked={config.enableXssProtection}
                      onCheckedChange={(checked) => toggleFeature('xssprotection', checked)}
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="frame-options">Frame Options</Label>
                    <Switch
                      id="frame-options"
                      checked={config.enableFrameOptions}
                      onCheckedChange={(checked) => toggleFeature('frameoptions', checked)}
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="content-type-options">Content Type Options</Label>
                    <Switch
                      id="content-type-options"
                      checked={config.enableContentTypeOptions}
                      onCheckedChange={(checked) => toggleFeature('contenttypeoptions', checked)}
                      disabled={saving}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Advanced Security Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rate-limiting">Rate Limiting</Label>
                    <Switch
                      id="rate-limiting"
                      checked={config.enableRateLimiting}
                      onCheckedChange={(checked) => toggleFeature('ratelimiting', checked)}
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="csrf-protection">CSRF Protection</Label>
                    <Switch
                      id="csrf-protection"
                      checked={config.enableCsrfProtection}
                      onCheckedChange={(checked) => toggleFeature('csrfprotection', checked)}
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="http-only-cookies">HTTP Only Cookies</Label>
                    <Switch
                      id="http-only-cookies"
                      checked={config.enableHttpOnlyCookies}
                      onCheckedChange={(checked) => toggleFeature('httponlycookies', checked)}
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="audit-logging">Audit Logging</Label>
                    <Switch
                      id="audit-logging"
                      checked={config.enableAuditLogging}
                      onCheckedChange={(checked) => toggleFeature('auditlogging', checked)}
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="input-sanitization">Input Sanitization</Label>
                    <Switch
                      id="input-sanitization"
                      checked={config.enableInputSanitization}
                      onCheckedChange={(checked) => toggleFeature('inputsanitization', checked)}
                      disabled={saving}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="headers" className="space-y-6">
          {config && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Security Policy</CardTitle>
                  <CardDescription>
                    Configure CSP headers to prevent XSS attacks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="csp-enabled">Enable CSP</Label>
                    <Switch
                      id="csp-enabled"
                      checked={config.enableCsp}
                      onCheckedChange={(checked) => toggleFeature('csp', checked)}
                      disabled={saving}
                    />
                  </div>

                  {config.enableCsp && (
                    <>
                      <div>
                        <Label htmlFor="csp-default-src">Default Source</Label>
                        <Input
                          id="csp-default-src"
                          value={config.cspDefaultSrc}
                          className="mt-1"
                          disabled
                        />
                      </div>

                      <div>
                        <Label htmlFor="csp-script-src">Script Source</Label>
                        <Input
                          id="csp-script-src"
                          value={config.cspScriptSrc}
                          className="mt-1"
                          disabled
                        />
                      </div>

                      <div>
                        <Label htmlFor="csp-style-src">Style Source</Label>
                        <Input
                          id="csp-style-src"
                          value={config.cspStyleSrc}
                          className="mt-1"
                          disabled
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Security Headers</CardTitle>
                  <CardDescription>
                    Configure additional security headers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="referrer-policy">Referrer Policy</Label>
                    <Switch
                      id="referrer-policy"
                      checked={config.enableReferrerPolicy}
                      onCheckedChange={(checked) => toggleFeature('referrerpolicy', checked)}
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="permissions-policy">Permissions Policy</Label>
                    <Switch
                      id="permissions-policy"
                      checked={config.enablePermissionsPolicy}
                      onCheckedChange={(checked) => toggleFeature('permissionspolicy', checked)}
                      disabled={saving}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          {config && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>IP Security</CardTitle>
                  <CardDescription>
                    Configure IP-based access controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ip-whitelist">IP Whitelist</Label>
                    <Switch
                      id="ip-whitelist"
                      checked={config.enableIpWhitelist}
                      onCheckedChange={(checked) => toggleFeature('ipwhitelist', checked)}
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="ip-blacklist">IP Blacklist</Label>
                    <Switch
                      id="ip-blacklist"
                      checked={config.enableIpBlacklist}
                      onCheckedChange={(checked) => toggleFeature('ipblacklist', checked)}
                      disabled={saving}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rate Limiting Configuration</CardTitle>
                  <CardDescription>
                    Configure rate limiting parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="rate-limit-requests">Requests per Minute</Label>
                    <Input
                      id="rate-limit-requests"
                      type="number"
                      value={config.rateLimitRequestsPerMinute}
                      className="mt-1"
                      disabled
                    />
                  </div>

                  <div>
                    <Label htmlFor="rate-limit-burst">Burst Size</Label>
                    <Input
                      id="rate-limit-burst"
                      type="number"
                      value={config.rateLimitBurstSize}
                      className="mt-1"
                      disabled
                    />
                  </div>

                  <div>
                    <Label htmlFor="auth-rate-limit">Auth Requests per Minute</Label>
                    <Input
                      id="auth-rate-limit"
                      type="number"
                      value={config.rateLimitAuthRequestsPerMinute}
                      className="mt-1"
                      disabled
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;
