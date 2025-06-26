const AdminDataTable = ({ title, columns, data, addButton, loading, error, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {addButton}
      </div>

      {loading ? (
        <div className="text-gray-300 text-center py-6">NoLoading</div>
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
                <tr key={rowIndex}>
                  {columns.slice(0, -1).map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                    >
                      {row[col.toLowerCase()] || ''}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <button
                      className="text-blue-500 hover:text-blue-400 mr-3"
                      onClick={() => onEdit?.(row.artistObj || row)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500 hover:text-red-400"
                      onClick={() => onDelete?.(row)}
                    >
                      Delete
                    </button>
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
