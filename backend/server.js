import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

// Önce varsayılan .env dosyasını yükle
dotenv.config();

// Ardından özel dosyaları kontrol et
const envFiles = [
  '.env.local',
  '.env'
];

for (const file of envFiles) {
  try {
    dotenv.config({ path: file, override: true });
    console.log(`Loaded environment variables from ${file}`);
  } catch (error) {
    console.warn(`Failed to load ${file}:`, error.message);
  }
}

// Disable SSL certificate validation for development
// NOT: Bu ayar sadece geliştirme ortamında kullanılmalıdır, production'da kaldırılmalıdır
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.warn('WARNING: SSL certificate validation is disabled for development');
}

// Debug: Log API key presence and format
console.log('DeepSeek API Key Status:', {
  present: !!process.env.DEEPSEEK_API_KEY,
  length: process.env.DEEPSEEK_API_KEY?.length,
  prefix: process.env.DEEPSEEK_API_KEY?.substring(0, 5) + '...',
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running properly!' });
});

// Keyword Analysis Route
app.use('/api/keywords', keywordRoutes);

// Content Optimization Route

// Import workflow services
import { optimizePattern } from '../src/services/workflow/optimizePattern.js';
import { generatePDF } from '../src/services/workflow/generatePDF.js';
import { generateEtsyListing } from '../src/services/workflow/generateEtsyListing.js';
import { callGeminiApi } from '../src/services/google-image/callGeminiApi.js';

// Import keyword analysis routes
import { keywordRoutes } from './src/features/keywordAnalysis/index.js';

// DeepSeek API'ye istek yapacak proxy fonksiyonu
async function proxyToDeepSeekAPI(req, res, requestId) {
  try {
    const apiUrl = process.env.DEEPSEEK_API_URL;
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiUrl || !apiKey) {
      throw new Error('DeepSeek API configuration is missing');
    }
    
    // Gelen isteği olduğu gibi DeepSeek API'ye ilet
    const axios = (await import('axios')).default;
    
    // API URL'sini hazırla
    const endpoint = apiUrl.includes('/chat/completions') ? apiUrl : `${apiUrl}/chat/completions`;
    console.log(`[${requestId}] Proxying request to DeepSeek API: ${endpoint}`);
    
    // Frontend'den gelen verileri kullan
    const data = req.body;
    
    // API isteği için gerekli header'ları hazırla
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip,deflate,compress',
      'User-Agent': 'Zippify-Backend/1.0',
    };
    
    // API isteğini yap
    const response = await axios.post(endpoint, data, { headers });
    
    // Yanıtı frontend'e ilet
    return res.json(response.data);
  } catch (error) {
    console.error(`[${requestId}] DeepSeek API Error:`, error.message);
    return res.status(500).json({
      error: `Failed to proxy request to DeepSeek API: ${error.message}`,
      requestId
    });
  }
}

