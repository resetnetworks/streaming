import { FaMoneyBillWave, FaEdit, FaTrash } from 'react-icons/fa';

const AdminDataTable = ({ 
  title, 
  columns, 
  data, 
  addButton, 
  loading, 
  error, 
  onEdit, 
  onDelete,
  onViewPayments 
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {addButton}
      </div>

      {loading ? (
        <div className="text-gray-300 text-center py-6">Loading...</div>
      ) : error ? (
        <div className="text-red-400 text-center py-6">{error}</div>
      ) : data.length === 0 ? (
        <div className="text-gray-400 text-center py-6">No data available</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-700/50">
                  {columns.slice(0, -1).map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                    >
                      {row[col.toLowerCase()] || ''}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center space-x-3">
                      {onEdit && (
                        <button
                          className="text-blue-500 hover:text-blue-400 flex items-center"
                          onClick={() => onEdit(row.artistObj || row)}
                          title="Edit"
                        >
                          <FaEdit className="mr-1" />
                          <span className="hidden md:inline">Edit</span>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className="text-red-500 hover:text-red-400 flex items-center"
                          onClick={() => onDelete(row)}
                          title="Delete"
                        >
                          <FaTrash className="mr-1" />
                          <span className="hidden md:inline">Delete</span>
                        </button>
                      )}
                      {onViewPayments && (
                        <button
                          className="text-green-500 hover:text-green-400 flex items-center"
                          onClick={() => onViewPayments(row._id)}
                          title="View Payments"
                        >
                          <FaMoneyBillWave className="mr-1" />
                          <span className="hidden md:inline">Payments</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDataTable;