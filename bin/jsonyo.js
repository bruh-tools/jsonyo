#!/usr/bin/env node

// jsonyo - JSON swiss army knife. bruh.
// https://bruh.tools/jsonyo

const fs = require('fs');
const path = require('path');

// Commands
const validateCmd = require('../src/commands/validate');
const formatCmd = require('../src/commands/format');
const minifyCmd = require('../src/commands/minify');
const queryCmd = require('../src/commands/query');
const keysCmd = require('../src/commands/keys');
const typeCmd = require('../src/commands/type');
const diffCmd = require('../src/commands/diff');
const statsCmd = require('../src/commands/stats');
const mergeCmd = require('../src/commands/merge');
const flattenCmd = require('../src/commands/flatten');
const unflattenCmd = require('../src/commands/unflatten');
const sortCmd = require('../src/commands/sort');
const filterCmd = require('../src/commands/filter');
const convertCmd = require('../src/commands/convert');
const schemaCmd = require('../src/commands/schema');
const generateCmd = require('../src/commands/generate');
const batchCmd = require('../src/commands/batch');
const watchCmd = require('../src/commands/watch');

// Utils
const { colors, divider } = require('../src/utils/output');
const { isPro, validateAndActivate } = require('../src/license/checker');
const { consumeOperation } = require('../src/license/limits');
const { maybeShowProTip, showUsageInHelp, showCommandTip, maybeCrossPromo } = require('../src/utils/upsell');
const { setLicense } = require('../src/utils/config');

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
  ${colors.brand('jsonyo')} - JSON swiss army knife. bruh.

  ${colors.highlight('Usage:')}
    jsonyo <command> [options] [file]
    cat file.json | jsonyo <command>

  ${colors.highlight('Commands (FREE):')}
    validate, v     Check if JSON is valid
    format, f       Pretty print JSON
    minify, m       Minify JSON
    query, q        Extract value by path
    keys, k         List all keys
    type, t         Show type and basic info
    diff, d         Compare two JSON files
    stats, s        Show statistics
    merge           Merge JSON files (2 max)
    flatten         Flatten nested JSON
    unflatten       Unflatten dotted keys
    sort            Sort keys or arrays
    filter          Filter array elements

  ${colors.pro('Commands (PRO):')}
    convert         JSON <-> YAML/TOML/CSV/XML
    schema          Validate/generate JSON Schema
    generate        Generate TypeScript/Go/Python types
    batch           Process multiple files at once
    watch           Watch files and auto-process

  ${colors.highlight('Options:')}
    -i, --indent    Indentation for format (default: 2)
    -p, --path      JSONPath for query
    --depth         Depth for keys (default: 1)
    --by            Field to sort by
    --where         Filter condition
    --to            Target format for convert
    --schema        Schema file for validation
    -o, --output    Output file
    -h, --help      Show this help
    --version       Show version

  ${colors.highlight('Examples:')}
    jsonyo validate data.json
    jsonyo format data.json -i 4
    jsonyo query data.json -p "$.users[0].name"
    jsonyo diff old.json new.json
    jsonyo merge a.json b.json -o combined.json
    jsonyo flatten nested.json
    jsonyo sort data.json --path "$.items" --by "name"
    jsonyo filter data.json --where "age > 18"
    ${colors.pro('jsonyo convert data.json --to yaml')}
    ${colors.pro('jsonyo generate types data.json -o types.ts')}
    ${colors.pro('jsonyo batch format ./data/*.json')}

  ${colors.muted('Docs:      https://bruh.tools/jsonyo')}
  ${colors.muted('Issues:    https://github.com/bruh-tools/jsonyo/issues')}
`);

  showUsageInHelp();

  console.log(`
  ${colors.pro('Activate PRO:')} jsonyo activate <license-key>
  ${colors.brand('Buy license:')}  https://bruh.tools/jsonyo#pro

  ${colors.muted('bruh.tools - no cap, fr fr')}
