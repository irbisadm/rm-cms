/*
 * Copyright (c) 2023  Igor Buldin <i@irbisadm.dev>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {ScanResult} from "../path-scanner";
import * as path from "path";
import * as fs from "fs";
import process from "process";

async function faviconFixer(scanResult:ScanResult){
  scanResult.projectPathList.forEach(el=>{
    const imgPath = path.join(scanResult.basePath,el,'dist','img');
    console.log(`RUN: Remove favicon folder ${imgPath}`);
    fs.rmSync(path.join(imgPath,'favicons'),{recursive:true,force:true});
    const targetFavPath = path.resolve(process.env.FAVICONS_FILES as string);
    console.log(`RUN: Copy favicon folder from ${targetFavPath}`);
    fs.copyFileSync(targetFavPath,imgPath);
  });


}

export {faviconFixer}