import { useState } from 'react';
import { FaCompactDisc, FaTrash } from 'react-icons/fa';
import { MdDateRange } from 'react-icons/md';
import { RiPriceTag3Fill } from 'react-icons/ri';

const AdminAlbumCard = ({ album, onDelete, onUpdate }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-700">
      {/* Cover Image */}
      <div className="h-48 bg-gray-700 relative">
        {album.coverImage ? (
          <img 
            src={album.coverImage} 
            alt={album.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <FaCompactDisc className="text-4xl" />
          </div>
        )}
      </div>

      {/* Album Details */}
      <div className="p-4">
        <div className="flex items-center mb-3">
          <div className="bg-blue-900 p-2 rounded-full mr-3">
            <FaCompactDisc className="text-blue-400 text-lg" />
          </div>
          <h3 className="text-lg font-semibold flex-1">
            {album.title}
          </h3>
        </div>

        <div className="mb-3">
          <p className="text-gray-400 text-sm">
            {`${album.description.slice(0,120)}..` || 'No description available'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div className="flex items-center text-gray-300">
            <MdDateRange className="mr-2" />
            <span>
              {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString() : 'No date'}
            </span>
          </div>

          <div className="flex items-center text-gray-300">
            <RiPriceTag3Fill className="mr-2" />
            <span>₹{album.price?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        <div className="text-gray-300 mb-4">
          <span>{album.accessType}</span>
        </div>

<div className='flex justify-between'><p>{album.artist?.name}</p>
        <div className="flex justify-end space-x-2">
          <button 
            onClick={() => onUpdate(album)}
            className="text-blue-500 hover:text-blue-400 px-3 py-1 rounded flex items-center"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(album._id)}
            className="text-red-800 hover:text-red-400 px-3 py-1 rounded flex items-center"
          >
            <FaTrash className="mr-1" /> Delete
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAlbumCard;
