import React from 'react';

interface ParkingInfoTableProps {
  parkingLot: string;
  bayTypes: {
    type: string;
    count: number;
  }[];
}

const ParkingInfoTable: React.FC<ParkingInfoTableProps> = ({ parkingLot, bayTypes }) => {
  const total = bayTypes.reduce((sum, { count }) => sum + count, 0);

  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10">
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
    </div>
  );
};

export default ParkingInfoTable; 