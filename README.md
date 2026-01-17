# jsonyo

JSON swiss army knife. bruh.

[![npm](https://img.shields.io/npm/v/jsonyo)](https://www.npmjs.com/package/jsonyo)
[![license](https://img.shields.io/npm/l/jsonyo)](https://bruh.tools/jsonyo/license)

**[Documentation](https://bruh.tools/jsonyo)** · **[Report Bug](https://bruh.tools/jsonyo/issues)** · **[All Tools](https://bruh.tools)**

## Install

```bash
npm install -g jsonyo
```

## Usage

```bash
# validate JSON
jsonyo validate data.json
# ✓ valid JSON. nice.

# pretty print
jsonyo format data.json
jsonyo format data.json -i 4  # 4 spaces indent

# minify
jsonyo minify data.json
jsonyo minify data.json -o data.min.json

# query by path
jsonyo query data.json -p "$.users[0].name"
# → "john"

# list keys
jsonyo keys data.json
jsonyo keys data.json --depth 2

# show type info
jsonyo type data.json
# → object (5 keys)

# diff two files
jsonyo diff old.json new.json
# found 3 difference(s):
#   + $.newKey: "value"
#   - $.removedKey: "old"
#   ~ $.changed: 1 → 2

# show stats
jsonyo stats data.json
# JSON stats:
#   objects:   12
#   arrays:    3
#   strings:   45
#   ...

# pipe from stdin
cat data.json | jsonyo format
echo '{"a":1}' | jsonyo validate
curl api.example.com/data | jsonyo query -p "$.results"
```

## Commands

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

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `-i, --indent` | Spaces for format | 2 |
| `-p, --path` | JSONPath for query | - |
| `--depth` | Depth for keys | 1 |
| `-o, --output` | Output file | stdout |
| `-h, --help` | Show help | - |

## More tools from bruh.tools

- **[portyo](https://bruh.tools/portyo)** — find free ports
- **[licenseme](https://bruh.tools/licenseme)** — pick a license, bruh
- **[randumb](https://bruh.tools/randumb)** — random data generator

**[View all tools →](https://bruh.tools)**

## License

MIT © [bruh.tools](https://bruh.tools)

---

**[bruh.tools](https://bruh.tools)** — no cap, fr fr
