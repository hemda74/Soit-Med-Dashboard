# Web App Chat API 401 Unauthorized Fix

## 🔍 Problem

Admin account in Web App was getting `401 Unauthorized` error when accessing `/api/Chat/conversations`.

**Error:** `http://192.168.1.182:5117/api/Chat/conversations` → `401 Unauthorized`

## 🎯 Root Cause

The `chatApi.ts` was using `apiClient` (which is `userApiClient` from `userApi.ts`) but **was not passing the authentication token** to the API requests.

`userApiClient` requires the token to be passed as a parameter in each method call:
- `apiClient.get(endpoint, token)`
- `apiClient.post(endpoint, data, token)`
- `apiClient.put(endpoint, data, token)`

But `chatApi.ts` was calling:
- `apiClient.get('/Chat/conversations')` ❌ (no token)
- `apiClient.post('/Chat/conversations', {...})` ❌ (no token)

## ✅ Solution

### 1. Updated `chatApi.ts`
- Added `getAuthToken()` import from `@/utils/authUtils`
- Added token retrieval before each API call
- Added token validation with proper error messages
- Passed token to all `apiClient` method calls

### 2. Updated Functions:
- ✅ `getConversations()` - Now passes token
- ✅ `getOrCreateConversation()` - Now passes token
- ✅ `getConversation()` - Now passes token
- ✅ `assignAdmin()` - Now passes token
- ✅ `getMessages()` - Now passes token (also fixed query params)
- ✅ `sendTextMessage()` - Now passes token
- ✅ `sendVoiceMessage()` - Now uses fetch with token (FormData handling)
- ✅ `markMessagesAsRead()` - Now passes token
- ✅ `getUnreadCount()` - Now passes token

### 2. Updated `userApi.ts`
- Fixed `request()` method to accept `token` parameter
- Added Authorization header when token is provided

## 📝 Code Changes

### Before:
```typescript
async getConversations(): Promise<{ data: ChatConversationResponseDTO[] }> {
    const response = await apiClient.get('/Chat/conversations');
    return response.data;
}
```

### After:
```typescript
async getConversations(): Promise<{ data: ChatConversationResponseDTO[] }> {
    const token = getAuthToken();
    if (!token) {
        throw new Error('No authentication session. Please log in.');
    }
    const response = await apiClient.get('/Chat/conversations', token);
    return response.data;
}
```

## 🧪 Testing

### Test Steps:
1. ✅ Login as Admin in Web App
2. ✅ Navigate to `/chat`
3. ✅ Verify conversations load without 401 error
4. ✅ Select a conversation
5. ✅ Send a message
6. ✅ Verify all API calls work

### Expected Results:
- ✅ No more 401 Unauthorized errors
- ✅ Conversations load successfully
- ✅ Messages can be sent/received
- ✅ All chat features work correctly

## 📋 Files Modified

1. ✅ `Web/src/services/chat/chatApi.ts` - Added token to all API calls
2. ✅ `Web/src/services/user/userApi.ts` - Fixed request method to accept token

## 🚀 Status

**FIXED** ✅

All chat API calls now properly include authentication tokens, resolving the 401 Unauthorized error for Admin users.

