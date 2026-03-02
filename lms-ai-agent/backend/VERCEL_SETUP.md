# Vercel Deployment Setup

## Environment Variables

**CRITICAL**: You must set these environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

### Required Environment Variables:

```
OPENAI_API_KEY=your_openai_api_key_here

DATABASE_URL=sqlite:///./kalviumlabs_forge.sqlite
```

**Note**: Get your OpenAI API key from https://platform.openai.com/api-keys

**Important Notes:**
- The `.env` file is NOT deployed to Vercel
- All environment variables must be set manually in Vercel's dashboard
- Set the environment to "Production", "Preview", and "Development" as needed

## Deployment Settings

When deploying from Vercel dashboard:

- **Root Directory**: `lms-ai-agent/backend` (if deploying from monorepo)
- **Framework Preset**: Other
- **Build Command**: Leave empty
- **Output Directory**: Leave empty or `.`
- **Install Command**: Leave empty (auto-detects `requirements.txt`)

## Database Considerations

⚠️ **SQLite Limitations on Vercel**:
- SQLite files are ephemeral on Vercel's serverless platform
- Data will be lost between deployments and cold starts
- **Recommended**: Migrate to PostgreSQL or MySQL for production

Consider using:
- **Neon** (PostgreSQL) - Free tier available
- **PlanetScale** (MySQL) - Free tier available  
- **Supabase** (PostgreSQL) - Free tier available

## CORS Configuration

Make sure your backend allows your frontend domain. Check [app/main.py](app/main.py):

```python
allow_origins=[
    "http://localhost:5173",
    "https://your-frontend-domain.vercel.app",
]
```

## Testing Deployment

After deployment:
1. Check Vercel deployment logs for errors
2. Test the `/auth/register` endpoint
3. Test the `/chat` endpoint to verify OpenAI API key works
4. Monitor for database persistence issues

## Troubleshooting

### 401 OpenAI API Error
- Verify `OPENAI_API_KEY` is set in Vercel environment variables
- Ensure the key is valid and has credits
- Redeploy after setting environment variables

### Database Not Persisting
- SQLite won't persist on Vercel
- Migrate to a hosted database solution

### CORS Errors
- Add your Vercel frontend URL to `allow_origins` in main.py
- Redeploy backend after changes
