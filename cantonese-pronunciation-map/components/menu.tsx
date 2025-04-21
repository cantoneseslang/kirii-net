"use client"

import type React from "react"

import { useState } from "react"
import styled from "styled-components"
import { Menu, Search, X, BookOpen, RefreshCw } from "lucide-react"
import SearchBar from "./search-bar"

interface MenuProps {
  onSearch: (query: string) => void
  onQuizMode: () => void
  searchQuery: string
  isFiltered: boolean
}

const AppMenu: React.FC<MenuProps> = ({ onSearch, onQuizMode, searchQuery, isFiltered }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    if (showSearch) setShowSearch(false)
  }

  const toggleSearch = () => {
    setShowSearch(!showSearch)
  }

  const handleSearch = (query: string) => {
    onSearch(query)
    setShowSearch(false)
  }

  const handleQuizMode = () => {
    onQuizMode()
    setIsOpen(false)
  }

  const handleReset = () => {
    onSearch("")
    setIsOpen(false)
  }

  return (
    <>
      <MenuContainer>
        <MenuButton onClick={toggleMenu}>{isOpen ? <X size={24} /> : <Menu size={24} />}</MenuButton>

        {!isOpen && !showSearch && (
          <SearchButton onClick={toggleSearch}>
            <Search size={20} />
          </SearchButton>
        )}

        {!isOpen && !showSearch && isFiltered && (
          <ResetButton onClick={handleReset}>
            <RefreshCw size={20} />
          </ResetButton>
        )}
      </MenuContainer>

      {isOpen && (
        <MenuPanel>
          <MenuItem onClick={toggleSearch}>
            <Search size={20} />
            <span>検索</span>
          </MenuItem>
          {isFiltered && (
            <MenuItem onClick={handleReset}>
              <RefreshCw size={20} />
              <span>すべて表示</span>
            </MenuItem>
          )}
          <MenuItem onClick={handleQuizMode}>
            <BookOpen size={20} />
            <span>クイズモード</span>
          </MenuItem>
        </MenuPanel>
      )}

      {showSearch && (
        <SearchPanel>
          <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
          <CloseButton onClick={toggleSearch}>
            <X size={20} />
          </CloseButton>
        </SearchPanel>
      )}
    </>
  )
}

const MenuContainer = styled.div`
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 100;
  display: flex;
  gap: 0.5rem;
`

const MenuButton = styled.button`
  background-color: rgba(47, 158, 154, 0.8);
  color: white;
  border: none;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgb(47, 158, 154);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }
`

const SearchButton = styled(MenuButton)`
  background-color: rgba(255, 255, 255, 0.2);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`

const ResetButton = styled(MenuButton)`
  background-color: rgba(255, 193, 7, 0.6);
  
  &:hover {
    background-color: rgba(255, 193, 7, 0.8);
  }
`

const MenuPanel = styled.div`
  position: fixed;
  top: 5rem;
  left: 1rem;
  background-color: rgba(29, 56, 68, 0.9);
  border-radius: 0.5rem;
  padding: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 100;
  animation: slideIn 0.3s ease forwards;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: white;
  padding: 0.75rem 1rem;
  width: 100%;
  text-align: left;
  border-radius: 0.3rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  span {
    font-size: 1rem;
  }
`

const SearchPanel = styled.div`
  position: fixed;
  top: 1rem;
  left: 4.5rem;
  right: 1rem;
  display: flex;
  align-items: center;
  z-index: 100;
  animation: fadeIn 0.3s ease forwards;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

const CloseButton = styled.button`
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 0.5rem;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`

export default AppMenu
