import dynamic from 'next/dynamic';

// Lazy load heavy components
export const LazySideMenu = dynamic(() => import('./SideMenu'), {
  loading: () => (
    <div className="fixed left-[50px] top-0 z-30 bg-[var(--menu-body-bg)] border border-[var(--card-border)] shadow-[var(--shadow)] rounded-lg mt-4 ml-4 w-80 h-32 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-blue)]"></div>
    </div>
  ),
  ssr: false,
});

export const LazySearchMenu = dynamic(() => import('./SearchMenu'), {
  loading: () => (
    <div className="fixed top-4 right-4 z-40 bg-[var(--menu-body-bg)] border border-[var(--card-border)] shadow-[var(--shadow)] rounded-lg p-4 w-64 h-16 flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent-blue)]"></div>
    </div>
  ),
  ssr: false,
});

export const LazyParkingInfoTable = dynamic(() => import('./ParkingInfoTable'), {
  loading: () => (
    <div className="fixed bottom-4 right-4 z-40 bg-[var(--menu-body-bg)] border border-[var(--card-border)] shadow-[var(--shadow)] rounded-lg p-4 w-80 h-20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent-blue)]"></div>
    </div>
  ),
  ssr: false,
});

export const LazyToolPanel = dynamic(() => import('./ToolPanel'), {
  loading: () => (
    <div className="fixed top-4 left-4 z-40 bg-[var(--menu-body-bg)] border border-[var(--card-border)] shadow-[var(--shadow)] rounded-lg p-4 w-48 h-16 flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent-blue)]"></div>
    </div>
  ),
  ssr: false,
}); 