`);
}

function printVersion() {
  const pkg = require('../package.json');
  const proStatus = isPro() ? colors.pro(' PRO') : colors.muted(' FREE');
  console.log(`jsonyo v${pkg.version}${proStatus}`);
}

function readInput(fileArg) {
  if (fileArg && fs.existsSync(fileArg)) {
    return { input: fs.readFileSync(fileArg, 'utf8'), file: fileArg };
  }

  try {
    const input = fs.readFileSync(0, 'utf8');
    return { input, file: null };
  } catch (e) {
    return { input: null, file: null };
  }
}

function parseArgs() {
  const result = {
    command: null,
    subcommand: null,
    files: [],
    indent: 2,
    tabs: false,
    path: null,
    depth: 1,
    output: null,
    help: false,
    version: false,
    schema: null,
    to: null,
    from: null,
    by: null,
    where: null,
    select: null,
    desc: false,
    numeric: false,
    strategy: 'overwrite',
    sortKeys: false,
    keyOrder: null,
    trailingCommas: false,
    format: 'text',
    ignore: null,
    rootName: 'Root',
    separator: '.',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      result.help = true;
    } else if (arg === '--version') {
      result.version = true;
    } else if (arg === '-i' || arg === '--indent') {
      result.indent = parseInt(args[++i]) || 2;
    } else if (arg === '--tabs') {
      result.tabs = true;
    } else if (arg === '-p' || arg === '--path') {
      result.path = args[++i];
    } else if (arg === '--depth') {
      result.depth = parseInt(args[++i]) || 1;
    } else if (arg === '-o' || arg === '--output') {
      result.output = args[++i];
    } else if (arg === '--schema') {
      result.schema = args[++i];
    } else if (arg === '--to') {
      result.to = args[++i];
    } else if (arg === '--from') {
      result.from = args[++i];
    } else if (arg === '--by') {
      result.by = args[++i];
    } else if (arg === '--where') {
      result.where = args[++i];
    } else if (arg === '--select') {
      result.select = args[++i];
    } else if (arg === '--desc') {
      result.desc = true;
    } else if (arg === '--numeric') {
      result.numeric = true;
    } else if (arg === '--strategy') {
      result.strategy = args[++i];
    } else if (arg === '--sort-keys') {
      result.sortKeys = true;
    } else if (arg === '--key-order') {
      result.keyOrder = args[++i];
    } else if (arg === '--trailing-commas') {
      result.trailingCommas = true;
    } else if (arg === '--format') {
      result.format = args[++i];
    } else if (arg === '--ignore') {
      result.ignore = args[++i];
    } else if (arg === '--root-name') {
      result.rootName = args[++i];
    } else if (arg === '--separator') {
      result.separator = args[++i];
    } else if (!result.command && !arg.startsWith('-')) {
      result.command = arg;
    } else if (result.command && !result.subcommand && !arg.startsWith('-') &&
               ['schema', 'generate', 'batch', 'watch'].includes(result.command)) {
      result.subcommand = arg;
    } else if (!arg.startsWith('-')) {
      result.files.push(arg);
    }
  }

  return result;
}

function output(text, outputFile) {
  if (outputFile) {
    fs.writeFileSync(outputFile, text);
    console.log(colors.success(`✓ saved to ${outputFile}. nice.`));
  } else {
    console.log(text);
  }
}

async function main() {
  const opts = parseArgs();

  if (opts.version) {
    printVersion();
    process.exit(0);
  }

  if (opts.help || !opts.command) {
    printHelp();
    process.exit(opts.help ? 0 : 1);
  }

  const cmd = opts.command.toLowerCase();

  // Handle activate command
  if (cmd === 'activate') {
    const key = opts.files[0] || opts.subcommand;
    if (!key) {
      console.log(colors.error('bruh. need a license key'));
      console.log(colors.muted('usage: jsonyo activate XXXX-XXXX-XXXX-XXXX'));
      process.exit(1);
    }

    const result = await validateAndActivate(key);
    if (result.valid) {
      console.log(colors.success('✓ License activated! Welcome to jsonyo PRO.'));
      console.log(colors.muted('  Saved to ~/.jsonyo/license'));
    } else {
      console.log(colors.error(`✗ ${result.error}`));
      process.exit(1);
    }
    process.exit(0);
  }

  // Check daily limit for FREE users
  if (!consumeOperation()) {
    process.exit(1);
  }

  try {
    switch (cmd) {
      case 'validate':
      case 'v': {
        const { input, file } = readInput(opts.files[0]);
        if (!input) {
          console.error(colors.error('bruh. no input provided.'));
          process.exit(1);
        }
        validateCmd.run(input, { schema: opts.schema });
        maybeShowProTip('validate');
        break;
      }

      case 'format':
      case 'f': {
        const { input } = readInput(opts.files[0]);
        if (!input) {
          console.error(colors.error('bruh. no input provided.'));
          process.exit(1);
        }
        const result = formatCmd.run(input, {
          indent: opts.indent,
          tabs: opts.tabs,
          sortKeysFlag: opts.sortKeys,
          keyOrder: opts.keyOrder,
          trailingCommas: opts.trailingCommas,
        });
        output(result, opts.output);
        maybeShowProTip('format');
        break;
      }

      case 'minify':
      case 'm': {
        const { input } = readInput(opts.files[0]);
        if (!input) {
          console.error(colors.error('bruh. no input provided.'));
          process.exit(1);
        }
        const result = minifyCmd.run(input);
        output(result, opts.output);
        maybeShowProTip('minify');
        break;
      }

      case 'query':
      case 'q': {
        const { input, file } = readInput(opts.files[0]);
        if (!input) {
          console.error(colors.error('bruh. no input provided.'));
          process.exit(1);
        }
        const result = queryCmd.run(input, {
          path: opts.path,
          outputFormat: opts.to,
        });
        output(result, opts.output);
        maybeShowProTip('query');
        break;
      }

      case 'keys':
      case 'k': {
        const { input } = readInput(opts.files[0]);
        if (!input) {
          console.error(colors.error('bruh. no input provided.'));
          process.exit(1);
        }
        const result = keysCmd.run(input, { depth: opts.depth });
        output(result, opts.output);
        maybeShowProTip('keys');
        break;
      }

      case 'type':
      case 't': {
        const { input } = readInput(opts.files[0]);
        if (!input) {
          console.error(colors.error('bruh. no input provided.'));
          process.exit(1);
        }
        typeCmd.run(input);
        maybeShowProTip('type');
        break;
      }

      case 'diff':
      case 'd': {
        if (opts.files.length < 2) {
          console.error(colors.error('bruh. need two files to diff.'));
          process.exit(1);
        }
        diffCmd.run(opts.files[0], opts.files[1], {
          format: opts.format,
          ignore: opts.ignore,
        });
        showCommandTip('diff');
        break;
      }

      case 'stats':
      case 's': {
        const { input } = readInput(opts.files[0]);
        if (!input) {
          console.error(colors.error('bruh. no input provided.'));
          process.exit(1);
        }
        statsCmd.run(input);
        showCommandTip('stats');
        break;
      }

      case 'merge': {
        mergeCmd.run(opts.files, {
          strategy: opts.strategy,
          output: opts.output,
        });
        maybeShowProTip('merge');
        break;
      }

      case 'flatten': {
        const { input } = readInput(opts.files[0]);
        if (!input) {
          console.error(colors.error('bruh. no input provided.'));
          process.exit(1);
        }
        const result = flattenCmd.run(input, { separator: opts.separator });
        output(result, opts.output);
        maybeShowProTip('flatten');
        break;
      }

      case 'unflatten': {
        const { input } = readInput(opts.files[0]);
        if (!input) {
          console.error(colors.error('bruh. no input provided.'));
          process.exit(1);
        }
        const result = unflattenCmd.run(input, { separator: opts.separator });
        output(result, opts.output);
        break;
      }

      case 'sort': {
        const { input } = readInput(opts.files[0]);
        if (!input) {
          console.error(colors.error('bruh. no input provided.'));
          process.exit(1);
        }
        const result = sortCmd.run(input, {
          path: opts.path,
          by: opts.by,
          desc: opts.desc,
          numeric: opts.numeric,
        });
        output(result, opts.output);
        maybeShowProTip('sort');
        break;
      }

      case 'filter': {
        const { input } = readInput(opts.files[0]);
        if (!input) {
          console.error(colors.error('bruh. no input provided.'));
          process.exit(1);
        }
        const result = filterCmd.run(input, {
          path: opts.path,
          where: opts.where,
          select: opts.select,
        });
        output(result, opts.output);
        maybeShowProTip('filter');
        break;
      }

      case 'convert': {
        const { input, file } = readInput(opts.files[0]);
        if (!input) {
          console.error(colors.error('bruh. no input provided.'));
          process.exit(1);
        }
        convertCmd.run(input, {
          to: opts.to,
          from: opts.from,
          output: opts.output,
          inputFile: file,
        });
        break;
      }

      case 'schema': {
        if (!opts.subcommand) {
          console.error(colors.error('bruh. use: jsonyo schema generate OR jsonyo schema validate'));
          process.exit(1);
        }
        const { input, file } = readInput(opts.files[0]);
        if (!input) {
          console.error(colors.error('bruh. no input provided.'));
          process.exit(1);
        }
        schemaCmd.run(opts.subcommand, input, {
          schema: opts.schema,
          output: opts.output,
          title: opts.rootName,
        });
        break;
      }

      case 'generate': {
        if (!opts.subcommand) {
          console.error(colors.error('bruh. use: jsonyo generate types|go|python|schema'));
          process.exit(1);
        }
        const { input } = readInput(opts.files[0]);
        if (!input) {
          console.error(colors.error('bruh. no input provided.'));
          process.exit(1);
        }
        generateCmd.run(opts.subcommand, input, {
          output: opts.output,
          rootName: opts.rootName,
        });
        break;
      }

      case 'batch': {
        if (!opts.subcommand || opts.files.length === 0) {
          console.error(colors.error('bruh. use: jsonyo batch <command> <pattern>'));
          console.error(colors.muted('example: jsonyo batch format ./data/*.json'));
          process.exit(1);
        }
        batchCmd.run(opts.subcommand, opts.files[0], {
          output: opts.output,
          schema: opts.schema,
          to: opts.to,
          ignore: opts.ignore,
        });
        break;
      }

      case 'watch': {
        if (!opts.subcommand || opts.files.length === 0) {
          console.error(colors.error('bruh. use: jsonyo watch <command> <pattern>'));
          console.error(colors.muted('example: jsonyo watch format ./data/*.json'));
          process.exit(1);
        }
        watchCmd.run(opts.subcommand, opts.files[0], {
          schema: opts.schema,
          output: opts.output,
        });
        break;
      }

      default:
        console.error(colors.error(`bruh. unknown command: ${cmd}`));
        console.error(colors.muted('use --help to see available commands'));
        process.exit(1);
    }

    // Cross-promo (10% chance)
    maybeCrossPromo();

  } catch (e) {
    console.error(colors.error(`bruh. something broke: ${e.message}`));
    console.error(colors.muted('report: https://github.com/bruh-tools/jsonyo/issues'));
    process.exit(1);
  }
}

main();
