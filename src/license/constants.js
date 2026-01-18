// jsonyo - license constants
// https://bruh.tools/jsonyo

const LIMITS = {
  FREE: {
    maxFileSize: 100 * 1024, // 100KB
    maxOpsPerDay: 20,
    maxMergeFiles: 2,
    maxBatchFiles: 0,
  },
  PRO: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxOpsPerDay: Infinity,
    maxMergeFiles: Infinity,
    maxBatchFiles: 1000,
  },
};

module.exports = { LIMITS };
