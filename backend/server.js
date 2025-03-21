import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

dotenv.config({ path: '/Users/jans./CascadeProjects/zippify/.env.production' });

// Debug: Log API key presence
console.log('DeepSeek API Key:', process.env.DEEPSEEK_API_KEY ? 'Present' : 'Missing');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running properly!' });
});

// Content Optimization Route
// Test DeepSeek API connection
const testDeepSeekAPI = async () => {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      })
    });

    const data = await response.json();
    console.log('DeepSeek API Test Response:', data);
    return data;
  } catch (error) {
    console.error('DeepSeek API Test Failed:', error);
    throw error;
  }
};

// Test the API connection when server starts
testDeepSeekAPI().catch(console.error);

const SYSTEM_PROMPT = `You are an AI assistant specializing in optimizing knitting pattern descriptions for Etsy listings. Your task is to analyze the provided PDF file and ensure the content is structured, clear, and free from inconsistencies. Focus on improving readability while preserving the original information. You do NOT add SEO keywords or rewrite for the target audience at this stage. Your job is to refine the content, fix missing details, and organize it for better comprehension.`;

const USER_PROMPT = `Process the attached PDF file. Identify any missing or unclear information and improve the structure for better readability. Correct any inconsistencies while keeping the original meaning intact. Do NOT optimize for SEO or target audience at this stage. Your goal is to refine the content and make it more clear and logically structured.`;

const callDeepSeekAPI = async (content) => {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_PROMPT.replace('{{workflow.parameters.FILEPLEASE}}', content) }
      ]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'DeepSeek API call failed');
  }

  return data.choices[0].message.content;
};

app.post('/api/optimize', async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const { content } = req.body;
    if (!content) {
      console.log('Content is missing from request');
      return res.status(400).json({ error: 'Content is required' });
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: `You are an expert in knitting and crochet patterns. Your task is to optimize and enhance the given pattern while:
            1. Maintaining all technical instructions exactly as provided
            2. Improving clarity and readability
            3. Adding helpful notes for beginners where appropriate
            4. Ensuring all abbreviations are properly explained
            5. Organizing content into clear sections (Materials, Size Guide, Instructions, etc.)
            6. Keeping the original measurements and stitch counts intact
            7. Using standard knitting/crochet terminology
            8. Adding any missing essential information (gauge, difficulty level, etc.)

            Format the output as a clean, well-structured pattern that's easy to follow.` },
          { role: 'user', content }
        ]
      })
    });

    const data = await response.json();
    console.log('DeepSeek API Response:', data);
    
    if (!response.ok) {
      console.error('DeepSeek API Error:', data);
      return res.status(response.status).json({
        error: 'DeepSeek API Error',
        details: data,
        status: response.status
      });
    }

    const optimizedContent = await callDeepSeekAPI(
      content,
      'You are an expert content optimizer. Improve the given content while maintaining its core message.'
    );
    res.json({ optimizedContent });
  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({ error: 'Failed to optimize content' });
  }
});

// **DATABASE CONNECTION**
const initializeDb = async () => {
    return open({
        filename: '../db/zippify.db',
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
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});