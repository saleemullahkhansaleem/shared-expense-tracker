# 🚀 Deployment Guide for Vercel

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Database** - You'll need a production PostgreSQL database

## Step 1: Set Up Production Database

### Option A: Neon (Recommended - Free Tier)
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create a new project
4. Copy the connection string (looks like: `postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`)

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string

## Step 2: Push Your Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/your-repo-name.git

# Push to GitHub
git push -u origin main
```

## Step 3: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Configure the project:**
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)

## Step 4: Set Environment Variables

In your Vercel project dashboard:

1. **Go to Settings > Environment Variables**
2. **Add the following variables:**

```
DATABASE_URL = postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_URL = https://your-app-name.vercel.app
NEXTAUTH_SECRET = your-super-secret-key-here
```

**Important Notes:**
- Replace `your-app-name` with your actual Vercel app name
- Generate a strong secret for `NEXTAUTH_SECRET` (you can use: `openssl rand -base64 32`)
- Make sure to add these to **Production**, **Preview**, and **Development** environments

## Step 5: Deploy and Set Up Database

1. **Click "Deploy"** in Vercel
2. **Wait for deployment to complete**
3. **Set up your production database:**

```bash
# Run this locally with your production DATABASE_URL
npx prisma db push

# Seed the database (optional)
npm run db:seed
```

## Step 6: Test Your Deployment

1. **Visit your Vercel URL** (e.g., `https://your-app-name.vercel.app`)
2. **Test the application:**
   - Try creating a user
   - Add some contributions and expenses
   - Test all CRUD operations

## Troubleshooting

### Common Issues:

1. **Build Fails:**
   - Check that all dependencies are in `package.json`
   - Ensure `prisma generate` runs during build

2. **Database Connection Issues:**
   - Verify your `DATABASE_URL` is correct
   - Make sure your database allows connections from Vercel

3. **Environment Variables:**
   - Double-check all environment variables are set
   - Make sure they're added to all environments (Production, Preview, Development)

### Useful Commands:

```bash
# Check build locally
npm run build

# Test production build locally
npm run start

# View logs in Vercel dashboard
# Go to your project > Functions tab
```

## Post-Deployment

1. **Set up custom domain** (optional)
2. **Configure monitoring** (optional)
3. **Set up automatic deployments** from your main branch

## Security Notes

- Never commit `.env` files to Git
- Use strong, unique secrets for production
- Regularly update dependencies
- Monitor your application logs

Your app should now be live at `https://your-app-name.vercel.app`! 🎉
