import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

/**
 * Interface to represent the count details for a parking lot.
 */
export interface ParkingLotCount {
  parkingLot: string;
  total: number;
  bayCounts: {
    [bayType: string]: number;
  };
}

/**
 * Queries the feature layer to count how many features exist per parking lot
 * and then aggregates the counts by bay type.
 *
 * Example output for parking lot "PL1":
 * {
 *   parkingLot: "PL1",
 *   total: 10,
 *   bayCounts: {
 *     ACROD: 2,
 *     Green: 8
 *   }
 * }
 *
 * @param layer - The FeatureLayer containing the carpark features.
 * @returns A promise that resolves with an array of ParkingLotCount objects.
 */
export async function getParkingLotCounts(
  layer: FeatureLayer
): Promise<ParkingLotCount[]> {
  try {
    // Create a query to fetch all features with the fields we need.
    const query = layer.createQuery();
    query.where = '1=1';
    query.outFields = ['parkinglot', 'baytype'];
    query.returnGeometry = false;

    // Execute the query.
    const results = await layer.queryFeatures(query);
    const counts: { [key: string]: ParkingLotCount } = {};

    // Iterate through each feature.
    results.features.forEach((feature) => {
      const attributes = feature.attributes;
      const parkingLot: string = attributes.parkinglot;
      const bayType: string = attributes.baytype;

      // If a parking lot attribute is missing, skip this feature.
      if (!parkingLot) return;

      // Initialize the parking lot entry if not already present.
      if (!counts[parkingLot]) {
        counts[parkingLot] = {
          parkingLot,
          total: 0,
          bayCounts: {},
        };
      }

      // Increment the total count for this parking lot.
      counts[parkingLot].total += 1;

      // Increment the count for this bay type.
      if (!counts[parkingLot].bayCounts[bayType]) {
        counts[parkingLot].bayCounts[bayType] = 0;
      }
      counts[parkingLot].bayCounts[bayType] += 1;
    });

    // Convert the counts object into an array for easier consumption.
    return Object.values(counts);
  } catch (error) {
    console.error('Error retrieving parking lot counts:', error);
    throw error;
  }
}
