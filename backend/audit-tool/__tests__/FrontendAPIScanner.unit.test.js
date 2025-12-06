/**
 * Unit Tests for FrontendAPIScanner
 * 
 * Tests API call detection, base URL configuration extraction, and duplicate prefix detection.
 * Requirements: 2.2, 2.3, 2.5
 */

const FrontendAPIScanner = require('../scanners/FrontendAPIScanner');
const { createAPICallInfo } = require('../models/APICallInfo');
const fs = require('fs');
const path = require('path');

// Mock fs module
jest.mock('fs');

describe('FrontendAPIScanner', () => {
  let scanner;
  let mockConfig;

  beforeEach(() => {
    mockConfig = {
      frontend: {
        srcPath: './frontend/src',
        apiConfigPath: './frontend/src/utils/api.js'
      }
    };
    scanner = new FrontendAPIScanner(mockConfig);
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('scanAPICalls - API call detection in various file formats', () => {
    it('should detect api.get calls', () => {
      const fileContent = `
        import api from './utils/api';
        
        function getClients() {
          return api.get('/clients');
        }
      `;

      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['Clients.jsx']);
      fs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      fs.readFileSync.mockReturnValue(fileContent);

      const apiCalls = scanner.scanAPICalls();

      expect(apiCalls).toHaveLength(1);
      expect(apiCalls[0].method).toBe('get');
      expect(apiCalls[0].path).toBe('/clients');
      expect(apiCalls[0].hasBaseURL).toBe(true);
    });

    it('should detect api.post calls', () => {
      const fileContent = `
        import api from './utils/api';
        
        function createClient(data) {
          return api.post('/clients', data);
        }
      `;

      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['Clients.jsx']);
      fs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      fs.readFileSync.mockReturnValue(fileContent);

      const apiCalls = scanner.scanAPICalls();

      expect(apiCalls).toHaveLength(1);
      expect(apiCalls[0].method).toBe('post');
      expect(apiCalls[0].path).toBe('/clients');
    });

    it('should detect api.put and api.delete calls', () => {
      const fileContent = `
        import api from './utils/api';
        
        function updateClient(id, data) {
          return api.put(\`/clients/\${id}\`, data);
        }
        
        function deleteClient(id) {
          return api.delete(\`/clients/\${id}\`);
        }
      `;

      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['Clients.jsx']);
      fs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      fs.readFileSync.mockReturnValue(fileContent);

      const apiCalls = scanner.scanAPICalls();

      expect(apiCalls).toHaveLength(2);
      expect(apiCalls[0].method).toBe('put');
      expect(apiCalls[0].path).toBe('/clients/:id');
      expect(apiCalls[1].method).toBe('delete');
      expect(apiCalls[1].path).toBe('/clients/:id');
    });

    it('should detect axios calls', () => {
      const fileContent = `
        import axios from 'axios';
        
        function getClients() {
          return axios.get('http://localhost:5000/api/clients');
        }
      `;

      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['Clients.jsx']);
      fs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      fs.readFileSync.mockReturnValue(fileContent);

      const apiCalls = scanner.scanAPICalls();

      expect(apiCalls).toHaveLength(1);
      expect(apiCalls[0].method).toBe('get');
      expect(apiCalls[0].path).toBe('http://localhost:5000/api/clients');
      expect(apiCalls[0].hasBaseURL).toBe(false);
    });

    it('should detect fetch calls', () => {
      const fileContent = `
        function getClients() {
          return fetch('/api/clients');
        }
        
        function createClient(data) {
          return fetch('/api/clients', {
            method: 'POST',
            body: JSON.stringify(data)
          });
        }
      `;

      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['Clients.jsx']);
      fs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      fs.readFileSync.mockReturnValue(fileContent);

      const apiCalls = scanner.scanAPICalls();

      expect(apiCalls).toHaveLength(2);
      expect(apiCalls[0].method).toBe('get');
      expect(apiCalls[0].path).toBe('/api/clients');
      expect(apiCalls[1].method).toBe('post');
      expect(apiCalls[1].path).toBe('/api/clients');
    });

    it('should handle template literals with parameters', () => {
      const fileContent = `
        import api from './utils/api';
        
        function getClient(clientId) {
          return api.get(\`/clients/\${clientId}\`);
        }
      `;

      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['Clients.jsx']);
      fs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      fs.readFileSync.mockReturnValue(fileContent);

      const apiCalls = scanner.scanAPICalls();

      expect(apiCalls).toHaveLength(1);
      expect(apiCalls[0].path).toBe('/clients/:clientId');
    });

    it('should handle multiple API calls in one file', () => {
      const fileContent = `
        import api from './utils/api';
        
        function getClients() {
          return api.get('/clients');
        }
        
        function getProjects() {
          return api.get('/projects');
        }
        
        function getTasks() {
          return api.get('/tasks');
        }
      `;

      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['Dashboard.jsx']);
      fs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      fs.readFileSync.mockReturnValue(fileContent);

      const apiCalls = scanner.scanAPICalls();

      expect(apiCalls).toHaveLength(3);
      expect(apiCalls[0].path).toBe('/clients');
      expect(apiCalls[1].path).toBe('/projects');
      expect(apiCalls[2].path).toBe('/tasks');
    });

    it('should skip non-JavaScript files', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['styles.css', 'image.png', 'Clients.jsx']);
      fs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      fs.readFileSync.mockReturnValue('import api from "./utils/api"; api.get("/clients");');

      const apiCalls = scanner.scanAPICalls();

      // Should only scan Clients.jsx
      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    });

    it('should handle files with parse errors gracefully', () => {
      const invalidContent = 'this is not valid javascript {{{';

      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['Invalid.jsx']);
      fs.statSync.mockReturnValue({ isDirectory: () => false, isFile: () => true });
      fs.readFileSync.mockReturnValue(invalidContent);

      const apiCalls = scanner.scanAPICalls();

      // Should not throw, just skip the file
      expect(apiCalls).toHaveLength(0);
    });

    it('should handle non-existent directory', () => {
      fs.existsSync.mockReturnValue(false);

      const apiCalls = scanner.scanAPICalls();

      expect(apiCalls).toHaveLength(0);
    });
  });

  describe('getAPIConfig - Base URL configuration extraction', () => {
    it('should extract baseURL from axios.create', () => {
      const apiConfigContent = `
        import axios from 'axios';
        
        const api = axios.create({
          baseURL: 'http://localhost:5000/api'
        });
        
        export default api;
      `;

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(apiConfigContent);

      const config = scanner.getAPIConfig();

      expect(config.baseURL).toBe('http://localhost:5000/api');
    });

    it('should extract baseURL with environment variable fallback', () => {
      const apiConfigContent = `
        import axios from 'axios';
        
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        const api = axios.create({
          baseURL: API_URL
        });
        
        export default api;
      `;

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(apiConfigContent);

      const config = scanner.getAPIConfig();

      expect(config.envVars).toContain('VITE_API_URL');
    });

    it('should detect request interceptors', () => {
      const apiConfigContent = `
        import axios from 'axios';
        
        const api = axios.create({
          baseURL: 'http://localhost:5000/api'
        });
        
        api.interceptors.request.use(config => {
          return config;
        });
        
        export default api;
      `;

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(apiConfigContent);

      const config = scanner.getAPIConfig();

      expect(config.interceptors.request).toHaveLength(1);
    });

    it('should detect response interceptors', () => {
      const apiConfigContent = `
        import axios from 'axios';
        
        const api = axios.create({
          baseURL: 'http://localhost:5000/api'
        });
        
        api.interceptors.response.use(
          response => response,
          error => Promise.reject(error)
        );
        
        export default api;
      `;

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(apiConfigContent);

      const config = scanner.getAPIConfig();

      expect(config.interceptors.response).toHaveLength(1);
    });

    it('should extract multiple environment variables', () => {
      const apiConfigContent = `
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const API_KEY = import.meta.env.VITE_API_KEY;
        const DEBUG = process.env.NODE_ENV === 'development';
      `;

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(apiConfigContent);

      const config = scanner.getAPIConfig();

      expect(config.envVars).toContain('VITE_API_URL');
      expect(config.envVars).toContain('VITE_API_KEY');
      expect(config.envVars).toContain('NODE_ENV');
    });

    it('should handle missing API config file', () => {
      fs.existsSync.mockReturnValue(false);

      const config = scanner.getAPIConfig();

      expect(config.baseURL).toBeNull();
      expect(config.envVars).toHaveLength(0);
    });
  });

  describe('detectDuplicatePrefixes - Duplicate prefix detection', () => {
    it('should detect /api/api pattern in path', () => {
      const calls = [
        createAPICallInfo({
          file: 'Clients.jsx',
          line: 10,
          method: 'get',
          path: '/api/api/clients',
          component: 'Clients',
          hasBaseURL: false,
          fullPath: '/api/api/clients'
        })
      ];

      const issues = scanner.detectDuplicatePrefixes(calls);

      expect(issues).toHaveLength(1);
      expect(issues[0].issue).toContain('Duplicate /api prefix');
      expect(issues[0].severity).toBe('HIGH');
      expect(issues[0].suggestedFix).toBe('/api/clients');
    });

    it('should detect path starting with /api when using base URL', () => {
      const calls = [
        createAPICallInfo({
          file: 'Clients.jsx',
          line: 10,
          method: 'get',
          path: '/api/clients',
          component: 'Clients',
          hasBaseURL: true,
          fullPath: '/api/api/clients'
        })
      ];

      const issues = scanner.detectDuplicatePrefixes(calls);

      // Both checks will trigger: /api/api in fullPath AND /api in path with baseURL
      expect(issues).toHaveLength(2);
      expect(issues.some(i => i.issue.includes('Duplicate /api prefix'))).toBe(true);
      expect(issues.some(i => i.issue.includes('Path starts with /api but base URL already includes /api'))).toBe(true);
    });

    it('should not flag correct paths', () => {
      const calls = [
        createAPICallInfo({
          file: 'Clients.jsx',
          line: 10,
          method: 'get',
          path: '/clients',
          component: 'Clients',
          hasBaseURL: true,
          fullPath: '/api/clients'
        }),
        createAPICallInfo({
          file: 'Projects.jsx',
          line: 15,
          method: 'get',
          path: '/api/projects',
          component: 'Projects',
          hasBaseURL: false,
          fullPath: '/api/projects'
        })
      ];

      const issues = scanner.detectDuplicatePrefixes(calls);

      expect(issues).toHaveLength(0);
    });

    it('should detect multiple duplicate prefix issues', () => {
      const calls = [
        createAPICallInfo({
          file: 'Clients.jsx',
          line: 10,
          method: 'get',
          path: '/api/api/clients',
          component: 'Clients',
          hasBaseURL: false,
          fullPath: '/api/api/clients'
        }),
        createAPICallInfo({
          file: 'Projects.jsx',
          line: 15,
          method: 'get',
          path: '/api/projects',
          component: 'Projects',
          hasBaseURL: true,
          fullPath: '/api/api/projects'
        })
      ];

      const issues = scanner.detectDuplicatePrefixes(calls);

      // First call: 1 issue (/api/api in path)
      // Second call: 2 issues (/api/api in fullPath AND /api in path with baseURL)
      expect(issues).toHaveLength(3);
    });

    it('should handle empty call list', () => {
      const issues = scanner.detectDuplicatePrefixes([]);

      expect(issues).toHaveLength(0);
    });
  });

  describe('Helper methods', () => {
    it('should identify JavaScript files', () => {
      expect(scanner._isJavaScriptFile('Component.js')).toBe(true);
      expect(scanner._isJavaScriptFile('Component.jsx')).toBe(true);
      expect(scanner._isJavaScriptFile('Component.ts')).toBe(true);
      expect(scanner._isJavaScriptFile('Component.tsx')).toBe(true);
      expect(scanner._isJavaScriptFile('styles.css')).toBe(false);
      expect(scanner._isJavaScriptFile('image.png')).toBe(false);
    });

    it('should extract component name from file path', () => {
      const name = scanner._extractComponentName('/path/to/Clients.jsx');
      expect(name).toBe('Clients');
    });

    it('should compute full path with base URL', () => {
      expect(scanner._computeFullPath('/clients', true)).toBe('/api/clients');
      expect(scanner._computeFullPath('/api/clients', true)).toBe('/api/clients');
      expect(scanner._computeFullPath('clients', true)).toBe('/api/clients');
      expect(scanner._computeFullPath('/clients', false)).toBe('/clients');
    });
  });
});
