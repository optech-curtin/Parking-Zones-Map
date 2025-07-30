"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { ToolProvider } from '../context/ToolContext';
import { ParkingProvider } from '../context/ParkingContext';
import LoadingScreen from '../components/LoadingScreen';

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
  const [authProgress, setAuthProgress] = useState<{
    phase: 'initializing' | 'authenticating' | 'loading-map';
    progress: number;
    message: string;
  }>({
    phase: 'initializing',
    progress: 0,
    message: 'Initializing application...'
  });

  // Next.js will expose NEXT_PUBLIC_… vars to the browser
  const portalUrl = process.env.NEXT_PUBLIC_ARCGIS_PORTAL_URL || "";
  const appId = process.env.NEXT_PUBLIC_ARCGIS_APP_ID || "";

  useEffect(() => {
    async function initArcGISAuth() {
      if (!portalUrl || !appId) {
        setLoading(false);
        return;
      }

      setAuthProgress({
        phase: 'authenticating',
        progress: 10,
        message: 'Setting up authentication...'
      });

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

      setAuthProgress({
        phase: 'authenticating',
        progress: 30,
        message: 'Configuring OAuth...'
      });

      // 1. Create and register our OAuthInfo
      const oauthInfo = new OAuthInfo({
        appId: appId,
        portalUrl: portalUrl,
        flowType: "auto"
      });
      IdentityManager.registerOAuthInfos([oauthInfo]);

      setAuthProgress({
        phase: 'authenticating',
        progress: 60,
        message: 'Checking authentication status...'
      });

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
        // Not signed in yet - automatically trigger sign in
        IdentityManager.getCredential(`${portalUrl}/sharing`);
      } finally {
        setAuthProgress({
          phase: 'authenticating',
          progress: 100,
          message: 'Authentication complete'
        });
        setLoading(false);
      }
    }

    initArcGISAuth();
  }, [portalUrl, appId, setUserInfo]);

  // Sign out (destroy stored credentials)
  const handleSignOut = useCallback(async () => {
    const { default: IdentityManager } = await import("@arcgis/core/identity/IdentityManager");
    IdentityManager.destroyCredentials();
    setIsAuthenticated(false);
    setUserInfo(null);
  }, [setUserInfo]);

  // Show loading screen for authentication
  if (loading) {
    return <LoadingScreen progress={authProgress} />;
  }

  // Only show the app content when authenticated
  if (!isAuthenticated) {
    return null; // Return null while redirecting to ArcGIS sign-in
  }

  // Signed in: show header + our WebMap with combined loading
  return (
    <ToolProvider>
      <ParkingProvider>
        <div className="min-h-screen flex flex-col relative">
          <div className="flex-1">
            <MapViewComponent authProgress={authProgress} />
          </div>
          <button
            onClick={handleSignOut}
            className="fixed bottom-6 right-6 px-4 py-2 text-sm bg-[var(--accent-red)] text-white rounded-full shadow-[var(--shadow)] hover:bg-red-700 transition-colors z-50"
            title="Sign Out"
          >
            Sign Out
          </button>
        </div>
      </ParkingProvider>
    </ToolProvider>
  );
}
