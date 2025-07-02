# ArcGIS Parking Planning Web Application

This project demonstrates a modern Next.js web application that integrates with ArcGIS Enterprise to provide parking planning functionality. The application allows users to view and manage parking lots, track bay types, and monitor parking availability.

## Key Features

1. **Parking Planning Features**
   - Interactive map view of all parking lots
   - Collapsible side menu for parking planning
   - Real-time bay type tracking and counting
   - Ability to open/close parking lots with visual indicators (red outline and fill for closed carparks)
   - Right-click functionality for quick parking lot status changes
   - **Zoom-based interaction**: Click parking lots when zoomed out, click individual bays when zoomed in (zoom level 19+)
   - Comprehensive bay type summary showing:
     - Total counts for each bay type across all carparks
     - Closed bay counts in red brackets
     - Overall totals for all bays and closed bays
   - Dynamic side menu with sliding animations
   - Parking lot controls that slide out from the planning menu
   - Visual zoom indicator showing when bay interaction is available

2. **Next.js + TypeScript**  
   - Built with Next.js and TypeScript for type safety and modern development practices
   - React components for interactive UI elements
   - Efficient state management and real-time updates
   - Responsive design with proper spacing and layout

3. **ArcGIS Integration**
   - Direct integration with ArcGIS Enterprise services
   - Real-time data fetching and updates
   - Interactive map visualization
   - Feature layer integration for parking data
   - Automatic updates of visual indicators based on parking lot status

## High-Level Flow

1. **Application Initialization:**
   - The application loads and initializes the ArcGIS map view
   - Parking-related FeatureLayers are loaded and displayed
   - The side menu is initialized with current parking data
   - Total bay counts are calculated for all parking lots

2. **User Interaction:**
   - Users can interact with parking lots through the map or side menu
   - Parking lot status can be toggled via right-click or buttons
   - Bay type information is updated in real-time
   - Visual indicators (red outline and fill) show closed parking lots
   - The side menu can be collapsed/expanded with smooth animations
   - Parking lot controls slide out from the planning menu when expanded

## File Structure

```
src/
  ├── app/
  │   └── page.tsx               <-- Main page
  ├── components/
  │   ├── MapView.tsx           <-- Main ArcGIS map integration
  │   ├── SideMenu.tsx          <-- Parking planning controls
  │   ├── ParkingInfoTable.tsx  <-- Selected parking lot details
  │   └── PopupModal.tsx        <-- Bay count editing modal
  └── lib/
      └── arcgisConfig.ts       <-- ArcGIS configuration and setup
```

## Data Sources

The application integrates with several ArcGIS Feature Services:
- Parking Lots Layer: `ParKam/ParKam/FeatureServer/4`
- Regular Bays Layer: `Hosted/Park_Aid_Bays/FeatureServer/0`
- Under Bays Layer: `Hosted/Park_Aid_Bays_Under/FeatureServer/0`

## Security Considerations

- All sensitive operations are handled server-side
- Proper authentication and authorization are implemented
- Secure communication with ArcGIS services

## Further Reading

- [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/latest/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
