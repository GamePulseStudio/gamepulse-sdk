#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Synchronizing versions across all platforms...\n');

// Read the central version configuration
const versionPath = path.join(__dirname, '..', 'version.json');
if (!fs.existsSync(versionPath)) {
    console.error('❌ version.json not found!');
    process.exit(1);
}

const versionConfig = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
const version = versionConfig.version;

console.log(`📋 Target version: ${version}`);

// Update root package.json
const rootPackagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(rootPackagePath)) {
    const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
    rootPackage.version = version;
    fs.writeFileSync(rootPackagePath, JSON.stringify(rootPackage, null, 2) + '\n');
    console.log('✅ Updated root package.json');
}

// Update Android build.gradle
const androidBuildGradlePath = path.join(__dirname, '..', 'android', 'build.gradle');
if (fs.existsSync(androidBuildGradlePath)) {
    let buildGradleContent = fs.readFileSync(androidBuildGradlePath, 'utf8');
    
    // Update versionName in defaultConfig
    buildGradleContent = buildGradleContent.replace(
        /versionName\s+"[^"]*"/g, 
        `versionName "${version}"`
    );
    
    // Update version in publishing
    buildGradleContent = buildGradleContent.replace(
        /version\s+'[^']*'/g,
        `version '${version}'`
    );
    
    fs.writeFileSync(androidBuildGradlePath, buildGradleContent);
    console.log('✅ Updated Android build.gradle');
}

// Update Unity package.json
const unityPackagePath = path.join(__dirname, '..', 'unity', 'package.json');
if (fs.existsSync(unityPackagePath)) {
    const unityPackage = JSON.parse(fs.readFileSync(unityPackagePath, 'utf8'));
    unityPackage.version = version;
    fs.writeFileSync(unityPackagePath, JSON.stringify(unityPackage, null, 2) + '\n');
    console.log('✅ Updated Unity package.json');
}

// Update Web package.json
const webPackagePath = path.join(__dirname, '..', 'web', 'package.json');
if (fs.existsSync(webPackagePath)) {
    const webPackage = JSON.parse(fs.readFileSync(webPackagePath, 'utf8'));
    webPackage.version = version;
    fs.writeFileSync(webPackagePath, JSON.stringify(webPackage, null, 2) + '\n');
    console.log('✅ Updated Web package.json');
}

// Update README files
const readmeFiles = [
    'README.md',
    'android/README.md',
    'unity/README.md',
    'web/README.md'
];

readmeFiles.forEach(readmePath => {
    const fullPath = path.join(__dirname, '..', readmePath);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Update version badges and installation instructions
        content = content.replace(
            /Version:\s*\*\*[^*]*\*\*/g,
            `Version: **${version}**`
        );
        content = content.replace(
            /v[0-9]+\.[0-9]+\.[0-9]+/g,
            `v${version}`
        );
        content = content.replace(
            /@[0-9]+\.[0-9]+\.[0-9]+/g,
            `@${version}`
        );
        
        fs.writeFileSync(fullPath, content);
        console.log(`✅ Updated ${readmePath}`);
    }
});

console.log(`\n🎉 Version synchronization complete! All platforms are now at version ${version}`);
console.log(`\n💡 Next steps:`);
console.log(`   1. Review the changes: git diff`);
console.log(`   2. Test builds: npm run build`);
console.log(`   3. Commit changes: git add . && git commit -m "Sync all platforms to version ${version}"`);
console.log(`   4. Create release: git tag v${version} && git push origin v${version}`);