import chalk from 'chalk';
import { TntOptions, log } from './index';
import { ICommand } from './ICommand';
import fs from 'fs';
import path from 'path';
import { groupBy } from 'lodash';
import { DynamoDB } from 'aws-sdk';

interface DataFile {
  tableName: string;
  fileName: string;
}

function readDataFilesFromDir(dir: string): DataFile[] {
  const files = fs.readdirSync(dir, 'utf-8');
  const dataFiles: DataFile[] = [];
  files.forEach((filePath) => {
    const fileName = path.join(dir, filePath);
    if (!fs.existsSync(fileName)) {
      return;
    }

    const stat = fs.lstatSync(fileName);
    if (stat.isDirectory() && filePath.indexOf('node_modules') === -1) {
      const nested = readDataFilesFromDir(fileName);
      dataFiles.push(...nested);
      return;
    }

    if (!filePath.endsWith('.json') || dir === process.cwd()) {
      return;
    }

    dataFiles.push({
      tableName: path.relative(process.cwd(), dir),
      fileName: filePath,
    });
  });

  return dataFiles;
}

async function runDataFiles(dataFiles: DataFile[]): Promise<void> {
  const tableSets = groupBy(dataFiles, 'tableName');
  const client = new DynamoDB({
    endpoint: 'http://localhost:4566',
    region: 'us-west-2',
  });

  for (const tableName in tableSets) {
    const files = tableSets[tableName];
    const dataSets: any[] = [];
    files.forEach((file) => {
      const items = JSON.parse(fs.readFileSync(path.join(tableName, file.fileName), 'utf-8'));
      dataSets.push(...items.map((item: { [key: string]: any }) => DynamoDB.Converter.marshall(item)));
    });

    log(chalk.white(`Loading ${dataSets.length} items for table "${tableName}"`));

    for (let i = 0; i < dataSets.length; i++) {
      const tableSet = dataSets[i];
      console.log('putting', tableSet, tableName);
      await client
        .putItem({
          TableName: tableName,
          Item: tableSet,
        })
        .promise();
    }
  }
}

export class LoadCommand implements ICommand {
  async execute(options: TntOptions): Promise<void> {
    const dir = process.cwd();
    log(chalk.white(`tnt: loading from ${dir}`));

    const files = readDataFilesFromDir(dir);
    console.log(files);

    await runDataFiles(files);
  }
}
