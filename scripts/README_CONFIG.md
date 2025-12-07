# Firebase Configuration

This project uses Firebase for authentication and database.

## Configuration Files

- `scripts/config.js` - Firebase configuration (demo/development)
- `scripts/config.prod.js` - Production config (excluded from Git)
- `scripts/config.local.js` - Local config (excluded from Git)

## Security Note

**For production deployments:**
1. Create a `config.prod.js` file based on `config.js`
2. Use environment-specific API keys and restrictions
3. Enable Firebase Security Rules
4. Restrict API keys to specific domains in Firebase Console

**Current setup:** The keys in `config.js` are for demonstration purposes. In a production environment, these should be:
- Stored in environment variables
- Protected by Firebase Security Rules
- Restricted to specific domains/apps in Firebase Console

Firebase API keys are designed to be public in client-side apps, but should always be paired with proper security rules.
