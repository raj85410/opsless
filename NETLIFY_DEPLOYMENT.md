# Netlify Deployment Guide

This guide will help you deploy the Opsless DevOps Platform to Netlify.

## Prerequisites

1. A Netlify account
2. Your project connected to a Git repository (GitHub, GitLab, or Bitbucket)
3. Firebase project configured

## Deployment Steps

### 1. Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose your Git provider and select your repository
4. Configure the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18` (or higher)

### 2. Environment Variables

Add the following environment variables in your Netlify dashboard:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Note**: The application will fall back to default Firebase configuration if environment variables are not set, but it's recommended to use your own Firebase project for production.

### 3. Build Settings

The project is already configured with:
- `netlify.toml` for build configuration
- `public/_redirects` for SPA routing
- Optimized Vite configuration for production builds

### 4. Deploy

1. Click "Deploy site"
2. Netlify will automatically build and deploy your site
3. Your site will be available at a Netlify subdomain (e.g., `https://your-site-name.netlify.app`)

## Custom Domain (Optional)

1. Go to your site's dashboard in Netlify
2. Navigate to "Domain settings"
3. Click "Add custom domain"
4. Follow the DNS configuration instructions

## Troubleshooting

### Build Failures

If the build fails with dependency issues:

1. Check that all dependencies are in `package.json`
2. Ensure Node.js version is 18 or higher
3. Clear Netlify cache and retry

#### Common Build Errors

**"Could not resolve" errors**: If you encounter errors like "Could not resolve './components/Logs/LogViewer'", this is usually due to:
- Case sensitivity issues (Netlify runs on Linux)
- Missing file extensions
- Incorrect import paths

**Solution**: The project is now configured with proper path resolution and should handle these issues automatically.

### Routing Issues

If you encounter 404 errors on direct page access:

1. Verify `public/_redirects` file exists
2. Check that `netlify.toml` has the correct redirect rules
3. Ensure the build completed successfully

### Environment Variables

If Firebase authentication doesn't work:

1. Verify all Firebase environment variables are set
2. Check that the Firebase project is properly configured
3. Ensure the Firebase app is set up for web deployment

## Performance Optimization

The project includes several optimizations:

- **Code Splitting**: Components are lazy-loaded for faster initial load
- **Manual Chunks**: Dependencies are split into optimized chunks
- **Caching**: Static assets are cached for 1 year
- **Security Headers**: Added security headers for better protection

## Monitoring

After deployment:

1. Check the "Functions" tab for any serverless function logs
2. Monitor the "Analytics" tab for performance metrics
3. Set up notifications for build failures

## Support

For issues specific to this deployment:

1. Check the build logs in Netlify dashboard
2. Verify all environment variables are set correctly
3. Ensure your Firebase project is properly configured 