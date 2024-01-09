import arg from 'arg';
import { TntOptions } from './index';

export function parseArgumentsIntoOptions(rawArgs: string[]): TntOptions {
  const args = arg(
    {
      '--endpoint': String,
      '-e': '--endpoint',
    },
    {
      argv: rawArgs.slice(2),
    },
  );

  const options: TntOptions = {
    endpoint: args._[0],
  };

  if (args['--endpoint'] !== undefined) {
    options.endpoint = args['--endpoint'];
  }

  return options;
}
