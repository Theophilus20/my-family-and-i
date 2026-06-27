// lib/plans.js
// Central source of truth for what each plan allows.
// Used by API routes (enforcement) and pages (UI gating).

export const PLAN_LIMITS = {
  free: {
    maxMemories: 30,
    maxCapsules: 1,
    maxStorageBytes: 1 * 1024 * 1024 * 1024, // 1 GB
    maxFamilyMembers: 0,
    features: {
      biographer: false,
      wisdom: false,
      personality: false,
      family: false,
      MyFamilyandITree: false,
      fullTimeline: false, // basic timeline only
    },
  },
  premium: {
    maxMemories: Infinity,
    maxCapsules: Infinity,
    maxStorageBytes: 50 * 1024 * 1024 * 1024, // generous cap
    maxFamilyMembers: 3,
    features: {
      biographer: true,
      wisdom: true,
      personality: false, // Family-only per your tiers
      family: true,
      MyFamilyandITree: false,  // Family-only
      fullTimeline: true,
    },
  },
  family: {
    maxMemories: Infinity,
    maxCapsules: Infinity,
    maxStorageBytes: 100 * 1024 * 1024 * 1024,
    maxFamilyMembers: Infinity,
    features: {
      biographer: true,
      wisdom: true,
      personality: true,
      family: true,
      fullTimeline: true,
    },
  },
};

export function getLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export function canUseFeature(plan, feature) {
  return !!getLimits(plan).features[feature];
}

// Friendly labels for upgrade prompts
export const FEATURE_LABELS = {
  biographer: 'AI Biographer',
  wisdom: 'Wisdom Engine',
  personality: 'Digital Personality',
  family: 'Family Vault',
  };

// Which plan unlocks a given feature (for "Upgrade to X" messaging)
export const FEATURE_MIN_PLAN = {
  biographer: 'premium',
  wisdom: 'premium',
  family: 'premium',
  personality: 'family',
  };
  export const FEATURE_REQUIREMENTS = {
  targetedCapsule: 'family',
  familyVault: 'premium',
};

// True if the given plan meets/exceeds the required plan for a feature.
const PLAN_ORDER = { free: 0, premium: 1, family: 2 };
export function planAllows(plan, requiredPlan) {
  return (PLAN_ORDER[plan] ?? 0) >= (PLAN_ORDER[requiredPlan] ?? 99);
}