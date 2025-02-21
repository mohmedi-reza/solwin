import React from 'react';

interface AddressShortProps {
  address: string;
  length?: number;
}

const AddressShort: React.FC<AddressShortProps> = ({ address, length = 4 }) => {
  if (!address) return null;
  return (
    <span>
      {address.slice(0, length)}...{address.slice(-length)}
    </span>
  );
};

export default AddressShort; 