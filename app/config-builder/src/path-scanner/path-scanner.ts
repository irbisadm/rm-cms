/*
 * Copyright (c) 2023  Igor Buldin <i@irbisadm.dev>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as fs from "fs";
import {rmConstants} from "./rm-constants";
import {ScanResult} from "./scan-result";
import * as path from 'path';

async function dir(path: string): Promise<string[]> {
  return new Promise((resolve,reject)=>{
    fs.readdir(path,(err,files)=>{
      if(err){
        reject(err);
        return;
      }
      resolve(files);
    });
  });
}

function isLeaf(items:string[]):boolean{
  return items.includes(rmConstants.leafMark);
}

async function isDir(path:string):Promise<boolean>{
  return new Promise((resolve,reject)=>{
    fs.stat(path,(err,stats)=>{
      if(err){
        reject(err);
        return;
      }
      resolve(stats.isDirectory());
    });
  });
}

async function onlyDir(scanRoot:string,dirResult:string[]):Promise<string[]>{
  const buf:string[] = [];
  const dirClear = filterReserved(dirResult);
  for(const dirName of dirClear){
    const dir = await isDir(path.join(scanRoot,dirName))
    if(dir){
      buf.push(dirName);
    }
  }
  return buf;
}

function filterReserved(dirResult:string[]):string[]{
  if(isLeaf(dirResult)) {
    return dirResult.filter(item => !rmConstants.reservedPathList.includes(item))
  }
  return dirResult;
}

async function pathScanner(scanRoot:string):Promise<ScanResult>{
  const basePath = path.resolve(scanRoot);
  const projects = await fullScan(scanRoot);
  const projectPathList = projects.map(dirP=>path.relative(basePath,dirP));
  const scanResult:ScanResult = {
    basePath,
    projectPathList
  }
  console.log(`OK: RM dir scan completed. basePath: ${basePath}`);
  projectPathList.forEach(rPath=>console.log(`OK: Found RM "${rPath}"`));
  return scanResult;
}

async function fullScan(root:string):Promise<string[]>{
  console.log(`RUN: "${root}"...`);
  let results:string[] = [];
  const dep1 = await dir(root);
  if(isLeaf(dep1)){
    console.log(`OK: "${root}" is a RM project.`);
    results.push(root);
  } else {
    console.log(`SKIP: "${root}" NOT a RM project.`);
  }
  const dirs = await onlyDir(root,dep1);
  for(const dirN of dirs){
    const dirResult = await fullScan(path.resolve(root,dirN));
    results = [...results,...dirResult];
  }
  return results
}


export {pathScanner}
