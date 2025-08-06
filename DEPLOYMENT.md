# 🚀 Deployment Guide

This guide explains how to set up automatic deployment to both GitHub and Firebase.

## 📋 Prerequisites

- GitHub repository
- Firebase project
- Firebase CLI installed locally

## 🔧 Setup Steps

### 1. Firebase Service Account Setup

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/project/my-training-8d8a9
   - Navigate to Project Settings > Service Accounts

2. **Generate Private Key**
   - Click "Generate new private key"
   - Download the JSON file
   - **Keep this file secure** - it contains sensitive credentials

### 2. GitHub Repository Setup

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

2. **Add GitHub Secrets**
   - Go to your repository on GitHub
   - Navigate to Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Add the following secrets:

   **FIREBASE_SERVICE_ACCOUNT**
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Copy the entire content of the downloaded JSON file

   **GITHUB_PAGES_TOKEN** (Optional)
   - Name: `GITHUB_PAGES_TOKEN`
   - Value: Create a Personal Access Token with `repo` permissions

### 3. Enable GitHub Pages (Optional)

1. **Go to Repository Settings**
   - Navigate to Settings > Pages

2. **Configure Source**
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Folder: `/ (root)`

3. **Save Configuration**

## 🔄 Automatic Deployment

Once set up, the deployment process is automatic:

### What Happens on Push

1. **Push to main/master branch**
   ```bash
   git add .
   git commit -m "Update app"
   git push origin main
   ```

2. **GitHub Actions Trigger**
   - Runs tests
   - Builds the app
   - Deploys to Firebase Hosting
   - Optionally deploys to GitHub Pages

3. **Live URLs**
   - **Firebase**: https://my-training-8d8a9.web.app
   - **GitHub Pages**: https://yourusername.github.io/your-repo-name

## 🛠️ Manual Deployment

### Using npm scripts
```bash
# Build and deploy to Firebase only
npm run deploy

# Build and deploy everything (Firebase + Firestore rules)
npm run deploy:all
```

### Using batch file (Windows)
```bash
# Double-click deploy.bat or run:
.\deploy.bat
```

### Using Firebase CLI directly
```bash
# Build the app
cd client
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

## 📊 Deployment Status

### Check GitHub Actions
- Go to your repository on GitHub
- Click "Actions" tab
- View the latest workflow run

### Check Firebase Console
- Visit: https://console.firebase.google.com/project/my-training-8d8a9
- Go to Hosting section
- View deployment history

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check GitHub Actions logs
   - Ensure all dependencies are installed
   - Verify TypeScript compilation

2. **Deployment Fails**
   - Verify Firebase service account secret
   - Check Firebase project ID in workflow
   - Ensure Firebase CLI is authenticated

3. **Authentication Errors**
   - Regenerate Firebase service account key
   - Update GitHub secret with new key

### Debug Commands

```bash
# Test build locally
cd client
npm run build

# Test Firebase deployment
firebase deploy --only hosting --dry-run

# Check Firebase status
firebase projects:list
```

## 🔒 Security Notes

- **Never commit** the Firebase service account JSON file
- **Rotate keys** periodically for security
- **Use environment variables** for sensitive data
- **Monitor deployment logs** for any issues

## 📈 Monitoring

### Firebase Analytics
- Enable Firebase Analytics in console
- Monitor app usage and performance

### GitHub Insights
- View repository analytics
- Monitor deployment frequency
- Track code changes

---

## 🎯 Quick Start Checklist

- [ ] Firebase project created
- [ ] Service account key downloaded
- [ ] GitHub repository created
- [ ] GitHub secrets configured
- [ ] Code pushed to main branch
- [ ] GitHub Actions workflow triggered
- [ ] Deployment successful
- [ ] Live URLs working

## 📞 Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Verify all secrets are configured correctly
3. Test deployment locally first
4. Create an issue in the repository

---

**Live App**: https://my-training-8d8a9.web.app  
**Firebase Console**: https://console.firebase.google.com/project/my-training-8d8a9 