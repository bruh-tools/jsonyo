// jsonyo - upsell messages
// https://bruh.tools/jsonyo

const { colors, divider } = require('./output');
const { isPro } = require('../license/checker');
const { getUsage } = require('./config');
const { LIMITS } = require('../license/constants');

const UPSELL_TYPES = {
  PRO_TIP: 'pro_tip',
  FILE_SIZE: 'file_size',
  DAILY_LIMIT: 'daily_limit',
  PRO_FEATURE: 'pro_feature',
  MERGE_LIMIT: 'merge_limit',
  CROSS_PROMO: 'cross_promo',
};

const PRO_TIPS = [
  { tip: 'jsonyo PRO can process 1000 files at once with the batch command', relevant: ['format', 'minify', 'validate'] },
  { tip: 'jsonyo PRO generates TypeScript types from your JSON automatically', relevant: ['stats', 'type', 'keys'] },
  { tip: 'jsonyo PRO converts JSON to YAML/TOML/CSV in one command', relevant: ['format', 'minify'] },
  { tip: 'jsonyo PRO validates against JSON Schema', relevant: ['validate'] },
  { tip: 'jsonyo PRO handles files up to 100MB (FREE: 100KB)', relevant: ['all'] },
  { tip: 'jsonyo PRO has no daily limits - unlimited operations', relevant: ['all'] },
  { tip: 'jsonyo PRO watches files and auto-processes on change', relevant: ['format', 'validate'] },
  { tip: 'jsonyo PRO generates Go structs and Python dataclasses too', relevant: ['stats', 'type'] },
  { tip: 'jsonyo PRO merges unlimited files (FREE: only 2)', relevant: ['merge'] },
  { tip: "jsonyo PRO supports regex in queries: $.users[?(@.email =~ /gmail/)]", relevant: ['query', 'filter'] },
  { tip: 'jsonyo PRO exports diff as JSON Patch (RFC 6902)', relevant: ['diff'] },
  { tip: 'jsonyo PRO flattens JSON with custom separators', relevant: ['flatten'] },
  { tip: 'jsonyo PRO sorts by multiple keys with --by "a,b,c"', relevant: ['sort'] },
];

const COMMAND_TIPS = {
  stats: 'Generate TypeScript interfaces from this JSON: jsonyo generate types data.json -o types.ts',
  diff: 'Export as JSON Patch (RFC 6902): jsonyo diff old.json new.json --format patch',
  query: "Use regex and conditions: jsonyo query data.json -p '$.users[?(@.age > 18)]'",
  validate: 'Validate against JSON Schema: jsonyo validate data.json --schema schema.json',
  format: 'Sort keys and batch process: jsonyo batch format ./data/*.json --sort-keys',
  type: 'Generate TypeScript types: jsonyo generate types data.json',
};

function maybeShowProTip(command) {
  if (isPro()) return;

  // 30% chance to show tip
  if (Math.random() >= 0.30) return;

  const relevant = PRO_TIPS.filter(t =>
    t.relevant.includes(command) || t.relevant.includes('all')
  );

  if (relevant.length === 0) return;

  const tip = relevant[Math.floor(Math.random() * relevant.length)];

  console.log('');
  divider();
  console.log(colors.pro('   ' + tip.tip));
  console.log(colors.muted('   → https://bruh.tools/jsonyo#pro'));
  divider();
}

function showCommandTip(command) {
  if (isPro()) return;

  const tip = COMMAND_TIPS[command];
  if (!tip) return;

  console.log('');
  divider();
  console.log(colors.pro('PRO: ' + tip));
  console.log(colors.muted('   → https://bruh.tools/jsonyo#pro'));
  divider();
}

