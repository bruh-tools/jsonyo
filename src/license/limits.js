// jsonyo - usage limits
// https://bruh.tools/jsonyo

const fs = require('fs');
const { isPro } = require('./checker');
const { LIMITS } = require('./constants');
const { getUsage, incrementUsage } = require('../utils/config');
const { showUpsell, UPSELL_TYPES } = require('../utils/upsell');
const { formatBytes } = require('../utils/output');

function getLimits() {
  return isPro() ? LIMITS.PRO : LIMITS.FREE;
}

function checkFileSize(filePath) {
  const limits = getLimits();

  try {
    const stats = fs.statSync(filePath);
    if (stats.size > limits.maxFileSize) {
      if (!isPro()) {
        showUpsell(UPSELL_TYPES.FILE_SIZE, {
          size: formatBytes(stats.size),
          limit: formatBytes(LIMITS.FREE.maxFileSize),
        });
      }
      return { allowed: false, size: stats.size, limit: limits.maxFileSize };
    }
    return { allowed: true, size: stats.size };
  } catch (e) {
    return { allowed: true, size: 0 }; // Let it fail elsewhere
  }
}

function checkInputSize(input) {
  const limits = getLimits();
  const size = Buffer.byteLength(input, 'utf8');

  if (size > limits.maxFileSize) {
    if (!isPro()) {
      showUpsell(UPSELL_TYPES.FILE_SIZE, {
        size: formatBytes(size),
        limit: formatBytes(LIMITS.FREE.maxFileSize),
      });
    }
    return { allowed: false, size, limit: limits.maxFileSize };
  }
  return { allowed: true, size };
}

function checkDailyLimit() {
  if (isPro()) return { allowed: true, remaining: Infinity };

  const usage = getUsage();
  const remaining = LIMITS.FREE.maxOpsPerDay - usage.operations;

  if (remaining <= 0) {
    showUpsell(UPSELL_TYPES.DAILY_LIMIT, { used: usage.operations });
    return { allowed: false, remaining: 0, used: usage.operations };
  }

  return { allowed: true, remaining, used: usage.operations };
}

function consumeOperation() {
  if (isPro()) return true;

  const check = checkDailyLimit();
  if (!check.allowed) return false;

  incrementUsage();
  return true;
}

function requirePro(feature) {
  if (isPro()) return true;
  showUpsell(UPSELL_TYPES.PRO_FEATURE, { feature });
  return false;
}

function checkMergeLimit(fileCount) {
  const limits = getLimits();

  if (fileCount > limits.maxMergeFiles) {
    if (!isPro()) {
      showUpsell(UPSELL_TYPES.MERGE_LIMIT, {
        count: fileCount,
        limit: LIMITS.FREE.maxMergeFiles,
      });
    }
    return { allowed: false, limit: limits.maxMergeFiles };
  }
  return { allowed: true };
}

module.exports = {
  LIMITS,
  getLimits,
  checkFileSize,
  checkInputSize,
  checkDailyLimit,
  consumeOperation,
  requirePro,
  checkMergeLimit,
};
