// jsonyo - minify command
// https://bruh.tools/jsonyo

const { parse, minify } = require('../core/parser');
const { colors } = require('../utils/output');
const { checkInputSize } = require('../license/limits');

function run(input) {
  // Check input size
  const sizeCheck = checkInputSize(input);
  if (!sizeCheck.allowed) {
    process.exit(1);
  }

  const result = parse(input);

  if (!result.success) {
    console.log(colors.error(`✗ invalid JSON: ${result.error}`));
    process.exit(1);
  }

  return minify(result.data);
}

module.exports = { run };
