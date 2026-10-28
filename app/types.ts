export type Category = "Productivity" | "CRM" | "DevTools" | "Communication" | "Storage";
export type Difficulty = "Instant" | "Low" | "Medium" | "High" | "Enterprise Gated";

export interface OAuthGuide {
  id: string;
  appName: string;
  appLogoUrl?: string;
  websiteUrl: string;
  category: Category;
  difficulty: Difficulty;
  estimatedDevTimeMinutes: number;
  estimatedApprovalDays: number;
  frictionScore: number;
  scopes: string[];
  agentVsHumanMatrix: { agentAutomatedTasks: string[]; humanRequiredTasks: string[] };
  summary: string;
  requirementsChecklist: {
    domainVerificationRequired: boolean;
    privacyPolicyRequired: boolean;
    paidAccountRequired: boolean;
    videoDemoRequired: boolean;
    thirdPartyAuditRequired: boolean;
  };
  steps: { stepNumber: number; title: string; description: string; actionableTips: string[]; isAgentHelpable: boolean }[];
  blockersAndNuances: string[];
  verificationStatus: { testedByAgent: boolean; verifiedSources: string[]; unverifiedNotes?: string };
}
