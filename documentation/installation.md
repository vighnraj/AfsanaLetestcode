# Installation Guide

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18.x or higher recommended)
- **npm** (version 9.x or higher) or **yarn** (version 1.22.x or higher)
- A code editor (VS Code recommended)

## Step 1: Extract the Package

1. Download the package from CodeCanyon
2. Extract the ZIP file to your desired location
3. Navigate to the `source` folder

## Step 2: Install Dependencies

Open your terminal/command prompt in the `source` folder and run:

```bash
# Using npm
npm install

# OR using yarn
yarn install
```

This will install all required dependencies listed in `package.json`.

## Step 3: Configure Environment Variables

1. Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

2. Open the `.env` file and configure your settings:

```env
VITE_API_BASE_URL=https://your-api-url.com/api
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

## Step 4: Start Development Server

Run the following command to start the development server:

```bash
# Using npm
npm run dev

# OR using yarn
yarn dev
```

The application will start at `http://localhost:5173` (default Vite port).

## Step 5: Build for Production

When you're ready to deploy, create a production build:

```bash
# Using npm
npm run build

# OR using yarn
yarn build
```

The build output will be in the `dist` folder.

## Step 6: Preview Production Build

To preview the production build locally:

```bash
# Using npm
npm run preview

# OR using yarn
yarn preview
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the port in `vite.config.js` or kill the process using the port

2. **Module not found errors**
   - Delete `node_modules` folder and `package-lock.json`
   - Run `npm install` again

3. **Build errors**
   - Ensure all environment variables are properly set
   - Check for any TypeScript errors (if using TypeScript)

### Getting Help

If you encounter issues not covered here, please:
1. Check the FAQ section in this documentation
2. Search CodeCanyon item comments
3. Contact support with detailed error information
