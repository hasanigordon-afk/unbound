import React from "react";
import { Check, ExternalLink, Copy, Database, Globe, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ContentfulSetup() {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-6 pt-8 pb-6" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <h1>Contentful CMS Setup Guide</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Configure Contentful as your content management system
        </p>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-4xl">
        {/* Step 1 */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary)', color: '#FFF' }}>
              1
            </div>
            <div className="flex-1">
              <h3 className="mb-2">Create Contentful Account</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                Sign up for a free Contentful account if you don't have one yet.
              </p>
              <Button
                onClick={() => window.open('https://www.contentful.com/sign-up/', '_blank')}
                className="btn-secondary"
              >
                <ExternalLink className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Go to Contentful
              </Button>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary)', color: '#FFF' }}>
              2
            </div>
            <div className="flex-1">
              <h3 className="mb-2">Create Content Models</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                In your Contentful space, create these 5 content models with the specified fields:
              </p>

              {/* Resource Model */}
              <div className="mb-4 p-4" style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <Database className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
                    Resource
                  </h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>name</code> <span style={{ color: 'var(--text-muted)' }}>(Text, required)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>level</code> <span style={{ color: 'var(--text-muted)' }}>(Text: national/state/local)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>category</code> <span style={{ color: 'var(--text-muted)' }}>(Text)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>state</code> <span style={{ color: 'var(--text-muted)' }}>(Text, short)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>zipCodes</code> <span style={{ color: 'var(--text-muted)' }}>(List of Text)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>address, city, phone, website, hours, description</code> <span style={{ color: 'var(--text-muted)' }}>(Text)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>tags</code> <span style={{ color: 'var(--text-muted)' }}>(List of Text)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>latitude, longitude</code> <span style={{ color: 'var(--text-muted)' }}>(Number, decimal)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>isActive</code> <span style={{ color: 'var(--text-muted)' }}>(Boolean, default true)</span>
                  </div>
                </div>
              </div>

              {/* State Profile Model */}
              <div className="mb-4 p-4" style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius)' }}>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  <Globe className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
                  StateProfile
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>stateCode</code> <span style={{ color: 'var(--text-muted)' }}>(Text, required, e.g. "CA")</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>stateName</code> <span style={{ color: 'var(--text-muted)' }}>(Text)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>dmvWebsite, snapWebsite, medicaidWebsite, unemploymentWebsite, housingAssistanceWebsite</code> <span style={{ color: 'var(--text-muted)' }}>(Text, URL)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>crisisHotline</code> <span style={{ color: 'var(--text-muted)' }}>(Text)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>reentryPrograms, complianceRequirements</code> <span style={{ color: 'var(--text-muted)' }}>(JSON)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>notes</code> <span style={{ color: 'var(--text-muted)' }}>(Long text)</span>
                  </div>
                </div>
              </div>

              {/* Facility Profile Model */}
              <div className="mb-4 p-4" style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius)' }}>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  <Database className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
                  FacilityProfile
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>facilityId</code> <span style={{ color: 'var(--text-muted)' }}>(Text, required)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>facilityName, logoUrl, primaryColor, accentColor</code> <span style={{ color: 'var(--text-muted)' }}>(Text)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>welcomeMessage</code> <span style={{ color: 'var(--text-muted)' }}>(Long text)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>featuredResourceIds</code> <span style={{ color: 'var(--text-muted)' }}>(List of Text)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>messageTemplates, customNudges</code> <span style={{ color: 'var(--text-muted)' }}>(JSON)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>complianceThresholds, brandedContent</code> <span style={{ color: 'var(--text-muted)' }}>(JSON)</span>
                  </div>
                </div>
              </div>

              {/* Roadmap Task Template Model */}
              <div className="mb-4 p-4" style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius)' }}>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  <Code className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
                  RoadmapTaskTemplate
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>phase</code> <span style={{ color: 'var(--text-muted)' }}>(Number: 1, 2, or 3)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>taskName, taskDescription</code> <span style={{ color: 'var(--text-muted)' }}>(Text)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>sortOrder, estimatedDays</code> <span style={{ color: 'var(--text-muted)' }}>(Number)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>scope</code> <span style={{ color: 'var(--text-muted)' }}>(Text: default/state/facility)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>scopeId</code> <span style={{ color: 'var(--text-muted)' }}>(Text: state code or facility ID)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>resources</code> <span style={{ color: 'var(--text-muted)' }}>(JSON)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>isActive</code> <span style={{ color: 'var(--text-muted)' }}>(Boolean, default true)</span>
                  </div>
                </div>
              </div>

              {/* Message Template Model */}
              <div className="p-4" style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius)' }}>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  <Code className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
                  MessageTemplate
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>templateName</code> <span style={{ color: 'var(--text-muted)' }}>(Text, required)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>templateType</code> <span style={{ color: 'var(--text-muted)' }}>(Text: nudge/welcome/milestone/reminder/alert)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>subject, body</code> <span style={{ color: 'var(--text-muted)' }}>(Text)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>scope</code> <span style={{ color: 'var(--text-muted)' }}>(Text: default/facility)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>scopeId</code> <span style={{ color: 'var(--text-muted)' }}>(Text: facility ID)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>variables</code> <span style={{ color: 'var(--text-muted)' }}>(List: participant_name, streak_count, etc.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <code>isActive</code> <span style={{ color: 'var(--text-muted)' }}>(Boolean, default true)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary)', color: '#FFF' }}>
              3
            </div>
            <div className="flex-1">
              <h3 className="mb-2">Get API Credentials</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                In Contentful: Settings → API Keys → Add API Key (Content Delivery API)
              </p>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                You need three values:
              </p>
              <div className="space-y-2">
                <div className="p-3" style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius)' }}>
                  <code className="text-xs block" style={{ color: 'var(--text-primary)' }}>Space ID</code>
                </div>
                <div className="p-3" style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius)' }}>
                  <code className="text-xs block" style={{ color: 'var(--text-primary)' }}>Content Delivery API - access token</code>
                </div>
                <div className="p-3" style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius)' }}>
                  <code className="text-xs block" style={{ color: 'var(--text-primary)' }}>Environment (usually "master")</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary)', color: '#FFF' }}>
              4
            </div>
            <div className="flex-1">
              <h3 className="mb-2">Configure Secrets</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                Go to your Base44 app Dashboard → Settings → Secrets and add these three secrets with your Contentful credentials:
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3" style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius)' }}>
                  <code className="text-xs" style={{ color: 'var(--text-primary)' }}>CONTENTFUL_SPACE_ID</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard('CONTENTFUL_SPACE_ID')}
                  >
                    <Copy className="w-3 h-3" strokeWidth={1.5} />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3" style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius)' }}>
                  <code className="text-xs" style={{ color: 'var(--text-primary)' }}>CONTENTFUL_ACCESS_TOKEN</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard('CONTENTFUL_ACCESS_TOKEN')}
                  >
                    <Copy className="w-3 h-3" strokeWidth={1.5} />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3" style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius)' }}>
                  <code className="text-xs" style={{ color: 'var(--text-primary)' }}>CONTENTFUL_ENVIRONMENT</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard('CONTENTFUL_ENVIRONMENT')}
                  >
                    <Copy className="w-3 h-3" strokeWidth={1.5} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 5 */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary)', color: '#FFF' }}>
              5
            </div>
            <div className="flex-1">
              <h3 className="mb-2">Add Sample Content</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                Create some sample entries in each content model to test the integration.
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Example: Create a national crisis hotline resource, a state profile for your state, and a few roadmap tasks for Phase 1.
              </p>
            </div>
          </div>
        </div>

        {/* Architecture Note */}
        <div className="p-4" style={{ background: 'rgba(74,144,226,0.1)', border: '1px solid var(--primary)', borderRadius: 'var(--radius)' }}>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--primary)' }}>🏗️ Architecture</h4>
          <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
            <p><strong>Contentful stores:</strong> Resources, state profiles, facility branding, roadmap templates, message templates</p>
            <p><strong>Base44 database stores:</strong> User accounts, check-ins, chat messages, progress tracking, incentives</p>
            <p><strong>Caching:</strong> Content cached locally for 24 hours, refreshed in background</p>
          </div>
        </div>

        {/* Security Note */}
        <div className="p-4" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)' }}>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--accent)' }}>🔒 Security</h4>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sensitive user data (check-ins, chat messages, personal info) is never stored in Contentful—only in the secure Base44 database. Contentful only stores non-sensitive directory and program content.
          </p>
        </div>
      </div>
    </div>
  );
}