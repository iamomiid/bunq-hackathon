# FAQ

## How do I reset my API key?
1. Open your Bunq account settings.  
2. Revoke your old API key.  
3. Create a new API key.  
4. Update the `BUNQ_API_KEY` in your `.env` file.

## What is strictness level?
- **Strictness** sets how hard it is to bypass a limit.  
- **Flexible** (low) – easy to ask for unblock.  
- **Moderate** (medium) – normal checks.  
- **Strict** (high) – needs strong reason to unblock.

## Can I use another bank?
No. Right now, Budget Guard works only with Bunq cards. We may add more banks later.

## Where is my data stored?
- Your settings and limits are in a PostgreSQL database you set up (`DATABASE_URL`).  
- Transaction data comes from Bunq when you use the app. We do not store your full transaction history—only what we need for limits.

## Who can see my data?
Only you. All data lives in your own database and your Bunq account. We do not share it with others.
