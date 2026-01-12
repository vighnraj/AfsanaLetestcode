# Installation Guide

Complete installation instructions for EduCRM React Admin Dashboard.

---

## Prerequisites

Before installing, ensure you have:

- **Node.js** version 18.0 or higher
- **npm** version 9.0 or higher (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A code editor (VS Code recommended)

### Check Your Versions

```bash
node --version   # Should be v18.0.0 or higher
npm --version    # Should be 9.0.0 or higher
```

---

## Installation Steps

### Step 1: Extract the Package

Extract the downloaded package to your desired location.

### Step 2: Navigate to Source Directory

```bash
cd source
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages defined in `package.json`.

### Step 4: Configure Environment

Copy the environment example file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Your backend API URL (required)
VITE_API_BASE_URL=https://your-api.com/api/

# Your Socket.io server URL (required for real-time features)
VITE_SOCKET_URL=https://your-api.com

# Firebase configuration (optional)
VITE_FIREBASE_API_KEY=your-key
# ... see .env.example for all options
```

See [ENV_SETUP.md](ENV_SETUP.md) for detailed environment configuration.

### Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Production Build

### Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

---

## Deployment Options

### Vercel

1. Push your code to a Git repository
2. Import the project in Vercel
3. Set the root directory to `source`
4. Add environment variables in Vercel dashboard
5. Deploy

### Netlify

1. Push your code to a Git repository
2. Connect to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables
6. Deploy

### Traditional Hosting

1. Build the application: `npm run build`
2. Upload contents of `dist` folder to your web server
3. Configure server for SPA routing (see below)

### Nginx Configuration (for SPA)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache Configuration (.htaccess)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Troubleshooting

### Common Issues

**Issue: `npm install` fails**

Solution: Clear npm cache and try again:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Issue: Port 5173 already in use**

Solution: Change the port in `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 3000
  }
});
```

**Issue: API calls failing**

Solution:
- Check `VITE_API_BASE_URL` in your `.env` file
- Ensure your backend is running
- Check CORS configuration on your backend

**Issue: Build fails with memory error**

Solution: Increase Node.js memory limit:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## Development Tips

### Hot Module Replacement (HMR)

Changes to your code are automatically reflected in the browser during development.

### ESLint

Run the linter to check for code issues:
```bash
npm run lint
```

### File Structure

Keep related files together in the `components` directory. Each major feature has its own folder.

---

## Next Steps

After installation:

1. Configure environment variables (see [ENV_SETUP.md](ENV_SETUP.md))
2. Set up your backend API (see [API_INTEGRATION.md](API_INTEGRATION.md))
3. Customize the theme and branding
4. Deploy to production
