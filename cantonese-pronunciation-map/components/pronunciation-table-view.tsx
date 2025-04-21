"use client"

import { useState } from "react"
import styled from "styled-components"
import { getTableHeaders } from "@/data/pronunciationTable"
import { pronunciationTable } from "@/data/pronunciationTable"

const PronunciationTableView = () => {
  const [activeTab, setActiveTab] = useState<number>(0)
  const headers = getTableHeaders()

  // 表示する行数を制限（タブで切り替え）
  const rowsPerTab = 10
  const totalTabs = Math.ceil(headers.finals.length / rowsPerTab)

  const startRow = activeTab * rowsPerTab
  const endRow = Math.min(startRow + rowsPerTab, headers.finals.length)
  const currentFinals = headers.finals.slice(startRow, endRow)

  return (
    <TableContainer>
      <h2>広東語発音表</h2>

      <TabContainer>
        {Array.from({ length: totalTabs }).map((_, index) => (
          <TabButton key={index} $active={activeTab === index} onClick={() => setActiveTab(index)}>
            {index * rowsPerTab + 1}-{Math.min((index + 1) * rowsPerTab, headers.finals.length)}
          </TabButton>
        ))}
      </TabContainer>

      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <th className="corner">母音＼子音</th>
              {headers.initialConsonants.map((consonant) => (
                <th key={consonant}>{consonant}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentFinals.map((final) => (
              <tr key={final}>
                <th>{final}</th>
                {headers.initialConsonants.map((consonant) => {
                  const cell = pronunciationTable.cells[final]?.[consonant]
                  return (
                    <td
                      key={`${final}-${consonant}`}
                      style={{ backgroundColor: cell?.color || "transparent" }}
                      className={cell ? "has-data" : ""}
                    >
                      {cell && (
                        <>
                          <div className="jyutping">{cell.jyutping}</div>
                          {cell.kanji && <div className="kanji">{cell.kanji}</div>}
                          {cell.katakana && <div className="katakana">{cell.katakana}</div>}
                        </>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrapper>

      <TableLegend>
        <div className="legend-item" style={{ backgroundColor: "#e8f5e9" }}>
          b, p, m, f
        </div>
        <div className="legend-item" style={{ backgroundColor: "#f8e0e0" }}>
          d, t, n, l
        </div>
        <div className="legend-item" style={{ backgroundColor: "#fff8e1" }}>
          g, k, h
        </div>
        <div className="legend-item" style={{ backgroundColor: "#e3f2fd" }}>
          z, c, s
        </div>
        <div className="legend-item" style={{ backgroundColor: "#e0f7fa" }}>
          j, w
        </div>
      </TableLegend>
    </TableContainer>
  )
}

const TableContainer = styled.div`
  margin: 2rem 0;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  
  h2 {
    text-align: center;
    margin-bottom: 1rem;
    color: white;
  }
`

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  background-color: ${(props) => (props.$active ? "rgb(47, 158, 154)" : "rgba(255, 255, 255, 0.1)")};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${(props) => (props.$active ? "rgb(47, 158, 154)" : "rgba(255, 255, 255, 0.2)")};
  }
`

const TableWrapper = styled.div`
  overflow-x: auto;
  margin-bottom: 1rem;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: #333;
  
  th, td {
    padding: 0.5rem;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 0.8rem;
  }
  
  th {
    background-color: rgba(0, 0, 0, 0.3);
    color: white;
  }
  
  th.corner {
    background-color: rgba(0, 0, 0, 0.3);
  }
  
  tbody th {
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 9;
  }
  
  td {
    min-width: 120px;
    height: 80px;
    vertical-align: middle;
  }
  
  td.has-data {
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
      z-index: 5;
    }
  }
  
  .jyutping {
    font-weight: bold;
    margin-bottom: 0.2rem;
  }
  
  .kanji {
    font-size: 1.2rem;
    margin-bottom: 0.2rem;
  }
  
  .katakana {
    font-size: 0.8rem;
    opacity: 0.8;
  }
`

const TableLegend = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  
  .legend-item {
    padding: 0.3rem 0.8rem;
    border-radius: 4px;
    color: #333;
    font-size: 0.9rem;
  }
`

export default PronunciationTableView
