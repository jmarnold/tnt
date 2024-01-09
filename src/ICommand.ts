import { TntOptions } from './index';

export interface ICommand {
  execute(options: TntOptions): Promise<void>;
}
