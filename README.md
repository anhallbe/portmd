# PortMD
Converts Markdown files to PDF.

## Status
Project is mostly for personal use and experimentation purposes. Do not expect support or regular release cycles.

## Installation & usage
**NOTE:** If you just want to run the pre-built package, see instructions in release notes https://github.com/anhallbe/portmd/releases

If you want to build and run the tool from the source, do the following:

1. Clone this repository
2. Install dev dependencies:
   - `npm install`
3. Build the source code:
   - `npm run build:clean`
4. Run the program
   - Without installing: `node ./dist/portmd README.md`
   - Install globally: `npm install -g .` followed by `portmd README.md`
5. Open the newly created `README.pdf` in your PDF reader.
