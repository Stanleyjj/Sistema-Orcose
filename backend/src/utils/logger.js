const chalk = require('chalk');

function now() {
  return new Date().toISOString();
}

module.exports = {
  info(msg) {
    console.log(chalk.blue(`[INFO ${now()}]`), msg);
  },
  success(msg) {
    console.log(chalk.green(`[SUCCESS ${now()}]`), msg);
  },
  warn(msg) {
    console.log(chalk.yellow(`[WARN ${now()}]`), msg);
  },
  error(msg, err = null) {
    console.log(chalk.red(`[ERROR ${now()}]`), msg);
    if (err) console.error(err);
  }
};