function showUpsell(type, data = {}) {
  console.log('');
  divider();

  switch (type) {
    case UPSELL_TYPES.FILE_SIZE:
      console.log(colors.warning(`   File too large (${data.size} > ${data.limit} limit)`));
      console.log('');
      console.log('   jsonyo FREE handles files up to 100KB.');
      console.log(`   Your file is ${data.size}.`);
      console.log('');
      console.log(colors.pro('   jsonyo PRO handles files up to 100MB'));
      console.log('   Plus batch processing for 1000+ files!');
      console.log('');
      console.log(colors.brand('   Only $11.99 → https://bruh.tools/jsonyo#pro'));
      break;

    case UPSELL_TYPES.DAILY_LIMIT:
      console.log(colors.warning(`   Daily limit reached (${data.used}/${LIMITS.FREE.maxOpsPerDay} operations)`));
      console.log('');
      console.log('   Your limit resets tomorrow, or upgrade now:');
      console.log('');
      console.log(colors.pro('   jsonyo PRO — $11.99 one-time'));
      console.log('     ✓ Unlimited operations');
      console.log('     ✓ Files up to 100MB');
      console.log('     ✓ Batch processing (1000 files at once)');
      console.log('     ✓ Convert JSON ↔ YAML/TOML/CSV/XML');
      console.log('     ✓ Generate TypeScript types');
      console.log('     ✓ JSON Schema validation');
      console.log('');
      console.log(colors.brand('   → https://bruh.tools/jsonyo#pro'));
      break;

    case UPSELL_TYPES.PRO_FEATURE:
      console.log(colors.pro(`   'jsonyo ${data.feature}' is a PRO feature`));
      console.log('');
      console.log('   With jsonyo PRO you could:');
      if (data.feature === 'convert') {
        console.log('     • Convert this JSON to YAML in one command');
        console.log('     • Batch convert entire directories');
        console.log('     • Support TOML, CSV, XML too');
      } else if (data.feature === 'generate') {
        console.log('     • Generate TypeScript interfaces automatically');
        console.log('     • Generate Go structs and Python dataclasses');
        console.log('     • Generate JSON Schema from samples');
      } else if (data.feature === 'batch') {
        console.log('     • Process 1000+ files at once');
        console.log('     • Batch validate, format, convert');
        console.log('     • Use glob patterns for file matching');
      } else if (data.feature === 'watch') {
        console.log('     • Auto-format on file changes');
        console.log('     • Watch entire directories');
        console.log('     • Instant feedback while editing');
      } else if (data.feature === 'schema') {
        console.log('     • Validate JSON against schemas');
        console.log('     • Generate schemas from samples');
        console.log('     • Detailed validation errors');
      }
      console.log('');
      console.log(colors.brand('   Only $11.99 (one-time purchase, yours forever)'));
      console.log(colors.brand('   → https://bruh.tools/jsonyo#pro'));
      break;

    case UPSELL_TYPES.MERGE_LIMIT:
      console.log(colors.warning(`   Merge limit: FREE supports ${data.limit} files (you have ${data.count})`));
      console.log('');
      console.log(colors.pro('   jsonyo PRO merges unlimited files'));
      console.log('   Plus custom merge strategies!');
      console.log('');
      console.log(colors.brand('   Only $11.99 → https://bruh.tools/jsonyo#pro'));
      break;

    case UPSELL_TYPES.CROSS_PROMO:
      console.log(colors.pro('   More PRO tools from bruh.tools:'));
      console.log('     portyo PRO — Port management on steroids ($6.99)');
      console.log('');
      console.log(colors.brand('   → https://bruh.tools'));
      break;
  }

  divider();
}

function showUsageInHelp() {
  if (isPro()) {
    console.log(colors.pro('   PRO version - unlimited everything'));
    return;
  }

  const usage = getUsage();
  const remaining = LIMITS.FREE.maxOpsPerDay - usage.operations;
  const color = remaining <= 5 ? colors.warning : colors.muted;

  divider();
  console.log(color(`   FREE version (${usage.operations}/${LIMITS.FREE.maxOpsPerDay} operations today)`));
  console.log('');
  console.log('   PRO unlocks: batch processing, format conversion,');
  console.log('   TypeScript generation, 100MB files, unlimited ops');
  console.log('');
  console.log(colors.brand('   $11.99 one-time → https://bruh.tools/jsonyo#pro'));
  divider();
}

function maybeCrossPromo() {
  if (Math.random() >= 0.10) return; // 10% chance

  console.log('');
  showUpsell(UPSELL_TYPES.CROSS_PROMO);
}

module.exports = {
  UPSELL_TYPES,
  maybeShowProTip,
  showCommandTip,
  showUpsell,
  showUsageInHelp,
  maybeCrossPromo,
};
