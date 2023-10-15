/*
 * Copyright (c) 2023  Igor Buldin <i@irbisadm.dev>
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */


function buildRootSection() {
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

function buildPathSection(projectPath: string) {
    const curedPath = projectPath.replace(/\\/g, '/');
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

export {buildRootSection, buildPathSection}