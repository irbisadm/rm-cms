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
import * as process from "process";
import {buildPathSection, buildRootSection} from "./section-builder";

const REG_BASE_PATH = /%basePath%/g;
const REG_LOCATIONS = /%locations%/g;

async function readBaseConfigs():Promise<string>{
  const basePath = path.resolve(process.env.BASE_TEMPLATE as string);
  const base =
    new Promise<string>((resolve,reject)=>{
      console.log(`RUN: Read base config from ${basePath}`);
      fs.readFile(basePath,(err,data)=>{
        if(err){
          reject(err);
          return;
        }
        resolve(data.toString());
      });
    });
  console.log(`OK: Config was created`);
  return base;
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
  const base = await readBaseConfigs();
  const sectionsList = projectPathList.map(projectPath=>buildSection(projectPath));
  let outputBase = base.replace(REG_BASE_PATH,basePath)
                              .replace(REG_LOCATIONS,sectionsList.join("\n\n"));
  console.log(`OK: Config was built`)
  await writeConfig(outputBase);
  console.log(`OK: Config was written`);
}

function buildSection(projectPath:string):string{
  console.log(`RUN: Build section for ${projectPath}`);
  if(!projectPath){
    return buildRootSection();
  }
  return buildPathSection(projectPath);
}


export { configBuilder };