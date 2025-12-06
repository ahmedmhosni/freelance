/**
 * Frontend API Scanner
 * 
 * Scans the frontend codebase to discover all API calls.
 * Uses AST parsing to find axios/fetch calls and extract metadata.
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { createAPICallInfo } = require('../models/APICallInfo');
const logger = require('../utils/logger');

class FrontendAPIScanner {
  constructor(config) {
    this.config = config;
    this.srcPath = config.frontend.srcPath;
    this.apiConfigPath = config.frontend.apiConfigPath;
  }

  /**
   * Scans frontend codebase for API calls
   * @param {string} srcPath - Path to frontend src directory (optional, uses config if not provided)
   * @returns {Array<APICallInfo>} List of API calls
   */
  scanAPICalls(srcPath = null) {
    const scanPath = srcPath || this.srcPath;
    logger.info(`Scanning API calls from ${scanPath}`);
    const apiCalls = [];

    try {
      this._scanDirectory(scanPath, apiCalls);
      logger.info(`Discovered ${apiCalls.length} API calls from frontend`);
      return apiCalls;
    } catch (error) {
      logger.error('Error scanning API calls from frontend', error);
      throw error;
    }
  }

  /**
   * Recursively scans directory for JavaScript/JSX files
   * @private
   */
  _scanDirectory(dirPath, apiCalls) {
    if (!fs.existsSync(dirPath)) {
      logger.warn(`Directory does not exist: ${dirPath}`);
      return;
    }

    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        // Skip node_modules and other non-source directories
        if (!['node_modules', 'dist', 'build', '.git'].includes(item)) {
          this._scanDirectory(itemPath, apiCalls);
        }
      } else if (stat.isFile() && this._isJavaScriptFile(item)) {
        this._scanFile(itemPath, apiCalls);
      }
    });
  }

  /**
   * Checks if file is a JavaScript/JSX file
   * @private
   */
  _isJavaScriptFile(filename) {
    return /\.(js|jsx|ts|tsx)$/.test(filename);
  }

  /**
   * Scans a single file for API calls
   * @private
   */
  _scanFile(filePath, apiCalls) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const componentName = this._extractComponentName(filePath);
      
      // Parse the file into an AST
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });

      // Traverse the AST to find API calls
      traverse(ast, {
        CallExpression: (path) => {
          const apiCall = this._extractAPICall(path, filePath, componentName);
          if (apiCall) {
            apiCalls.push(apiCall);
          }
        }
      });
    } catch (error) {
      logger.warn(`Could not parse file ${filePath}:`, error.message);
    }
  }

  /**
   * Extracts component name from file path
   * @private
   */
  _extractComponentName(filePath) {
    const basename = path.basename(filePath, path.extname(filePath));
    return basename;
  }

  /**
   * Extracts API call information from AST node
   * @private
   */
  _extractAPICall(path, filePath, componentName) {
    const node = path.node;
    
    // Check if this is an api.get/post/put/delete/patch call
    if (
      node.callee.type === 'MemberExpression' &&
      node.callee.object.name === 'api' &&
      node.callee.property.type === 'Identifier'
    ) {
      const method = node.callee.property.name;
      
      // Check if method is a valid HTTP method
      if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
        const apiPath = this._extractPath(node.arguments[0]);
        
        if (apiPath) {
          const line = node.loc ? node.loc.start.line : 0;
          const hasBaseURL = true; // Using api.js means base URL is configured
          
          return createAPICallInfo({
            file: filePath,
            line: line,
            method: method,
            path: apiPath,
            component: componentName,
            hasBaseURL: hasBaseURL,
            fullPath: this._computeFullPath(apiPath, hasBaseURL)
          });
        }
      }
    }
    
    // Check for direct axios calls (axios.get, axios.post, etc.)
    if (
      node.callee.type === 'MemberExpression' &&
      node.callee.object.name === 'axios' &&
      node.callee.property.type === 'Identifier'
    ) {
      const method = node.callee.property.name;
      
      if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
        const apiPath = this._extractPath(node.arguments[0]);
        
        if (apiPath) {
          const line = node.loc ? node.loc.start.line : 0;
          const hasBaseURL = false; // Direct axios calls may not use base URL
          
          return createAPICallInfo({
            file: filePath,
            line: line,
            method: method,
            path: apiPath,
            component: componentName,
            hasBaseURL: hasBaseURL,
            fullPath: apiPath
          });
        }
      }
    }
    
    // Check for fetch calls
    if (
      node.callee.type === 'Identifier' &&
      node.callee.name === 'fetch' &&
      node.arguments.length > 0
    ) {
      const apiPath = this._extractPath(node.arguments[0]);
      
      if (apiPath) {
        const line = node.loc ? node.loc.start.line : 0;
        const method = this._extractFetchMethod(node.arguments[1]);
        const hasBaseURL = false; // Fetch calls typically use full URLs
        
        return createAPICallInfo({
          file: filePath,
          line: line,
          method: method,
          path: apiPath,
          component: componentName,
          hasBaseURL: hasBaseURL,
          fullPath: apiPath
        });
      }
    }
    
    return null;
  }

  /**
   * Extracts path from AST node (handles string literals and template literals)
   * @private
   */
  _extractPath(node) {
    if (!node) {
      return null;
    }
    
    // String literal: '/clients'
    if (node.type === 'StringLiteral') {
      return node.value;
    }
    
    // Template literal: `/clients/${id}`
    if (node.type === 'TemplateLiteral') {
      return this._reconstructTemplateLiteral(node);
    }
    
    // Binary expression: '/clients/' + id
    if (node.type === 'BinaryExpression' && node.operator === '+') {
      const left = this._extractPath(node.left);
      const right = this._extractPath(node.right);
      
      if (left && right) {
        return left + right;
      } else if (left) {
        return left + ':param';
      } else if (right) {
        return ':param' + right;
      }
    }
    
    // For other expressions, return a placeholder
    return null;
  }

  /**
   * Reconstructs template literal as a path with parameter placeholders
   * @private
   */
  _reconstructTemplateLiteral(node) {
    let path = '';
    
    // Interleave quasis (string parts) and expressions (variables)
    for (let i = 0; i < node.quasis.length; i++) {
      path += node.quasis[i].value.raw;
      
      // Add placeholder for expression if not the last quasi
      if (i < node.expressions.length) {
        // Try to extract variable name
        const expr = node.expressions[i];
        if (expr.type === 'Identifier') {
          const varName = expr.name;
          
          // Special handling for API URL variables
          // These typically resolve to the base API URL (e.g., /api or http://localhost:5000/api)
          // We'll treat them as /api for matching purposes
          if (varName === 'apiUrl' || varName === 'API_URL' || varName === 'baseURL') {
            path += '/api';
          } else {
            // For other variables, use parameter placeholder
            path += `:${varName}`;
          }
        } else {
          path += ':param';
        }
      }
    }
    
    return path;
  }

  /**
   * Extracts HTTP method from fetch options
   * @private
   */
  _extractFetchMethod(optionsNode) {
    if (!optionsNode || optionsNode.type !== 'ObjectExpression') {
      return 'get'; // Default to GET
    }
    
    // Look for method property in options object
    const methodProp = optionsNode.properties.find(
      prop => prop.key && prop.key.name === 'method'
    );
    
    if (methodProp && methodProp.value.type === 'StringLiteral') {
      return methodProp.value.value.toLowerCase();
    }
    
    return 'get';
  }

  /**
   * Computes full path including base URL
   * @private
   */
  _computeFullPath(apiPath, hasBaseURL) {
    if (!hasBaseURL) {
      return apiPath;
    }
    
    // If using base URL from api.js, paths are relative to /api
    // So /clients becomes /api/clients
    if (apiPath.startsWith('/api')) {
      return apiPath;
    } else if (apiPath.startsWith('/')) {
      return `/api${apiPath}`;
    } else {
      return `/api/${apiPath}`;
    }
  }

  /**
   * Extracts API base URL configuration
   * @returns {Object} API configuration details
   */
  getAPIConfig() {
    logger.info('Extracting API configuration');
    
    const config = {
      baseURL: null,
      envVars: [],
      interceptors: {
        request: [],
        response: []
      }
    };

    try {
      if (!fs.existsSync(this.apiConfigPath)) {
        logger.warn(`API config file does not exist: ${this.apiConfigPath}`);
        return config;
      }

      const content = fs.readFileSync(this.apiConfigPath, 'utf-8');
      
      // Parse the file
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });

      // Traverse to find configuration
      traverse(ast, {
        VariableDeclarator: (path) => {
          const node = path.node;
          
          // Look for API_URL or baseURL configuration
          if (node.id.name === 'API_URL' || node.id.name === 'baseURL') {
            config.baseURL = this._extractConfigValue(node.init);
          }
        },
        CallExpression: (path) => {
          const node = path.node;
          
          // Look for axios.create
          if (
            node.callee.type === 'MemberExpression' &&
            node.callee.object.name === 'axios' &&
            node.callee.property.name === 'create'
          ) {
            // Extract baseURL from config object
            if (node.arguments[0] && node.arguments[0].type === 'ObjectExpression') {
              const baseURLProp = node.arguments[0].properties.find(
                prop => prop.key && prop.key.name === 'baseURL'
              );
              
              if (baseURLProp) {
                config.baseURL = this._extractConfigValue(baseURLProp.value);
              }
            }
          }
          
          // Look for interceptors
          if (
            node.callee.type === 'MemberExpression' &&
            node.callee.property.name === 'use'
          ) {
            const objectName = this._getObjectName(node.callee.object);
            
            if (objectName.includes('interceptors.request')) {
              config.interceptors.request.push('request interceptor');
            } else if (objectName.includes('interceptors.response')) {
              config.interceptors.response.push('response interceptor');
            }
          }
        }
      });

      // Extract environment variables
      config.envVars = this._extractEnvVars(content);

      logger.info(`API config extracted: baseURL=${config.baseURL}`);
      return config;
    } catch (error) {
      logger.error('Error extracting API config', error);
      return config;
    }
  }

  /**
   * Extracts configuration value from AST node
   * @private
   */
  _extractConfigValue(node) {
    if (!node) {
      return null;
    }
    
    if (node.type === 'StringLiteral') {
      return node.value;
    }
    
    if (node.type === 'LogicalExpression' && node.operator === '||') {
      // Handle: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const right = this._extractConfigValue(node.right);
      if (right) {
        return right; // Return the fallback value (string literal)
      }
      const left = this._extractConfigValue(node.left);
      return left;
    }
    
    if (node.type === 'MemberExpression') {
      // Handle: import.meta.env.VITE_API_URL
      // This is a variable reference, not a literal value
      return null;
    }
    
    return null;
  }

  /**
   * Gets full object name from member expression
   * @private
   */
  _getObjectName(node) {
    if (node.type === 'Identifier') {
      return node.name;
    }
    
    if (node.type === 'MemberExpression') {
      const object = this._getObjectName(node.object);
      const property = node.property.name || node.property.value;
      return `${object}.${property}`;
    }
    
    return '';
  }

  /**
   * Extracts environment variables from file content
   * @private
   */
  _extractEnvVars(content) {
    const envVars = [];
    const envVarRegex = /import\.meta\.env\.(\w+)|process\.env\.(\w+)/g;
    let match;
    
    while ((match = envVarRegex.exec(content)) !== null) {
      const varName = match[1] || match[2];
      if (varName && !envVars.includes(varName)) {
        envVars.push(varName);
      }
    }
    
    return envVars;
  }

  /**
   * Detects duplicate /api prefixes in API calls
   * @param {Array<APICallInfo>} calls - List of API calls
   * @returns {Array<Object>} List of duplicate prefix issues
   */
  detectDuplicatePrefixes(calls) {
    logger.info('Detecting duplicate API prefixes');
    const issues = [];

    calls.forEach(call => {
      // Check if path contains /api/api pattern
      if (call.path.includes('/api/api') || call.fullPath.includes('/api/api')) {
        issues.push({
          file: call.file,
          line: call.line,
          path: call.path,
          fullPath: call.fullPath,
          issue: 'Duplicate /api prefix detected',
          severity: 'HIGH',
          suggestedFix: call.path.replace('/api/api', '/api')
        });
      }
      
      // Check if using base URL but path already starts with /api
      if (call.hasBaseURL && call.path.startsWith('/api')) {
        issues.push({
          file: call.file,
          line: call.line,
          path: call.path,
          fullPath: call.fullPath,
          issue: 'Path starts with /api but base URL already includes /api',
          severity: 'MEDIUM',
          suggestedFix: call.path.replace(/^\/api/, '')
        });
      }
    });

    logger.info(`Found ${issues.length} duplicate prefix issues`);
    return issues;
  }
}

module.exports = FrontendAPIScanner;
