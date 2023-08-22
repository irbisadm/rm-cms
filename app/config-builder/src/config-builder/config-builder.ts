/*
 * Copyright (c) 2023  Igor Buldin <i@irbisadm.dev>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {ScanResult} from "../path-scanner";
import * as fs from "fs";
import * as path from 'path';
import * as child_process from "child_process";
import * as process from "process";

const REG_LOCATION = /%location%/g;
const REG_BASE_PATH = /%basePath%/g;
const REG_LOCATIONS = /%locations%/g;

async function readConfigs():Promise<{base:string,template:string}>{
  const basePath = path.resolve(process.env.BASE_TEMPLATE as string);
  const locationPath = path.resolve(process.env.LOCATION_TEMPLATE as string);
  const [base,template] = await Promise.all([
    new Promise<string>((resolve,reject)=>{
      console.log(`RUN: Read base config from ${basePath}`);
      fs.readFile(basePath,(err,data)=>{
        if(err){
          reject(err);
          return;
        }
        resolve(data.toString());
      });
    }),
    new Promise<string>((resolve,reject)=>{
      console.log(`RUN: Read location config from ${locationPath}`);
      fs.readFile(locationPath,(err,data)=>{
        if(err){
          reject(err);
          return;
        }
        resolve(data.toString());
      });
    }),
  ]);
  console.log(`OK: Config was created`);
  return {base,template};
}

async function writeConfig(config:string):Promise<void>{
  return new Promise<void>((resolve,reject)=>{
    const outputPath = path.resolve(process.env.OUTPUT_CONFIG as string);
    console.log(`RUN: Write config to ${outputPath}`);
    fs.writeFile(outputPath,config,(err)=>{
      if(err){
        reject(err);
        return;
      }
      resolve();
    });
  });
}

async function configBuilder(scanResult: ScanResult): Promise<void> {
  const {basePath,projectPathList} = scanResult;
  const {base,template} = await readConfigs();
  const sectionsList = projectPathList.map(projectPath=>buildSection(template,projectPath));
  let outputBase = base.replace(REG_BASE_PATH,basePath)
                              .replace(REG_LOCATIONS,sectionsList.join("\n\n"));
  console.log(`OK: Config was built`)
  console.log(`DBG:
${outputBase}
`)
  await writeConfig(outputBase);
  console.log(`OK: Config was written`);
  await validateConfig();
}

function buildSection(template:string,projectPath:string):string{
  console.log(`RUN: Build section for ${projectPath}`);
  return template.replace(REG_LOCATION,projectPath);
}

async function validateConfig(){
  const outputPath = path.resolve(process.env.OUTPUT_CONFIG as string);
  const nginxPath = path.resolve(process.env.NGINX_PATH as string);
  child_process.exec(`${nginxPath} -t -c ${outputPath}`, (error, stdout, stderr)=>{
    if (error) {
      console.error(`ERR: ${stderr}`);
      console.error(`ERR: Config validation failed`);
      process.exit(1);
    }
    console.error(`OUT: ${stdout}`);
    console.log(`OK: Config validation passed`);
  });
}

export { configBuilder };