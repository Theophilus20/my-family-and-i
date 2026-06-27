'use client';

import { createContext, useContext, useState } from 'react';

const EN = {
  nav_features: 'Features', nav_pricing: 'Pricing', nav_family: 'Family',
  login: 'Log in', signup: 'Sign up', logout: 'Log out',
  get_started: 'Get started free', watch_demo: 'Watch demo',
  hero_title_1: 'Every story', hero_title_2: 'deserves to', hero_title_3: 'outlive you',
  hero_sub: 'A secure digital vault that preserves your memories, wisdom, and life story, then makes them intelligently available to the people you love, forever.',
  encrypted: 'End-to-end encrypted', loved_by: 'Loved by families', ai_powered: 'AI-powered biographer', free_to_start: 'Free to start',
  how_title: 'Simple for everyone',
  how_1_title: 'Upload your memories', how_1_desc: 'Add stories, photos, videos, audio recordings, letters, and documents. Every format is supported.',
  how_2_title: 'AI organizes everything', how_2_desc: 'Our AI extracts dates, lessons, themes, and milestones, then weaves them into your life biography.',
  how_3_title: 'Set time capsules', how_3_desc: 'Write messages for the future. Set them to unlock on a date, or when a milestone happens.',
  how_4_title: 'Share with family', how_4_desc: 'Invite family members. Control exactly who can view and access your legacy.',
  features_title: 'Everything your Family', features_highlight: 'needs',
  pricing_title: 'Start free. Grow with', pricing_highlight: 'your My Family',
  per_month: '/ month', forever: 'forever',
  most_popular: 'Most popular',
  cta_title: 'Your story deserves to live forever',
  cta_sub: 'Start preserving your memories today.',
  overview: 'Overview', memory_vault: 'Memory Vault', ai_biographer: 'AI Biographer',
  capsules: 'Capsules', wisdom: 'Wisdom', timeline: 'Timeline',
  billing: 'Billing', profile: 'Profile', digital_personality: 'Digital Personality',
  greeting: 'Good morning', tagline: 'Your legacy is growing.',
  your_legacy_score: 'Your Legacy Score', complete: 'complete',
  recent_memories: 'Recent memories', view_all: 'View all',
  quick_actions: 'Quick actions',
  add_memory: 'Add Memory', generate_bio: 'Generate Bio',
  new_capsule: 'New Capsule', log_wisdom: 'Log Wisdom',
  search: 'Search...', all: 'All',
  memory_type: 'Memory type', title: 'Title', your_story: 'Your story',
  attach_file: 'Attach file (optional)', save_memory: 'Save memory', cancel: 'Cancel',
  back_to_memories: 'Back to memories', no_memories: 'No memories found',
  locked: 'Locked', unlocked: 'Unlocked',
  back_to_capsules: 'Back to capsules',
  back_to_wisdom: 'Back to wisdom', the_lesson: 'The lesson', source: 'Source',
  save_lesson: 'Save lesson', log_lesson: 'Log a Wisdom', category: 'Category',
  generate_chapter: 'Generate chapter', key_lessons: 'Key lessons',
  reading_memories: 'Reading memories', finding_themes: 'Finding themes',
  writing_draft: 'Writing draft', polishing: 'Polishing',
  add_event: 'Add event',
  full_name: 'Full name', email: 'Email', password: 'Password',
  confirm_password: 'Confirm password', forgot_password: 'Forgot password?',
  processing: 'Processing...', or_continue: 'or continue with',
  welcome_back: 'Welcome back!', account_created: 'Account created!',
  no_account: 'No account yet?', already_have: 'Already have one?',
  sign_up_free: 'Sign up free',
  terms: 'Terms', privacy_policy: 'Privacy Policy',
  my_profile: 'My Profile', profile_sub: 'Manage your personal information and account settings',
  personal: 'personal', security: 'security', notifications: 'notifications', privacy: 'privacy',
  personal_info: 'Personal Information', edit: 'Edit', save_changes: 'Save changes', saved: 'Saved!',
  change_password: 'Change Password', current_password: 'Current password',
  new_password: 'New password', confirm_new: 'Confirm new password',
  danger_zone: 'Danger zone', delete_account: 'Delete account',
  notif_prefs: 'Notification Preferences', privacy_settings: 'Privacy Settings',
  subscription: 'Subscription & Billing', billing_sub: 'Manage your plan, payment, and billing preferences',
  current_plan: 'Current plan', cancel_plan: 'Cancel plan', manage_billing: 'Manage billing',
  choose_plan: 'Choose a plan', payment_method: 'Payment method', billing_history: 'Billing history',
  upgrade: 'Upgrade', downgrade: 'Downgrade', switching: 'Switching...',
  page_not_found: 'Page not found', back_home: 'Back to home',
  dark_mode: 'Dark mode', light_mode: 'Light mode', language: 'Language',
};

export const TRANSLATIONS = { en: EN };

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en');
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}