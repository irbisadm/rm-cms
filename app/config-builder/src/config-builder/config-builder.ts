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

function buildRootSection(){
  return `
  location / {
    if (-f $request_filename ) {
      break;
    }
    if ($args ~ "_escaped_fragment_") {
      rewrite ^/(.+)/$ /snippets/$1.html last;
      rewrite ^/([.a-zA-Z0-9-_/]+)$ /snippets/$1.html last;
      rewrite ^/ /snippets/1.html last;
    }
    location = / {
      if ($args ~ "_escaped_fragment_") {
        rewrite ^/ /snippets/1.html last;
      } 
    }
    rewrite ^/?$ /index.html last;
    rewrite ^/[.a-zA-Z0-9-_]+(/(.*))? /$2 last;
    try_files $uri $uri/;
  }
`;
}

function buildPathSection(projectPath:string){
  const curedPath = projectPath.replace(/\\/g,'/');
  return `
location /${curedPath} {
  if (-f $request_filename ) {
    break;
  }
  if ($args ~ "_escaped_fragment_") {
    rewrite ^/${curedPath}/(.+)/$ /snippets/$1.html last;
    rewrite ^/${curedPath}/([.a-zA-Z0-9-_/]+)$ /snippets/$1.html last;
    rewrite ^/${curedPath}/ /snippets/1.html last;
  }
  location = /${curedPath} {
    if ($args ~ "_escaped_fragment_") {
      rewrite ^/${curedPath} /${curedPath}/snippets/1.html last;
    }
    return 301 /${curedPath}/;
  }
  rewrite ^/${curedPath}/?$ /${curedPath}/index.html last;
  rewrite ^/${curedPath}/[.a-zA-Z0-9-_]+(/(.*))? /${curedPath}/$2 last;
  try_files $uri $uri/;
}
`;
}

export { configBuilder };