import React from 'react';

interface ParkingInfoTableProps {
  parkingLot: string;
  bayTypes: {
    type: string;
    count: number;
  }[];
}

const ParkingInfoTable: React.FC<ParkingInfoTableProps> = ({ parkingLot, bayTypes }) => {
  const [isMinimized, setIsMinimized] = React.useState(false);
  const total = bayTypes.reduce((sum, { count }) => sum + count, 0);

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg z-10 w-64">
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
        isMinimized ? 'max-h-0 rounded-b-lg' : 'max-h-[80vh]'
      } overflow-hidden bg-white rounded-b-lg`}>
        <div className="p-4">
          {parkingLot ? (
            <>
              <h2 className="text-xl font-bold mb-1">{parkingLot}</h2>
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left text-base py-2 px-4">Bay Type</th>
                    <th className="text-right text-base py-2 px-4">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {bayTypes.map(({ type, count }) => (
                    <tr key={type} className="border-b">
                      <td className="py-2 px-4 text-sm">{type}</td>
                      <td className="text-right text-sm py-2 px-4">{count}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 font-semibold">
                    <td className="py-2 px-4 text-sm">Total</td>
                    <td className="text-right text-sm py-2 px-4">{total}</td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No parking lot selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkingInfoTable; 