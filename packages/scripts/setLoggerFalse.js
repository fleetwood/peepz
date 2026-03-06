const fs = require('fs');
const path = require('path');
const { sync: globSync } = require('glob'); // Use synchronous version

// --- Configuration ---
const projectRoot = path.resolve(__dirname, '../..'); // Go up to monorepo root
const filePattern = path.join(projectRoot, '**/*.{ts,tsx,js,jsx,vue}'); // Process all relevant files in monorepo

// Regex patterns to handle different Logger.instance formats
// Pattern 1: Logger.instance('someName', false) - no second argument
const regexNoArg = /Logger\.instance\('([^']*)'\)/g;
// Pattern 2: Logger.instance('someName', false) - second argument is true
const regexTrueArg = /Logger\.instance\('([^']*)',\s*true\)/g;

// Replacement string: Logger.instance('someName', false)
// $1 refers to the captured group (the logger name).
const replacementString = "Logger.instance('$1', false)";
// --- End Configuration ---

function processFiles() {
    console.log('Starting logger update process...');
    console.log(`Searching for files in: ${filePattern}`);

    try {
        const files = globSync(filePattern, { 
            nodir: true, 
            dot: false, 
            absolute: true,
            ignore: [
                '**/node_modules/**',
                '**/dist/**',
                '**/build/**',
                '**/.nuxt/**',
                '**/.output/**',
                '**/coverage/**',
                '**/.git/**'
            ]
        }); // Ensure absolute paths and exclude common build directories
        let filesChangedCount = 0;
        let filesProcessedCount = 0;

        if (files.length === 0) {
            console.log('No files found matching the pattern. Ensure the path and pattern are correct.');
            return;
        }

        console.log(`Found ${files.length} files to potentially process.`);

        for (const filePath of files) { // filePath is now absolute
            filesProcessedCount++;
            const displayPath = path.relative(projectRoot, filePath); // For cleaner logging
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                // Apply both regex patterns
                let newContent = content.replace(regexNoArg, replacementString);
                newContent = newContent.replace(regexTrueArg, replacementString);

                if (newContent !== content) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                    console.log(`Updated: ${displayPath}`);
                    filesChangedCount++;
                }
            } catch (err) {
                console.error(`Error processing file ${displayPath}:`, err.message);
            }
        }

        console.log(`\n--- Summary ---`);
        console.log(`Files processed: ${filesProcessedCount}`);
        if (filesChangedCount > 0) {
            console.log(`Successfully updated ${filesChangedCount} files.`);
        } else {
            console.log('No files needed updating (all loggers might already be in the desired format).');
        }
        console.log('----------------');

    } catch (err) {
        console.error('Error finding files:', err.message);
    }
}

processFiles();
