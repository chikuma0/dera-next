
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Clear the sonar-digest.json file
    const sonarDigestPath = path.join(process.cwd(), 'public/data/sonar-digest.json');
    
    if (fs.existsSync(sonarDigestPath)) {
      // Rename the file to create a backup
      const backupPath = path.join(process.cwd(), 'public/data/sonar-digest.backup.json');
      fs.renameSync(sonarDigestPath, backupPath);
      console.log('Sonar digest file backed up to:', backupPath);
    }
    
    // Create a simple HTML page to clear localStorage
    const htmlPath = path.join(process.cwd(), 'public/clear-sonar-cache.html');
    fs.writeFileSync(
      htmlPath,
      `
<!DOCTYPE html>
<html>
<head>
  <title>Clear Sonar Cache</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    .success {
      color: green;
      font-weight: bold;
    }
    .button {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      text-align: center;
      text-decoration: none;
      font-size: 16px;
      margin: 10px 0;
      cursor: pointer;
      border: none;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>Clear Sonar Cache</h1>
  <p>This page will clear the Sonar digest cache from your browser's localStorage.</p>
  <button id="clearButton" class="button">Clear Cache</button>
  <p id="status"></p>
  
  <script>
    document.getElementById('clearButton').addEventListener('click', function() {
      // Clear the Sonar digest from localStorage
      localStorage.removeItem('sonarDigest');
      localStorage.removeItem('sonarDigestTimestamp');
      
      // Also clear any twitter-enhanced version
      localStorage.removeItem('sonarDigestTwitterEnhanced');
      localStorage.removeItem('sonarDigestTwitterEnhancedTimestamp');
      
      document.getElementById('status').innerHTML = '<span class="success">Cache cleared successfully!</span> <a href="/news/sonar-digest" class="button">View Sonar Digest</a>';
    });
  </script>
</body>
</html>
      `
    );
    
    res.status(200).json({ 
      success: true, 
      message: 'Sonar digest cache cleared',
      clearCachePage: '/clear-sonar-cache.html'
    });
  } catch (error) {
    console.error('Error clearing Sonar digest cache:', error);
    res.status(500).json({ error: String(error) });
  }
}