app.post('/api/optimize', async (req, res) => {
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}`;
  console.log(`[${requestId}] Received optimize request`);
  
  try {
    console.log(`[${requestId}] Request body:`, req.body);
    const { content } = req.body;
    
    if (!content) {
      console.log(`[${requestId}] Content is missing from request`);
      return res.status(400).json({ 
        error: 'Content is required',
        requestId
      });
    }

    // Validate content length
    if (content.length < 10) {
      console.log(`[${requestId}] Content too short: ${content.length} chars`);
      return res.status(400).json({
        error: 'Content is too short. Please provide a complete pattern.',
        requestId
      });
    }

    console.log(`[${requestId}] Calling optimizePattern with content length: ${content.length} chars`);
    const result = await optimizePattern(content).catch(err => {
      console.error(`[${requestId}] Error in optimizePattern:`, err);
      return { success: false, error: err.message };
    });
    
    console.log(`[${requestId}] optimizePattern result:`, {
      success: result.success,
      hasOptimizedPattern: !!result.optimizedPattern,
      optimizedPatternLength: result.optimizedPattern?.length,
      error: result.error
    });
    
    if (result.success) {
      res.json({
        optimizedContent: result.optimizedPattern, // rename burada yapıldı
        requestId
      });
    } else {
      res.status(400).json({
        error: result.error || 'Unknown error during pattern optimization',
        requestId
      });
    }
  } catch (error) {
    console.error(`[${requestId}] Pattern Optimization Error:`, error);
    res.status(500).json({
      error: `Failed to optimize pattern: ${error.message}`,
      requestId
    });
  }
});

// **DATABASE CONNECTION**
const DB_PATH = './db/zippify.db';
const SCHEMA_PATH = './db/schema.sql';

const initializeDb = async () => {
    return open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });
};

// **AUTHENTICATION ROUTES**

// **Register User**
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const db = await initializeDb();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Insert into users table
        const userResult = await db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
            [username, email, hashedPassword]);
        
        // Get the inserted user's ID
        const userId = userResult.lastID;
        
        // Create empty profile for the user
        await db.run('INSERT INTO profiles (user_id, first_name, last_name, store_name) VALUES (?, ?, ?, ?)',
            [userId, '', '', '']);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// **Login User**
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const db = await initializeDb();
    try {
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Set a default JWT secret if not provided in env
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-here';

        const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '1h' });

        res.json({ token, id: user.id, email: user.email, username: user.username });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// **Server Start**
// DeepSeek API Proxy Route
app.post('/api/deepseek', async (req, res) => {
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}`;
  console.log(`[${requestId}] Received DeepSeek API proxy request`);
  
  try {
    await proxyToDeepSeekAPI(req, res, requestId);
  } catch (error) {
    console.error(`[${requestId}] DeepSeek API Proxy Error:`, error);
    res.status(500).json({
      error: `Failed to proxy request to DeepSeek API: ${error.message}`,
      requestId
    });
  }
});

// Initialize the SQLite database with schema before starting the server
async function initializeDatabaseWithSchema() {
    try {
        console.log('Initializing SQLite database...');
        
        // Create the database directory if it doesn't exist
        const dbDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dbDir)) {
            console.log(`Creating database directory: ${dbDir}`);
            fs.mkdirSync(dbDir, { recursive: true });
        }
        
        // Connect to the database (creates it if it doesn't exist)
        const db = await open({
            filename: DB_PATH,
            driver: sqlite3.Database
        });
        console.log(`Connected to SQLite database at: ${DB_PATH}`);
        
        // Read the schema SQL file
        if (fs.existsSync(SCHEMA_PATH)) {
            const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
            console.log('Read schema.sql file successfully');
            
            // Execute the schema SQL
            await db.exec(schemaSql);
            console.log('Database schema initialized successfully');
        } else {
            console.error(`Schema file not found at: ${SCHEMA_PATH}`);
        }
        
        // Close the database connection
        await db.close();
        return true;
    } catch (error) {
        console.error('Failed to initialize database:', error);
        return false;
    }
}

