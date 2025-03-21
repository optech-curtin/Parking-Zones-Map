# ArcGIS 10.9 Token-Based Integration Example

This project demonstrates how to integrate ArcGIS (version 10.9 or older) into a modern Next.js web application. Older ArcGIS Enterprise instances require a **two-step token acquisition** flow (OAuth 2.0 → ArcGIS token). This allows your web app to securely call ArcGIS feature services or other resources that require a token.

## Key Features

1. **Two-Step Token Generation**  
   - We first request a standard OAuth access token from ArcGIS using the client ID and client secret.  
   - Next, we exchange that access token for an ArcGIS “legacy” token, which 10.9 servers require.

2. **Secure Token Handling**  
   - All references to the **client secret** remain on the server side in a Next.js API route, ensuring that secrets aren’t exposed to the browser.  
   - The client fetches only the final token from this API route.

3. **Next.js + TypeScript**  
   - Demonstrates a straightforward approach using a custom **API route** in Next.js, a **React** client component, and **TypeScript** for type safety.

4. **ArcGIS IdentityManager Usage**  
   - We manually register the final token in `IdentityManager` so calls to ArcGIS resources automatically append that token.  
   - This approach is an alternative to the built-in OAuth flows in the ArcGIS Maps SDK for JavaScript, which may not be supported on older systems (10.9).

## High-Level Flow

1. **Server‑Side:**
   - A Next.js API route (e.g., `/api/arcgis/token`) imports a utility function `getArcGISToken` that:
     1. Exchanges client credentials for an **access token** from `/sharing/rest/oauth2/token`.
     2. Converts that access token into an **ArcGIS token** via `/sharing/rest/generateToken`.
   - This final **ArcGIS token** is returned to the caller as JSON.

2. **Client‑Side:**
   - A React component requests the token from the API route.  
   - The token is then registered via `IdentityManager.registerToken(...)` (or by using request interceptors) so that ArcGIS requests include it automatically.  
   - Once the token is registered, your app initializes an ArcGIS map (e.g. a `MapView`), loads secure FeatureLayers, etc.

## File Structure (Example)

```
src/
  ├── app/
  │   ├── api/
  │   │   └── arcgis/
  │   │       └── token/
  │   │           └── route.ts    <-- Next.js API route for token generation
  │   └── page.tsx               <-- Main page
  ├── components/
  │   └── MapViewComponent.tsx   <-- Example ArcGIS map integration
  └── lib/
      └── arcgisToken.ts         <-- Utility for two-step token exchange
```

## Environment Variables

You typically store secrets in `.env.local`, for example:

```
CLIENT_ID="YourRegisteredAppId"
CLIENT_SECRET="YourAppSecret"
```

Then reference them in server-side code: 10.130.209.17
```ts
const clientId = process.env.ARC_CLIENT_ID;
const clientSecret = process.env.ARC_CLIENT_SECRET;
```

## Security Tips

- **Never expose your client secret in front-end code.**  

## Further Reading

- [ArcGIS REST API: Working with Tokens](https://developers.arcgis.com/rest/users-groups-and-items/working-with-tokens.htm)  
- [Next.js Docs: API Routes](https://nextjs.org/docs/api-routes/introduction)  
- [ArcGIS Maps SDK for JavaScript: IdentityManager](https://developers.arcgis.com/javascript/latest/api-reference/esri-identity-IdentityManager.html)
