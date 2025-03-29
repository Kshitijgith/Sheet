'use client';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function Home() {
  const [data, setData] = useState([]);
  const [newRow, setNewRow] = useState([]);
  const [newCol, setNewCol] = useState('');
  const [ws, setWs] = useState(null);
  const [sheetUrl, setSheetUrl] = useState('');  // State for sheet URL

  useEffect(() => {
    async function fetchData() {
      if (!sheetUrl) return;  // Only fetch if the sheet URL is provided
      try {
        const res = await axios.post('http://192.168.29.14:3001/api/getdata', { sheetUrl });
        setData(res.data.data);
      } catch (err) {
        console.log(err.response);
      }
    }
    fetchData();

    const socket = new WebSocket('ws://http://192.168.29.14:3001');

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const updatedData = JSON.parse(event.data);
      console.log('Received updated data:', updatedData);
      setData(updatedData.data);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [sheetUrl]);  // Re-fetch data when sheetUrl changes

  const addRow = () => {
    if (newRow.length === 0) return;
    const maxCols = data[0]?.length || 0;
    const filledRow = [...newRow, ...Array(maxCols - newRow.length).fill('')];
    setData([...data, filledRow]);
    setNewRow([]);
  };

  const addColumn = () => {
    if (!newCol.trim()) return;
    const updatedData = data.map((row, index) =>
      index === 0 ? [...row, newCol] : [...row, '']
    );
    setData(updatedData);
    setNewCol('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-blue-600 mb-6">📊 Google Sheet Data</h1>

      {/* Input field for Sheet URL */}
      <div className="mb-6 w-full max-w-4xl">
        <h2 className="text-lg font-semibold mb-2 text-black">📜 Enter Sheet URL</h2>
        <input
          type="text"
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
          placeholder="Enter sheet URL"
          className="border border-gray-300 text-black rounded-md p-2 w-3/4"
        />
      </div>

      {data.length > 0 ? (
        <div className="w-full max-w-4xl overflow-x-auto shadow-lg rounded-lg">
          <table className="w-full text-sm text-left border border-gray-200">
            <thead className="bg-blue-500 text-white">
              <tr>
                {data[0]?.map((col, index) => (
                  <th key={index} className="border p-3 font-semibold text-center text-black">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(1).map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`${rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}
                >
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="border p-3 text-center text-black text-2xl">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-lg mt-4">No data available.</p>
      )}

      {/* Add New Row Section */}
      <div className="mt-8 w-full max-w-4xl">
        <h2 className="text-lg font-semibold mb-2 text-black">➕ Add New Row</h2>
        <input
          type="text"
          value={newRow.join(',')}
          onChange={(e) => setNewRow(e.target.value.split(','))}
          placeholder="Comma-separated values"
          className="border border-gray-300 text-black rounded-md p-2 w-3/4"
        />
        <button
          onClick={addRow}
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
        >
          Add Row
        </button>
      </div>

      {/* Add New Column Section */}
      <div className="mt-6 w-full max-w-4xl">
        <h2 className="text-lg font-semibold mb-2">➕ Add New Column</h2>
        <input
          type="text"
          value={newCol}
          onChange={(e) => setNewCol(e.target.value)}
          placeholder="Column Name"
          className="border border-gray-300 text-black rounded-md p-2 w-3/4"
        />
        <button
          onClick={addColumn}
          className="ml-3 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
        >
          Add Column
        </button>
      </div>
    </div>
  );
}
