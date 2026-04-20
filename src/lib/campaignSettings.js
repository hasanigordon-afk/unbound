import { base44 } from "@/api/base44Client";

export const DEFAULT_SETTINGS = {
  setting_key: "main",
  donation_enabled: true,
  donation_headline: "Support Recovery. Fuel Hope. Change Lives.",
  donation_subheadline: "Your donation helps us grow a platform dedicated to addiction recovery support, encouragement, accountability, and second chances.",
  mission_statement: "This campaign exists to support people fighting addiction, rebuilding their lives, and seeking tools, guidance, and hope. Donations help strengthen the platform, expand features, and support outreach to people and facilities who need it most.",
  donation_amounts: [5, 10, 25, 50, 100],
  thank_you_message: "Thank you for supporting this recovery movement. Your contribution helps us build hope, access, and accountability for people who need it most.",
  push_prompt_headline: "Stay Connected to Recovery",
  push_prompt_body: "Turn on notifications to receive encouragement, recovery reminders, important app updates, and community messages that help keep you connected to healing.",
  campaign_announcement: "",
  campaign_announcement_active: false,
  donation_goal: 50000,
  donation_raised: 0,
  banner_image_url: "",
};

/**
 * Loads the main campaign settings, falling back to defaults.
 */
export async function getCampaignSettings() {
  const rows = await base44.entities.CampaignSettings.filter({ setting_key: "main" });
  if (rows.length > 0) {
    return { ...DEFAULT_SETTINGS, ...rows[0] };
  }
  return DEFAULT_SETTINGS;
}

/**
 * Creates or updates the main campaign settings.
 */
export async function saveCampaignSettings(updates) {
  const rows = await base44.entities.CampaignSettings.filter({ setting_key: "main" });
  if (rows.length > 0) {
    return base44.entities.CampaignSettings.update(rows[0].id, updates);
  }
  return base44.entities.CampaignSettings.create({ setting_key: "main", ...updates });
}