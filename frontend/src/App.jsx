import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaRedo, FaDownload, FaBook } from 'react-icons/fa';
import { GiNotebook } from 'react-icons/gi';
import { pdf, Font, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

const cellsPerPage = 100;
const columns = 5;
const maxPages = 5;

// Register Gujarati Font
Font.register({
  family: 'GujaratiFont',
  src: '/fonts/Farsan-Regular.ttf'
});

// PDF Styles
const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingHorizontal: 15,
    fontFamily: 'GujaratiFont'
  },
  header: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    top: 10,
    right: 15
  },
  gridContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderLeftWidth: 1,
    borderLeftColor: '#969696'
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#c8c8c8'
  },
  cell: {
    width: '20%',
    paddingVertical: 8,
    borderRightWidth: 0.5,
    borderRightColor: '#c8c8c8',
    textAlign: 'center',
    fontSize: 12
  }
});

// PDF Document Component
const MantraPDF = ({ pages }) => (
  <Document>
    {pages.map((page, pageIndex) => (
      <Page key={pageIndex} size="A4" style={styles.page}>
        <Text style={styles.header}>જય સ્વામિનારાયણ</Text>
        <Text style={styles.pageNumber}>Page {pageIndex + 1}</Text>

        <View style={styles.gridContainer}>
          {Array.from({ length: 20 }).map((_, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {Array.from({ length: 5 }).map((_, colIndex) => {
                const cellIndex = rowIndex * 5 + colIndex;
                return (
                  <View key={colIndex} style={styles.cell}>
                    <Text>{page[cellIndex] || ' '}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </Page>
    ))}
  </Document>
);

export default function MantraLekhan() {
  const initializePages = () => {
    const saved = localStorage.getItem('mantraPages');
    try {
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(p => Array.isArray(p) && p.length === cellsPerPage)) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing saved data:', e);
    }
    return [Array(cellsPerPage).fill('')];
  };

  const [pages, setPages] = useState(initializePages);

  useEffect(() => {
    localStorage.setItem('mantraPages', JSON.stringify(pages));
  }, [pages]);

  const handleChange = (pageIndex, cellIndex, value) => {
    const newPages = [...pages];
    newPages[pageIndex][cellIndex] = value;
    setPages(newPages);
  };

  const handleKeyDown = (e, pageIndex, cellIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextIndex = (cellIndex + 1) % cellsPerPage;
      const nextPageIndex = pageIndex + Math.floor((cellIndex + 1) / cellsPerPage);
      const nextInput = document.querySelector(`#cell-${nextPageIndex}-${nextIndex}`);
      if (nextInput) nextInput.focus();
    }
  };

  const addPage = () => {
    if (pages.length >= maxPages) {
      alert('Maximum 5 pages allowed.');
      return;
    }
    const newPage = Array(cellsPerPage).fill('');
    setPages(prevPages => [...prevPages, newPage]);
  };

  const removePage = (index) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete Page ${index + 1}?`);
    if (!confirmDelete) return;
    const newPages = [...pages];
    newPages.splice(index, 1);
    setPages(newPages.length ? newPages : [Array(cellsPerPage).fill('')]);
  };

  const resetAll = () => {
    const confirmReset = window.confirm('Are you sure you want to reset all pages? This will clear all data.');
    if (!confirmReset) return;
    setPages([Array(cellsPerPage).fill('')]);
  };

  const downloadPDF = async () => {
    const blob = await pdf(<MantraPDF pages={pages} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mantralekhan.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="sticky top-0 z-10 bg-orange-600 shadow-md py-3 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={addPage}
            className="flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded hover:bg-orange-50 transition-colors"
          >
            <FaPlus /> Add Page
          </button>
          <button
            onClick={resetAll}
            className="flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded hover:bg-orange-50 transition-colors"
          >
            <FaRedo /> Reset All
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded hover:bg-orange-50 transition-colors"
          >
            <FaDownload /> Download PDF
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-center gap-3 mb-6 pt-4">
          <GiNotebook className="text-4xl text-orange-600" />
          <h1 className="text-3xl font-bold text-center text-orange-700">
            Jay Swaminarayan 🙏
          </h1>
          <GiNotebook className="text-4xl text-orange-600" />
        </div>

        {pages.map((page, pageIndex) => (
          <div key={pageIndex} className="mb-8 border-2 border-orange-200 p-4 bg-white rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FaBook className="text-orange-500" /> Page {pageIndex + 1}
              </h2>
              <button
                onClick={() => removePage(pageIndex)}
                className="flex items-center gap-1 text-red-600 hover:text-red-800 px-3 py-1 rounded bg-red-50"
              >
                <FaTrash size={14} /> Remove
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {page.map((cell, cellIndex) => (
                <input
                  key={cellIndex}
                  id={`cell-${pageIndex}-${cellIndex}`}
                  type="text"
                  value={cell}
                  onChange={(e) => handleChange(pageIndex, cellIndex, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, pageIndex, cellIndex)}
                  className="border border-orange-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-full bg-yellow-50"
                  placeholder="Swaminarayan"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}