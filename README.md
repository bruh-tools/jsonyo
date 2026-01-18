# jsonyo

JSON swiss army knife. bruh.

[![npm](https://img.shields.io/npm/v/jsonyo)](https://www.npmjs.com/package/jsonyo)
[![license](https://img.shields.io/npm/l/jsonyo)](https://bruh.tools/jsonyo/license)

**[Documentation](https://bruh.tools/jsonyo)** · **[Report Bug](https://github.com/bruh-tools/jsonyo/issues)** · **[Get PRO](https://bruh.tools/jsonyo#pro)**

## What's New in v2.0.0

- **13 FREE commands** — validate, format, minify, query, keys, type, diff, stats, merge, flatten, unflatten, sort, filter
- **5 PRO commands** — convert, schema, generate, batch, watch
- **Format conversion** — JSON ↔ YAML, TOML, CSV, XML
- **Type generation** — TypeScript, Go, Python, Rust
- **Batch processing** — process multiple files at once
- **Watch mode** — auto-process on file changes

## Install

```bash
npm install -g jsonyo
```

## Quick Start

```bash
# validate JSON
jsonyo validate data.json
# ✓ valid JSON. nice.

# pretty print
jsonyo format data.json
jsonyo format data.json -i 4  # 4 spaces indent

# minify
jsonyo minify data.json -o data.min.json

# query by JSONPath
jsonyo query data.json -p "$.users[0].name"
jsonyo query data.json -p "$.users[*].email"
jsonyo query data.json -p "$..name"  # recursive

# list keys
jsonyo keys data.json --depth 2

# compare files
jsonyo diff old.json new.json

# merge files
jsonyo merge a.json b.json -o combined.json

# flatten/unflatten
jsonyo flatten nested.json
jsonyo unflatten flat.json

# sort
jsonyo sort data.json --path "$.items" --by "name"
jsonyo sort data.json --path "$.items" --by "price" --desc --numeric

# filter arrays
jsonyo filter data.json --where "age > 18"
jsonyo filter data.json --path "$.users" --where "active == true"

# pipe from stdin
cat data.json | jsonyo format
curl api.example.com/data | jsonyo query -p "$.results"
```

## FREE Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `validate` | `v` | Check if JSON is valid |
| `format` | `f` | Pretty print JSON |
| `minify` | `m` | Remove whitespace |
| `query` | `q` | Extract value by JSONPath |
| `keys` | `k` | List all keys |
| `type` | `t` | Show type and info |
| `diff` | `d` | Compare two files |
| `stats` | `s` | Show statistics |
| `merge` | - | Merge JSON files (2 max) |
| `flatten` | - | Flatten nested JSON |
| `unflatten` | - | Unflatten dotted keys |
| `sort` | - | Sort keys or arrays |
| `filter` | - | Filter array elements |

### FREE Tier Limits

- **100KB** max file size
- **20 operations** per day
- Merge limited to 2 files

## PRO Commands

```bash
# Convert formats (PRO)
jsonyo convert data.json --to yaml
jsonyo convert data.yaml --to json
jsonyo convert data.json --to csv
jsonyo convert data.json --to xml

# JSON Schema (PRO)
jsonyo schema generate data.json
jsonyo schema validate data.json --schema schema.json

# Generate types (PRO)
jsonyo generate types data.json -o types.ts
jsonyo generate go data.json -o types.go
jsonyo generate python data.json -o types.py
jsonyo generate rust data.json -o types.rs

# Batch processing (PRO)
jsonyo batch format ./data/*.json
jsonyo batch validate ./configs/*.json --schema schema.json
jsonyo batch convert ./data/*.json --to yaml

# Watch mode (PRO)
jsonyo watch format ./data/*.json
jsonyo watch validate ./configs/*.json --schema schema.json
```

| Command | Description |
|---------|-------------|
| `convert` | JSON ↔ YAML/TOML/CSV/XML |
| `schema` | Generate/validate JSON Schema |
| `generate` | Generate TypeScript/Go/Python/Rust types |
| `batch` | Process multiple files at once |
| `watch` | Watch files and auto-process |

### PRO Features

- **100MB** max file size
- **Unlimited** operations
- Merge unlimited files
- Format conversion
- Type generation
- Batch processing
- Watch mode

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `-i, --indent` | Spaces for format | 2 |
| `--tabs` | Use tabs for indent | false |
| `-p, --path` | JSONPath for query | - |
| `--depth` | Depth for keys | 1 |
| `--by` | Field to sort by | - |
| `--desc` | Sort descending | false |
| `--numeric` | Numeric sort | false |
| `--where` | Filter condition | - |
| `--to` | Target format | - |
| `--schema` | Schema file | - |
| `--strategy` | Merge strategy | overwrite |
| `--separator` | Flatten separator | . |
| `-o, --output` | Output file | stdout |
| `-h, --help` | Show help | - |

## Activate PRO

```bash
jsonyo activate XXXX-XXXX-XXXX-XXXX
```

**[Buy PRO License →](https://bruh.tools/jsonyo#pro)** — $11.99 one-time

## API Usage

```javascript
const jsonyo = require('jsonyo');

// Parse & stringify
const { data, success, error } = jsonyo.parse('{"a": 1}');
const formatted = jsonyo.stringify(data, 2);
const minified = jsonyo.minify(data);

// Query
const value = jsonyo.query(data, '$.users[0].name');
const all = jsonyo.queryAdvanced(data, '$..name');

// Transform
const flat = jsonyo.flatten(data);
const nested = jsonyo.unflatten(flat);
const merged = jsonyo.merge(obj1, obj2);
const sorted = jsonyo.sortKeys(data);

// Validate
const schema = jsonyo.generateSchema(data);
const errors = jsonyo.validateAgainstSchema(data, schema);

// Convert (PRO)
const yaml = jsonyo.toYAML(data);
const csv = jsonyo.toCSV(data);

// Generate (PRO)
const ts = jsonyo.generateTypeScript(data);
const go = jsonyo.generateGo(data);
```

## More tools from bruh.tools

- **[portyo](https://bruh.tools/portyo)** — find free ports
- **[licenseme](https://bruh.tools/licenseme)** — pick a license, bruh
- **[randumb](https://bruh.tools/randumb)** — random data generator

**[View all tools →](https://bruh.tools)**

## License

MIT © [bruh.tools](https://bruh.tools)

---

**[bruh.tools](https://bruh.tools)** — no cap, fr fr
