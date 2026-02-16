# HuggingFace Deployment Guide

## Prerequisites

1. **HuggingFace Account**: [Sign up](https://huggingface.co/join) if you don't have one
2. **OAuth Apps Configured**: Google and GitHub OAuth apps with HuggingFace URLs
3. **Environment Variables**: Prepare all required secrets

## Step 1: Create a New Space

1. Go to [HuggingFace Spaces](https://huggingface.co/spaces)
2. Click "Create new Space"
3. Choose:
   - **Space name**: `forecastai-enterprise` (or your preference)
   - **License**: MIT
   - **SDK**: Docker
   - **Hardware**: T4 Medium (16GB RAM recommended)

## Step 2: Configure Environment Variables

In your Space settings, add the following secrets:

```bash
# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_secret

# Application Secrets
SECRET_KEY=your_long_random_secret_key_here
JWT_SECRET_KEY=another_long_random_secret

# URLs (update with your Space URL)
FRONTEND_URL=https://your-username-forecastai-enterprise.hf.space
BACKEND_URL=https://your-username-forecastai-enterprise.hf.space
ALLOWED_ORIGINS=https://your-username-forecastai-enterprise.hf.space

# Database (optional - for production)
DATABASE_URL=postgresql://user:password@host:port/dbname
```

## Step 3: Update OAuth Redirect URIs

### Google OAuth Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project → APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URI:
   ```
   https://your-username-forecastai-enterprise.hf.space/api/auth/callback/google
   ```

### GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Edit your OAuth App
3. Update "Authorization callback URL":
   ```
   https://your-username-forecastai-enterprise.hf.space/api/auth/callback/github
   ```

## Step 4: Deploy to HuggingFace

### Option A: Git Push (Recommended)

```bash
# Add HuggingFace remote
git remote add huggingface https://huggingface.co/spaces/YOUR_USERNAME/forecastai-enterprise

# Push to HuggingFace
git push huggingface main
```

### Option B: Upload Files via Web Interface

1. In your Space, click "Files and versions"
2. Upload your project files
3. Ensure `Dockerfile` is in the root directory

## Step 5: Verify Deployment

1. Wait for build to complete (check "Logs" tab)
2. Once running, visit your Space URL
3. Test the application:
   - Upload a sample dataset
   - Run a forecast
   - Generate business insights
   - Export reports

## Memory Optimization (16GB Limit)

The app includes automatic memory management:

- ✅ Chunked data processing (10k rows at a time)
- ✅ Automatic session cleanup (24h old sessions removed)
- ✅ DataFrame memory optimization
- ✅ Aggressive cleanup when memory > 14GB
- ✅ Garbage collection after heavy operations

**Monitor memory usage** in the application logs:
```
Request: POST /api/analysis/train | Duration: 45.2s | Memory: 8.5GB (Δ +2.1GB)
```

## Performance Monitoring

All requests are automatically monitored:
- **Duration**: Response time for each endpoint
- **Memory**: RAM usage and delta per request
- **Errors**: Logged with full stack traces

View logs in the "Logs" tab of your Space.

## Troubleshooting

### Memory Issues

**Symptom**: App crashes or becomes unresponsive
**Solution**:
1. Reduce dataset size limit in `large_dataset_processor.py`
2. Increase cleanup frequency
3. Consider upgrading to A10G hardware (24GB)

### OAuth Errors

**Symptom**: "OAuth callback failed" errors
**Solution**:
1. Verify redirect URIs match exactly (including https://)
2. Check environment variables are set correctly
3. Ensure OAuth apps are not in "testing" mode (publish for production)

### Build Failures

**Symptom**: Docker build fails
**Solution**:
1. Check `requirements.txt` for conflicting dependencies
2. Verify all files are pushed to the Space
3. Review build logs for specific errors

## Scaling Recommendations

For production workloads:

1. **Upgrade Hardware**: T4 Medium → A10G Large (24GB RAM)
2. **External Database**: Use PostgreSQL instead of SQLite
3. **Redis Cache**: Add Redis for session management
4. **CDN**: Use HuggingFace's built-in CDN for frontend assets
5. **Load Balancing**: Create duplicate Spaces for redundancy

## Support

For issues:
1. Check [HuggingFace Spaces Documentation](https://huggingface.co/docs/hub/spaces)
2. Review application logs in the "Logs" tab
3. File issues in your repository

---

**Deployment Checklist**:
- [ ] OAuth apps configured with correct redirect URIs
- [ ] All environment variables set in Space settings
- [ ] Docker build completes successfully
- [ ] Application accessible at Space URL
- [ ] Data upload and forecasting work end-to-end
- [ ] Memory usage stays below 14GB during typical operations
- [ ] Export features (PDF, Excel) function correctly
