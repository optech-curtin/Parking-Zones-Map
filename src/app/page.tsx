"use client";

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { ToolProvider } from '../context/ToolContext';

// Dynamically import MapView with SSR disabled
const MapViewComponent = dynamic(() => import('../components/MapView'), {
  ssr: false,
});

// We only import ArcGIS types here—no runtime imports at the top level
import type OAuthInfoType from "@arcgis/core/identity/OAuthInfo";
import type IdentityManagerType from "@arcgis/core/identity/IdentityManager";
import type PortalType from "@arcgis/core/portal/Portal";

interface UserInfo {
  fullName: string;
  username: string;
}

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Next.js will expose NEXT_PUBLIC_… vars to the browser
  const portalUrl = process.env.NEXT_PUBLIC_ARCGIS_PORTAL_URL || "";
  const appId = process.env.NEXT_PUBLIC_ARCGIS_APP_ID || "";

  useEffect(() => {
    async function initArcGISAuth() {
      if (!portalUrl || !appId) {
        console.error("Missing NEXT_PUBLIC_ARCGIS_PORTAL_URL or NEXT_PUBLIC_ARCGIS_APP_ID");
        setLoading(false);
        return;
      }

      // Dynamically import identity modules
      const [{ default: OAuthInfo }, { default: IdentityManager }, { default: Portal }] = await Promise.all([
        import("@arcgis/core/identity/OAuthInfo"),
        import("@arcgis/core/identity/IdentityManager"),
        import("@arcgis/core/portal/Portal")
      ]) as [
        { default: typeof OAuthInfoType },
        { default: typeof IdentityManagerType },
        { default: typeof PortalType }
      ];

      // 1. Create and register our OAuthInfo
      const oauthInfo = new OAuthInfo({
        appId: appId,
        portalUrl: portalUrl,
        flowType: "auto"
      });
      IdentityManager.registerOAuthInfos([oauthInfo]);

      // 2. Check if already signed in
      try {
        await IdentityManager.checkSignInStatus(`${portalUrl}/sharing`);
        // If we get here, there is a valid credential in browser storage
        const portal = new Portal({
          authMode: "immediate",
          url: portalUrl
        });
        await portal.load();

        if (portal.user) {
          const userInfo: UserInfo = {
            fullName: portal.user.fullName ?? "Unknown User",
            username: portal.user.username ?? "unknown"
          };
          setUserInfo(userInfo);
          setIsAuthenticated(true);
        }
      } catch {
        // Not signed in yet
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    initArcGISAuth();
  }, [portalUrl, appId, setUserInfo]);

  // Trigger OAuth redirect
  const handleSignIn = async () => {
    if (!portalUrl) return;
    const { default: IdentityManager } = await import("@arcgis/core/identity/IdentityManager");
    IdentityManager.getCredential(`${portalUrl}/sharing`);
  };

  // Sign out (destroy stored credentials)
  const handleSignOut = async () => {
    const { default: IdentityManager } = await import("@arcgis/core/identity/IdentityManager");
    IdentityManager.destroyCredentials();
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold">Loading...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold mb-4">Sign In to ArcGIS Enterprise</h2>
        <button
          onClick={handleSignIn}
          className="px-6 py-3 text-lg bg-[#0079c1] text-white rounded hover:bg-[#0069a9] transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Signed in: show header + our WebMap
  return (
    <ToolProvider>
      <div className="min-h-screen flex flex-col relative">
        <div className="flex-1">
          <MapViewComponent />
        </div>
        <button
          onClick={handleSignOut}
          className="fixed bottom-6 right-6 px-4 py-2 text-sm bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors z-50"
          title="Sign Out"
        >
          Sign Out
        </button>
      </div>
    </ToolProvider>
  );
}
