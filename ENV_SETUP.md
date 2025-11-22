# Environment Configuration

This project uses environment variables for unified API configuration.

## Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file:**
   ```env
   # For local development
   VITE_API_BASE_URL=http://localhost:5117
   
   # For network access (from other devices)
   VITE_API_BASE_URL=http://192.168.1.182:5117
   ```

## Configuration Options

### `VITE_API_BASE_URL` (Required)
- **Description:** Base URL for all API calls
- **Default:** `http://localhost:5117`
- **Examples:**
  - Local: `http://localhost:5117`
  - Network: `http://192.168.1.182:5117`
  - Production: `https://api.yourdomain.com`

### `VITE_SIGNALR_URL` (Optional)
- **Description:** SignalR Hub URL (for real-time notifications)
- **Default:** Uses `VITE_API_BASE_URL` if not set
- **Example:** `http://192.168.1.182:5117`

## Usage

After setting up your `.env` file:
1. Restart the dev server: `npm run dev`
2. All API calls will automatically use the configured URL
3. No code changes needed - everything is centralized in `src/utils/apiConfig.ts`

## Switching Between Local and Network

To switch between local and network access, simply update `VITE_API_BASE_URL` in your `.env` file:

**For local development:**
```env
VITE_API_BASE_URL=http://localhost:5117
```

**For network access:**
```env
VITE_API_BASE_URL=http://192.168.1.182:5117
```

Then restart the dev server.

## Notes

- The `.env` file is gitignored - it won't be committed to version control
- Use `.env.example` as a template for your team
- All API services automatically use `getApiBaseUrl()` from `src/utils/apiConfig.ts`
- Vite proxy configuration also uses the same environment variable

