import React, { useState } from 'react';

interface PopupModalProps {
  initialBayCount: number;
  onSubmit: (newBayCount: number) => void;
  onClose: () => void;
}

const PopupModal: React.FC<PopupModalProps> = ({ initialBayCount, onSubmit, onClose }) => {
  const [bayCount, setBayCount] = useState<number>(initialBayCount);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(bayCount);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h2 className="text-xl font-bold mb-4">Edit Bay Count</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="bayCount" className="block text-sm font-medium text-gray-700">
              New Bay Count
            </label>
            <input
              id="bayCount"
              type="number"
              value={bayCount}
              onChange={(e) => setBayCount(parseInt(e.target.value, 10))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopupModal;
