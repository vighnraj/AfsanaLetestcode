# Frequently Asked Questions (FAQ)

## General Questions

### Q: Is the backend included with this template?
**A:** No, this is a **FRONTEND-ONLY** template. You need to create your own backend API. The template is designed to work with any REST API backend.

### Q: What technologies are used in this template?
**A:** The template uses:
- React 18
- Vite (build tool)
- React Router DOM 7
- Bootstrap 5
- Material UI
- Axios (HTTP client)
- Firebase (optional)
- Chart.js

### Q: Can I use this with my existing backend?
**A:** Yes! Simply update the API base URL in your `.env` file and modify the API calls to match your backend endpoints.

### Q: Is TypeScript supported?
**A:** The template is written in JavaScript (JSX). You can migrate to TypeScript if needed, but it's not included out of the box.

---

## Installation & Setup

### Q: I'm getting "Module not found" errors. What should I do?
**A:**
1. Delete the `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again
4. If the issue persists, check if all dependencies are listed in `package.json`

### Q: The development server won't start. What's wrong?
**A:**
- Ensure Node.js version 18+ is installed
- Check if port 5173 is available
- Try running `npm run dev -- --host` to see detailed errors

### Q: How do I change the default port?
**A:** Update `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 3000 // Your desired port
  }
});
```

---

## API & Backend

### Q: How do I connect to my backend API?
**A:**
1. Update `VITE_API_BASE_URL` in your `.env` file
2. Update `src/Config.js` if needed
3. Ensure your backend allows CORS from your frontend domain

### Q: Where do I modify API endpoints?
**A:** API calls are made throughout the components using the Axios instance from `src/services/axiosInterceptor.js`. Search for `api.get()`, `api.post()`, etc. to find and modify endpoints.

### Q: How is authentication handled?
**A:** The template uses JWT tokens stored in localStorage. The Axios interceptor automatically adds the token to request headers. Implement your own token generation on the backend.

---

## Firebase

### Q: Is Firebase required?
**A:** No, Firebase is optional. It's used for:
- Push notifications
- Google Sign-In (optional)

You can disable Firebase by removing the related code from `App.jsx`.

### Q: How do I disable Firebase?
**A:** Comment out or remove the Firebase imports and initialization code in `App.jsx`. The app will work without Firebase features.

---

## Customization

### Q: How do I change the logo?
**A:** Replace the logo files in `src/assets/` folder. Update the import paths in components that use the logo.

### Q: How do I change the color scheme?
**A:** Modify the CSS variables in:
- `src/index.css`
- `src/App.css`
- Component-specific CSS files

### Q: How do I add a new page/component?
**A:**
1. Create your component in the appropriate folder under `src/components/`
2. Import it in `App.jsx`
3. Add a new route in the Routes configuration
4. Add navigation link in the sidebar if needed

### Q: How do I modify the sidebar menu?
**A:** Edit `src/layout/Sidebar.jsx` to add, remove, or modify menu items.

---

## Roles & Permissions

### Q: How do I add a new user role?
**A:**
1. Define the role in your backend
2. Update frontend role checks in components
3. Modify `src/auth/permissionUtils.js`
4. Update sidebar menu visibility

### Q: Are permissions enforced on the frontend?
**A:** Frontend permission checks are for UI purposes only. **Always enforce permissions on your backend** for security.

---

## Deployment

### Q: How do I deploy the application?
**A:**
1. Run `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure your server for SPA routing (all routes should serve `index.html`)

### Q: Which hosting services are recommended?
**A:**
- Netlify
- Vercel
- AWS S3 + CloudFront
- Firebase Hosting
- Any static hosting service

### Q: How do I configure environment variables in production?
**A:** Set environment variables in your hosting provider's dashboard or deployment configuration. Vite will embed them during build time.

---

## Troubleshooting

### Q: The page is blank after build
**A:**
- Check browser console for errors
- Ensure all environment variables are set
- Verify the base path in `vite.config.js` matches your deployment URL

### Q: API calls fail with CORS errors
**A:** Configure your backend to allow requests from your frontend domain:
```javascript
// Express.js example
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

### Q: Notifications are not working
**A:**
- Check Firebase configuration
- Verify VAPID key is correct
- Ensure browser allows notifications
- Check service worker registration

---

## Support

### Q: How do I get support?
**A:**
- Check this documentation first
- Search CodeCanyon item comments
- Contact through CodeCanyon support

### Q: Can I request new features?
**A:** Feature requests can be submitted through CodeCanyon item comments. Custom development may be available for additional fees.

### Q: Are updates included?
**A:** Yes, updates are included with your purchase. Check CodeCanyon for new versions.
