import React from 'react';

interface ParkingInfoTableProps {
  selectedParkingLot: string;
  bayTypes: { type: string; count: number }[];
  isLoading: boolean;
}

export default function ParkingInfoTable({
  selectedParkingLot,
  bayTypes,
  isLoading,
}: ParkingInfoTableProps) {
  const [isMinimized, setIsMinimized] = React.useState(false);

  return (
    <div className="fixed right-0 top-0 z-20">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-4 mr-4 w-64">
        <div className="flex items-center justify-between p-2 bg-gray-100 h-12 rounded-t-lg">
          <div className="flex items-center">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <svg
                className={`w-5 h-5 transform transition-transform duration-200 ${
                  isMinimized ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            <h2 className="text-sm font-medium ml-2">Parking Lot Information</h2>
          </div>
        </div>
        <div className={`transition-all duration-300 ease-in-out ${
          isMinimized ? 'max-h-0' : 'max-h-[80vh]'
        }`}>
          <div className="p-4 overflow-y-auto max-h-[calc(80vh-3rem)]">
            {selectedParkingLot ? (
              <>
                <h3 className="text-lg font-semibold mb-4">{selectedParkingLot}</h3>
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bayTypes.map(({ type, count }) => (
                      <div key={type} className="flex justify-between">
                        <span>{type}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total Bays</span>
                        <span>{bayTypes.reduce((sum, { count }) => sum + count, 0)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No parking lot selected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 