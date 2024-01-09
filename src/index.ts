import 'reflect-metadata';
import chalk from 'chalk';
import path from 'path';
import { parseArgumentsIntoOptions } from './parseArgumentsIntoOptions';
import { LoadCommand } from './LocalCommand';
export const log = console.log;

const { version } = require(path.join(__dirname, '../package.json')) as { version: string };

export interface TntOptions {
  endpoint?: string;
}

module.exports.cli = async function cli(args: string[]) {
  log(chalk.white.bold(`tnt ${version}`));
  const options = {
    ...parseArgumentsIntoOptions(args),
  };

  const command = new LoadCommand();
  await command.execute(options);
};
