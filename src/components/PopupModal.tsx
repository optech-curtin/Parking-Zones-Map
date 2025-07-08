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
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow)] rounded-lg p-6 w-80 transition-all duration-300">
        <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Edit Bay Count</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="bayCount" className="block text-sm font-medium text-[var(--text-primary)]">
              New Bay Count
            </label>
            <input
              id="bayCount"
              type="number"
              value={bayCount}
              onChange={(e) => setBayCount(parseInt(e.target.value, 10))}
              className="mt-1 block w-full rounded-md border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] shadow-sm focus:border-[var(--accent-blue)] focus:ring-[var(--accent-blue)]"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[var(--text-muted)] text-white rounded-md hover:bg-[var(--text-secondary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--accent-blue)] text-white rounded-md hover:bg-blue-700 transition-colors"
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
