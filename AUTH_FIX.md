# Frontend Auth Migration - Final Fix

## Problem
The frontend was trying to import `requireAuth` and `requireGuest` from `lib/auth-helpers.ts`, but that file was stubbed out (empty exports) because we initially thought auth helpers weren't needed in the frontend.

## Solution
Recreated `lib/auth-helpers.ts` with server-side helpers that fetch session data from the **backend API** instead of directly from the database.

## Changes Made

### 1. Updated `lib/auth-helpers.ts`
**Before**: Empty stub file
**After**: Server-side helpers that call the backend API

```typescript
// Key functions:
- getSession()      // Fetches session from backend API
- requireAuth()     // Redirects to /signin if not authenticated
- requireGuest()    // Returns session for guest check
- getAuthUser()     // Gets current user or null
```

**How it works**:
1. Reads `better-auth.session_token` cookie from request
2. Sends cookie to backend `/auth/get-session` endpoint
3. Backend validates session and returns user data
4. Frontend uses this data for server-side rendering

### 2. Updated `app/page.tsx`
- Removed unused `import { auth } from "@/lib/auth"`
- Kept `requireAuth()` call (now works with new helper)

### 3. Files Structure

```
frontend/lib/
├── auth.ts              # Stubbed (not needed - backend handles config)
├── auth-client.ts       # ✅ Better-auth React client (for client components)
├── auth-helpers.ts      # ✅ NEW: Server-side helpers (for server components)
├── api.ts               # ✅ Axios client for API calls
└── utils.ts             # ✅ Utility functions
```

## Authentication Flow

### Server Components (SSR)
```typescript
// app/page.tsx
import { requireAuth } from "@/lib/auth-helpers";

export default async function Page() {
  const session = await requireAuth(); // Calls backend API
  return <div>Hello {session.user.name}</div>;
}
```

### Client Components
```typescript
// components/some-component.tsx
"use client";
import { authClient } from "@/lib/auth-client";

export function SomeComponent() {
  const { data: session } = authClient.useSession();
  return <div>Hello {session?.user.name}</div>;
}
```

### API Calls
```typescript
// hooks/use-profile.ts
import api from "@/lib/api";

export const useUserProfile = () =>
  useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/profile');
      return data;
    },
  });
```

## Environment Variables Required

### Frontend `.env`
```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

The `NEXT_PUBLIC_API_URL` is used by:
- `lib/auth-helpers.ts` - To fetch session from backend
- `lib/api.ts` - For all API calls
- `lib/auth-client.ts` - For better-auth client

## Testing

### Build Test
```bash
cd frontend
npm run build
```

Should compile without errors (requires Node.js >= 20.9.0)

### Dev Test
```bash
cd frontend
npm run dev
```

1. Visit http://localhost:3001
2. Should redirect to /signin if not authenticated
3. After login, should show user name and ID

## Backend Requirements

The backend must expose the `/auth/get-session` endpoint. This is automatically handled by better-auth when you use `toNodeHandler(auth)` in the auth controller.

**Backend endpoint**: `GET /api/auth/get-session`
- Accepts: Cookie header with session token
- Returns: `{ session: { user: {...}, ... } }`

## Notes

1. **Server vs Client**: 
   - Server components use `auth-helpers.ts`
   - Client components use `auth-client.ts`

2. **No Direct DB Access**: 
   - Frontend never touches the database
   - All auth checks go through backend API

3. **Cookie Handling**: 
   - Better-auth automatically manages cookies
   - Frontend just reads and forwards them to backend

4. **Session Validation**: 
   - All session validation happens in backend
   - Frontend just displays the results

## Troubleshooting

### "Export requireAuth doesn't exist"
- Make sure `lib/auth-helpers.ts` has the new code (not stubbed)
- Clear `.next` cache: `rm -rf .next`

### "Cannot connect to backend"
- Check backend is running on port 3000
- Verify `NEXT_PUBLIC_API_URL` in `.env`

### "Session not found"
- Check cookies are being sent
- Verify backend auth is working
- Check browser dev tools → Application → Cookies

### Node version error
- Upgrade to Node.js 20.9.0 or higher
- Use `nvm install 20` or download from nodejs.org
