"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import styled from "styled-components"

interface SearchBarProps {
  onSearch: (query: string) => void
  initialQuery?: string
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialQuery = "" }) => {
  const [query, setQuery] = useState(initialQuery)

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleClear = () => {
    setQuery("")
    onSearch("")
  }

  return (
    <SearchContainer onSubmit={handleSubmit}>
      <SearchInput
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="漢字、粤拼、カタカナで検索..."
        aria-label="検索"
        autoFocus
      />
      {query && (
        <ClearButton type="button" onClick={handleClear} aria-label="検索をクリア">
          <X size={16} />
        </ClearButton>
      )}
      <SearchButton type="submit" aria-label="検索する">
        <Search size={20} />
      </SearchButton>
    </SearchContainer>
  )
}

const SearchContainer = styled.form`
  display: flex;
  width: 100%;
  position: relative;
  border-radius: 50px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &:focus-within {
    box-shadow: 0 4px 20px rgba(0, 255, 255, 0.25);
    transform: translateY(-2px);
  }
`

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  outline: none;
  backdrop-filter: blur(10px);

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`

const ClearButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  padding: 0 0.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
  position: absolute;
  right: 3.5rem;
  top: 50%;
  transform: translateY(-50%);

  &:hover {
    color: white;
  }
`

const SearchButton = styled.button`
  background: rgba(47, 158, 154, 0.8);
  border: none;
  padding: 0 1.5rem;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: rgb(47, 158, 154);
  }
`

export default SearchBar
