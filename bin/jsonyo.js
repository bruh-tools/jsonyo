#!/usr/bin/env node

const fs = require('fs');
const { validate, format, minify, query, getKeys, getType, diff, stats } = require('../src/json-utils');

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
  jsonyo - JSON swiss army knife. bruh.

  Usage:
    jsonyo <command> [options] [file]
    cat file.json | jsonyo <command>

  Commands:
    validate, v     Check if JSON is valid
    format, f       Pretty print JSON (default: 2 spaces)
    minify, m       Minify JSON (remove whitespace)
    query, q        Extract value by path (e.g., $.users[0].name)
    keys, k         List all keys (--depth for nested)
    type, t         Show type and basic info
    diff, d         Compare two JSON files
    stats, s        Show statistics about JSON

  Options:
    -i, --indent    Indentation for format (default: 2)
    -p, --path      JSONPath for query (e.g., $.data.items)
    --depth         Depth for keys command (default: 1)
    -o, --output    Output file (default: stdout)
    -h, --help      Show this help

  Examples:
    jsonyo validate data.json
    jsonyo format data.json -i 4
    jsonyo minify data.json -o data.min.json
    jsonyo query data.json -p "$.users[0].name"
    jsonyo keys data.json --depth 2
    jsonyo diff old.json new.json
    cat data.json | jsonyo format
    echo '{"a":1}' | jsonyo validate

  Docs:      https://bruh.tools/jsonyo
  Issues:    https://bruh.tools/jsonyo/issues

  bruh.tools - no cap, fr fr
`);
}

function readInput(fileArg) {
  // If file argument provided, read from file
  if (fileArg && fs.existsSync(fileArg)) {
    return fs.readFileSync(fileArg, 'utf8');
  }
  
  // Otherwise try to read from stdin
  try {
    return fs.readFileSync(0, 'utf8');
  } catch (e) {
    return null;
  }
}

function parseArgs() {
  const result = {
    command: null,
    files: [],
    indent: 2,
    path: null,
    depth: 1,
    output: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      result.help = true;
    } else if (arg === '-i' || arg === '--indent') {
      result.indent = parseInt(args[++i]) || 2;
    } else if (arg === '-p' || arg === '--path') {
      result.path = args[++i];
    } else if (arg === '--depth') {
      result.depth = parseInt(args[++i]) || 1;
    } else if (arg === '-o' || arg === '--output') {
      result.output = args[++i];
    } else if (!result.command && !arg.startsWith('-')) {
      result.command = arg;
    } else if (!arg.startsWith('-')) {
      result.files.push(arg);
    }
  }

  return result;
}

function output(text, outputFile) {
  if (outputFile) {
    fs.writeFileSync(outputFile, text);
    console.log(`✓ saved to ${outputFile}. nice.`);
  } else {
    console.log(text);
  }
}

async function main() {
  const opts = parseArgs();

  if (opts.help || !opts.command) {
    printHelp();
    process.exit(opts.help ? 0 : 1);
  }

  const cmd = opts.command.toLowerCase();
  
  try {
    switch (cmd) {
      case 'validate':
      case 'v': {
        const input = readInput(opts.files[0]);
        if (!input) {
          console.error('bruh. no input provided.');
          process.exit(1);
        }
        const result = validate(input);
        if (result.valid) {
          console.log('✓ valid JSON. nice.');
          process.exit(0);
        } else {
          console.log(`✗ invalid JSON. bruh.`);
          console.log(`  ${result.error}`);
          process.exit(1);
        }
        break;
      }

      case 'format':
      case 'f': {
        const input = readInput(opts.files[0]);
        if (!input) {
          console.error('bruh. no input provided.');
          process.exit(1);
        }
        const result = format(input, opts.indent);
        output(result, opts.output);
        break;
      }

      case 'minify':
      case 'm': {
        const input = readInput(opts.files[0]);
        if (!input) {
          console.error('bruh. no input provided.');
          process.exit(1);
        }
        const result = minify(input);
        output(result, opts.output);
        break;
      }

      case 'query':
      case 'q': {
        const input = readInput(opts.files[0]);
        if (!input) {
          console.error('bruh. no input provided.');
          process.exit(1);
        }
        if (!opts.path) {
          console.error('bruh. need a path. use -p "$.your.path"');
          process.exit(1);
        }
        const result = query(input, opts.path);
        if (result === undefined) {
          console.error(`✗ path not found: ${opts.path}`);
          process.exit(1);
        }
        if (typeof result === 'object') {
          output(JSON.stringify(result, null, 2), opts.output);
        } else {
          output(String(result), opts.output);
        }
        break;
      }

      case 'keys':
      case 'k': {
        const input = readInput(opts.files[0]);
        if (!input) {
          console.error('bruh. no input provided.');
          process.exit(1);
        }
        const result = getKeys(input, opts.depth);
        output(result.join('\n'), opts.output);
        break;
      }

      case 'type':
      case 't': {
        const input = readInput(opts.files[0]);
        if (!input) {
          console.error('bruh. no input provided.');
          process.exit(1);
        }
        const result = getType(input);
        if (result.type === 'array') {
          console.log(`array (${result.length} items)`);
        } else if (result.type === 'object') {
          console.log(`object (${result.keys} keys)`);
        } else {
          console.log(result.type);
        }
        break;
      }

      case 'diff':
      case 'd': {
        if (opts.files.length < 2) {
          console.error('bruh. need two files to diff.');
          process.exit(1);
        }
        const input1 = fs.readFileSync(opts.files[0], 'utf8');
        const input2 = fs.readFileSync(opts.files[1], 'utf8');
        const result = diff(input1, input2);
        
        if (result.length === 0) {
          console.log('✓ no differences. nice.');
        } else {
          console.log(`found ${result.length} difference(s):\n`);
          for (const d of result) {
            if (d.type === 'added') {
              console.log(`  + ${d.path}: ${JSON.stringify(d.value)}`);
            } else if (d.type === 'removed') {
              console.log(`  - ${d.path}: ${JSON.stringify(d.value)}`);
            } else if (d.type === 'value_change') {
              console.log(`  ~ ${d.path}: ${JSON.stringify(d.from)} → ${JSON.stringify(d.to)}`);
            } else if (d.type === 'type_change') {
              console.log(`  ! ${d.path}: type changed from ${d.from} to ${d.to}`);
            } else if (d.type === 'array_length') {
              console.log(`  # ${d.path}: length ${d.from} → ${d.to}`);
            }
          }
        }
        break;
      }

      case 'stats':
      case 's': {
        const input = readInput(opts.files[0]);
        if (!input) {
          console.error('bruh. no input provided.');
          process.exit(1);
        }
        const result = stats(input);
        console.log(`JSON stats:
  objects:   ${result.objects}
  arrays:    ${result.arrays}
  strings:   ${result.strings}
  numbers:   ${result.numbers}
  booleans:  ${result.booleans}
  nulls:     ${result.nulls}
  max depth: ${result.maxDepth}
  size:      ${result.size} bytes
  minified:  ${result.minifiedSize} bytes`);
        break;
      }

      default:
        console.error(`bruh. unknown command: ${cmd}`);
        console.error('use --help to see available commands');
        process.exit(1);
    }
  } catch (e) {
    console.error(`bruh. something broke: ${e.message}`);
    console.error('report: https://bruh.tools/jsonyo/issues');
    process.exit(1);
  }
}

main();