// Initialize database and then start the server
initializeDatabaseWithSchema()
    .then(success => {
        if (success) {
            app.listen(PORT, () => {
                console.log(`✅ Server running on http://localhost:${PORT}`);
            });
        } else {
            console.error('Server not started due to database initialization failure');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('Unexpected error during startup:', error);
        process.exit(1);
    });

app.post('/api/generate-pdf', async (req, res) => {
    const { content } = req.body;
    const requestId = req.headers['x-request-id'] || `req-${Date.now()}`;
  
    try {
      if (!content) {
        return res.status(400).json({ error: 'Content is required', requestId });
      }
  
      const result = await generatePDF({ optimizedPattern: content });
      if (result.success) {
        return res.json({ pdfContent: result.pdfContent, pdfUrl: result.pdfUrl, requestId });
      } else {
        return res.status(400).json({ error: result.error || 'Failed to generate PDF', requestId });
      }
    } catch (error) {
      console.error(`[${requestId}] PDF Generation Error:`, error);
      res.status(500).json({ error: `Failed to generate PDF: ${error.message}`, requestId });
    }
  });

  app.post('/api/generate-etsy', async (req, res) => {
    const { content } = req.body;
    const requestId = req.headers['x-request-id'] || `req-${Date.now()}`;
  
    try {
      if (!content) {
        return res.status(400).json({ error: 'Content is required', requestId });
      }
  
      const result = await generateEtsyListing({ pdfContent: content });
      if (result.success) {
        return res.json({ ...result, requestId });
      } else {
        return res.status(400).json({ error: result.error || 'Failed to generate Etsy listing', requestId });
      }
    } catch (error) {
      console.error(`[${requestId}] Etsy Listing Generation Error:`, error);
      res.status(500).json({ error: `Failed to generate Etsy listing: ${error.message}`, requestId });
    }
  });

  // Image Editing Route - Gemini API implementation
  app.post('/api/edit-image', async (req, res) => {
    const requestId = req.headers['x-request-id'] || `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const startTime = Date.now();
    
    // Log initial request details
    const imageSize = req.body.image ? Math.round(req.body.image.length / 1024) : 0;
    console.log(`[${requestId}] Received image edit request - Size: ${imageSize}KB, Time: ${new Date().toISOString()}`);
    
    try {
      const { image, prompt } = req.body;
      
      // Validate request fields
      if (!image) {
        console.log(`[${requestId}] Validation failed: Image is missing from request`);
        return res.status(400).json({
          success: false,
          message: 'Image is required',
          requestId
        });
      }
      
      if (!prompt) {
        console.log(`[${requestId}] Validation failed: Prompt is missing from request`);
        return res.status(400).json({
          success: false,
          message: 'Prompt is required',
          requestId
        });
      }
      
      console.log(`[${requestId}] Validation successful - Prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);
      
      // Extract image metadata for logging
      let mimeType = 'unknown';
      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([^;]+);base64,/);
        if (matches && matches.length > 1) {
          mimeType = matches[1];
        }
      }
      console.log(`[${requestId}] Processing image - Type: ${mimeType}, Size: ${imageSize}KB`);
      
      // Call the Gemini API with the image and prompt
      console.log(`[${requestId}] Calling Gemini API with prompt: "${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}"`);
      const apiCallStartTime = Date.now();
      
      try {
        const geminiResponse = await callGeminiApi(image, prompt);
        const apiCallDuration = Date.now() - apiCallStartTime;
        
        console.log(`[${requestId}] Gemini API call successful - Duration: ${apiCallDuration}ms`);
        console.log(`[${requestId}] Response contains image: ${!!geminiResponse.image}, text: ${!!geminiResponse.responseText}`);
        
        const totalDuration = Date.now() - startTime;
        console.log(`[${requestId}] Sending successful response to client - Total processing time: ${totalDuration}ms`);
        
        return res.json({
          success: true,
          message: "Image edit successful using Gemini API.",
          originalPrompt: prompt,
          result: geminiResponse,
          requestId,
          processingTime: totalDuration
        });
      } catch (apiError) {
        // Specific logging for Gemini API errors
        const apiErrorStatus = apiError.message.includes('status') ? apiError.message.match(/status (\d+)/)?.[1] || 'unknown' : 'unknown';
        console.error(`[${requestId}] Gemini API Error - Status: ${apiErrorStatus}`);
        console.error(`[${requestId}] Gemini API Error Details:`, apiError.message);
        
        throw apiError; // Re-throw to be caught by the outer catch block
      }
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      console.error(`[${requestId}] Image Edit Error - Duration: ${totalDuration}ms`);
      console.error(`[${requestId}] Error Type: ${error.name}, Message: ${error.message}`);
      
      res.status(500).json({
        success: false,
        message: `Failed to edit image: ${error.message}`,
        requestId,
        processingTime: totalDuration
      });
    }
  });