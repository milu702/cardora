/**
 * Validation Utilities for Cardora Auth & User Input
 */

// Regex for robust Email and Domain Validation
// Enforces standard username, '@', valid domain name, and at least 2-letter TLD (e.g. .com, .org, .co.in)
export const EMAIL_DOMAIN_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates whether an email string has a valid email address and domain structure.
 * @param {string} email 
 * @returns {{ valid: boolean, message: string }}
 */
export const validateEmailDomain = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email address is required.' };
  }

  const trimmed = email.trim();
  if (!trimmed) {
    return { valid: false, message: 'Email address cannot be empty.' };
  }

  if (!trimmed.includes('@')) {
    return { valid: false, message: 'Email address must contain an "@" symbol.' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { valid: false, message: 'Email address format is invalid.' };
  }

  const [local, domain] = parts;

  if (!local || local.length === 0) {
    return { valid: false, message: 'Email username prefix is missing.' };
  }

  if (!domain || !domain.includes('.')) {
    return { valid: false, message: 'Email domain must contain a valid domain extension (e.g., @domain.com).' };
  }

  if (domain.includes('..')) {
    return { valid: false, message: 'Email domain cannot contain consecutive dots.' };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];

  if (!tld || tld.length < 2) {
    return { valid: false, message: 'Email top-level domain (e.g., .com, .in) must be at least 2 characters.' };
  }

  if (!EMAIL_DOMAIN_REGEX.test(trimmed)) {
    return { valid: false, message: 'Please enter a valid email address with a valid domain (e.g. user@domain.com).' };
  }

  return { valid: true, message: '' };
};

/**
 * Evaluates password strength against security requirements.
 * Requirements:
 * - At least 8 characters long
 * - Contains at least one uppercase letter (A-Z)
 * - Contains at least one lowercase letter (a-z)
 * - Contains at least one numeric digit (0-9)
 * - Contains at least one special character (!@#$%^&* etc.)
 * 
 * @param {string} password 
 * @returns {{
 *   isValid: boolean,
 *   score: number,
 *   label: string,
 *   color: string,
 *   textColor: string,
 *   barWidth: string,
 *   checks: {
 *     hasMinLength: boolean,
 *     hasUpper: boolean,
 *     hasLower: boolean,
 *     hasNumber: boolean,
 *     hasSpecial: boolean
 *   },
 *   message: string
 * }}
 */
export const checkPasswordStrength = (password = '') => {
  const pwd = typeof password === 'string' ? password : '';

  const checks = {
    hasMinLength: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd),
  };

  const passedCount = Object.values(checks).filter(Boolean).length;
  const isValid = passedCount === 5;

  let label = 'Too Short';
  let color = 'bg-red-500';
  let textColor = 'text-red-600';
  let barWidth = '20%';

  if (!pwd) {
    label = 'Empty';
    barWidth = '0%';
    color = 'bg-gray-300';
    textColor = 'text-gray-400';
  } else if (passedCount <= 2) {
    label = 'Weak';
    barWidth = '25%';
    color = 'bg-red-500';
    textColor = 'text-red-600';
  } else if (passedCount === 3) {
    label = 'Fair';
    barWidth = '50%';
    color = 'bg-orange-500';
    textColor = 'text-orange-600';
  } else if (passedCount === 4) {
    label = 'Good';
    barWidth = '75%';
    color = 'bg-yellow-500';
    textColor = 'text-yellow-600';
  } else if (passedCount === 5) {
    label = 'Strong';
    barWidth = '100%';
    color = 'bg-emerald-600';
    textColor = 'text-emerald-600';
  }

  let message = '';
  if (!isValid && pwd.length > 0) {
    const missing = [];
    if (!checks.hasMinLength) missing.push('at least 8 characters');
    if (!checks.hasUpper) missing.push('1 uppercase letter');
    if (!checks.hasLower) missing.push('1 lowercase letter');
    if (!checks.hasNumber) missing.push('1 number');
    if (!checks.hasSpecial) missing.push('1 special character');

    message = `Password must include: ${missing.join(', ')}.`;
  }

  return {
    isValid,
    score: passedCount,
    label,
    color,
    textColor,
    barWidth,
    checks,
    message,
  };
};
