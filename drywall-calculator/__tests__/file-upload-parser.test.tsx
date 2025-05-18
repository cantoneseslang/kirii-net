import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUploadParser, { ExtractedValues } from '@/components/file-upload-parser';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      refresh: jest.fn()
    };
  }
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock the default values that should be extracted from the file upload
const mockExtractedValues: ExtractedValues = {
  projectName: '葛量洪醫院',
  projectDetail: 'C 75x45x0.8t/4100H/406o.c.',
  calculationDate: '2025-05-16',
  author: 'TC',
  yieldStrength: 200,
  elasticModulus: 205000,
  materialFactor: 1.2,
  studType: 'C75x45x0.8t',
  webHeight: 75,
  flangeWidth: 45,
  thickness: 0.8,
  bearingLength: 32,
  momentOfInertia: 125552,
  effectiveSectionModulus: 2712,
  span: 4100,
  tributaryWidth: 406,
  designLoad: 0.75,
  loadHeight: 1.1,
  loadFactor: 1.6
};

// Mock the file upload process
global.URL.createObjectURL = jest.fn(() => 'https://example.com');

describe('FileUploadParser Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders file upload component with English text', () => {
    render(<FileUploadParser lang="en" />);
    
    expect(screen.getByText('Click to select a file')).toBeInTheDocument();
  });

  test('renders file upload component with Japanese text', () => {
    render(<FileUploadParser lang="ja" />);
    
    expect(screen.getByText('ファイルを選択')).toBeInTheDocument();
  });

  test('renders file upload component with Chinese text', () => {
    render(<FileUploadParser lang="zh-HK" />);
    
    expect(screen.getByText('點擊選擇文件')).toBeInTheDocument();
  });

  test('handles PDF file upload and extracts values successfully', async () => {
    // APIレスポンスをモック
    const mockFileId = 'test-file-id';
    const mockApiResponse = {
      answer: `Job: 葛量洪醫院
      Subject: C 75x45x0.8t/4100H/406o.c.
      Date: 2025-05-16
      Prep: TC
      降伏強度: 200 MPa
      弾性係数: 205000 MPa
      材料係数: 1.2
      スタッド種類: C75x45x0.8t
      ウェブ高さ: 75 mm
      フランジ幅: 45 mm
      厚さ: 0.8 mm
      支持長さ: 32 mm
      有効慣性モーメント: 125552 mm⁴
      有効断面係数: 2712 mm³
      スパン: 4100 mm
      スタッド間隔: 406 mm
      設計荷重: 0.75 kN/m
      荷重高さ: 1100 mm
      荷重係数: 1.6`
    };
    
    // fetchのモックを設定
    global.fetch = jest.fn().mockImplementation((url) => {
      console.log("Mock fetch called with URL:", url);
      
      // ファイルアップロードのAPIエンドポイント
      if (url === '/api/dify/upload') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: mockFileId })
        });
      }
      
      // テキスト抽出のAPIエンドポイント
      if (url === '/api/dify/extract') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponse)
        });
      }
      
      // 他のAPIリクエスト
      return Promise.resolve({
        ok: false,
        statusText: "Not Found",
        json: () => Promise.resolve({ error: "API endpoint not found" })
      });
    });
    
    render(<FileUploadParser lang="en" />);
    
    // Create a mock PDF file
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    
    // Get the file input and simulate file selection
    const fileInput = screen.getByLabelText('Click to select a file');
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Wait for the processing to complete
    await waitFor(() => {
      expect(screen.getByText('Data extracted successfully!')).toBeInTheDocument();
    }, { timeout: 2000 }); // Increase timeout to allow for PDF processing
    
    // Check if localStorage was called with JSON data
    expect(localStorage.setItem).toHaveBeenCalled();
    // The first argument should be 'extractedValues'
    expect(localStorage.setItem).toHaveBeenCalledWith('extractedValues', expect.any(String));
    
    // Parse the stored values to verify content
    const storedValuesStr = localStorage.setItem.mock.calls[0][1];
    const storedValues = JSON.parse(storedValuesStr);
    expect(storedValues).toHaveProperty('projectName');
  });

  test('shows error message when file processing fails', async () => {
    // Mock implementation to simulate an error
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.reject(new Error('Mock error'));
    });
    
    render(<FileUploadParser lang="en" />);
    
    // Create a mock file
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    
    // Get the file input and simulate file selection
    const fileInput = screen.getByLabelText('Click to select a file');
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/An error occurred/)).toBeInTheDocument();
    });
    
    // Check that localStorage was not called to store values
    expect(localStorage.setItem).not.toHaveBeenCalledWith('extractedValues', expect.any(String));
  });

  test('does nothing when no file is selected', async () => {
    render(<FileUploadParser lang="en" />);
    
    // Get the file input and simulate file selection with no files
    const fileInput = screen.getByLabelText('Click to select a file');
    fireEvent.change(fileInput, { target: { files: [] } });
    
    // Check that localStorage was not called
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
