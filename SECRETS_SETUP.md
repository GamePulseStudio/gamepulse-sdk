# Repository Secrets Setup Guide

This guide walks you through setting up all the required secrets for automated publishing of the GameAlytics SDK.

## Step 1: Access Repository Settings

1. Go to your GitHub repository: `https://github.com/gamealytics/gamealytics-sdk`
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**

## Step 2: Android Publishing Secrets

### Maven Central (Sonatype) Setup

1. **Create Sonatype Account**
   - Go to https://issues.sonatype.org/
   - Create a JIRA account
   - Create a ticket to request repository access for `com.gamealytics`

2. **Generate GPG Key**
   ```bash
   # Generate new GPG key
   gpg --gen-key
   
   # List keys to get key ID
   gpg --list-secret-keys --keyid-format LONG
   
   # Export private key (base64 encoded)
   gpg --export-secret-keys YOUR_KEY_ID | base64
   
   # Upload public key to keyserver
   gpg --keyserver keyserver.ubuntu.com --send-keys YOUR_KEY_ID
   ```

3. **Add Android Secrets**
   ```
   OSSRH_USERNAME=your_sonatype_username
   OSSRH_PASSWORD=your_sonatype_password
   SIGNING_KEY_ID=your_gpg_key_id (last 8 characters)
   SIGNING_PASSWORD=your_gpg_key_passphrase
   SIGNING_SECRET_KEY=base64_encoded_private_key
   ```

## Step 3: iOS Publishing Secrets

### CocoaPods Trunk Setup

1. **Register with CocoaPods**
   ```bash
   pod trunk register your-email@example.com 'Your Name'
   ```

2. **Get Trunk Token**
   ```bash
   pod trunk me
   ```

3. **Add iOS Secret**
   ```
   COCOAPODS_TRUNK_TOKEN=your_cocoapods_trunk_token
   ```

## Step 4: NPM Publishing Secrets

### NPM Token Setup

1. **Create NPM Account**
   - Go to https://www.npmjs.com/
   - Create account or login

2. **Create Access Token**
   ```bash
   npm login
   npm token create --read-only=false
   ```
   Or via NPM website:
   - Go to Account Settings → Access Tokens
   - Generate New Token (Automation type)

3. **Add NPM Secret**
   ```
   NPM_TOKEN=your_npm_token
   ```

## Step 5: Verify Secrets Configuration

After adding all secrets, your repository should have:

### Required Secrets
- `OSSRH_USERNAME` - Sonatype username
- `OSSRH_PASSWORD` - Sonatype password  
- `SIGNING_KEY_ID` - GPG key ID
- `SIGNING_PASSWORD` - GPG key passphrase
- `SIGNING_SECRET_KEY` - Base64 encoded GPG private key
- `COCOAPODS_TRUNK_TOKEN` - CocoaPods trunk token
- `NPM_TOKEN` - NPM access token

## Step 6: Test Publishing Workflow

1. **Manual Test**
   - Go to Actions tab
   - Select "Publish SDKs" workflow
   - Click "Run workflow"
   - Enter version: `2.0.0-beta.1`
   - Click "Run workflow"

2. **Tag-based Test**
   ```bash
   git tag v2.0.0-beta.1
   git push origin v2.0.0-beta.1
   ```

## Troubleshooting

### Common Issues

1. **GPG Key Issues**
   - Ensure private key is properly base64 encoded
   - Verify key ID is correct (last 8 characters)
   - Check passphrase is correct

2. **Sonatype Issues**
   - Verify JIRA ticket is approved
   - Check username/password are correct
   - Ensure repository permissions are granted

3. **CocoaPods Issues**
   - Verify email is registered with CocoaPods
   - Check trunk token is valid
   - Ensure podspec validation passes locally

4. **NPM Issues**
   - Verify token has publish permissions
   - Check organization access for scoped packages
   - Ensure package names are available

### Testing Commands

```bash
# Test Android build locally
cd packages/android
./gradlew build

# Test iOS podspec validation
cd packages/ios
pod lib lint GameAlytics.podspec --allow-warnings

# Test NPM packages
cd packages/core
npm run build
npm pack --dry-run

cd ../web
npm run build
npm pack --dry-run
```

## Security Best Practices

1. **Rotate Secrets Regularly**
   - Update tokens every 6-12 months
   - Use time-limited tokens when possible

2. **Limit Permissions**
   - Use minimum required permissions
   - Separate tokens for different services

3. **Monitor Usage**
   - Check GitHub Actions logs regularly
   - Monitor package download metrics

4. **Backup Recovery**
   - Keep secure backup of GPG keys
   - Document all account credentials safely

## Next Steps

Once secrets are configured:

1. Test the publishing workflow
2. Create your first release tag
3. Monitor the automated publishing process
4. Update documentation with published package information
