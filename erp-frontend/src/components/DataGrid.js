import React from 'react';

const DataGrid = ({ columns, data, actions }) => {
    return (
        <div className="data-grid-container">
            <table className="data-grid">
                <thead>
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx}>{col.header}</th>
                        ))}
                        {actions && <th style={{ textAlign: 'center' }}>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex}>
                                        {col.render ? col.render(row) : row[col.field]}
                                    </td>
                                ))}
                                {actions && (
                                    <td style={{ textAlign: 'center' }}>
                                        {actions(row)}
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length + (actions ? 1 : 0)} style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DataGrid;
