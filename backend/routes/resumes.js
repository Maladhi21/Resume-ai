import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from '../models/dbHelper.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Multer Upload File Filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

// Fallback Resume Analysis using Keywords and Heuristics
function fallbackAnalysis(text) {
  const lowercaseText = text.toLowerCase();
  
  // List of technical skills for fallback detection
  const technicalSkillsList = [
    'javascript', 'typescript', 'react', 'angular', 'vue', 'node.js', 'express', 'next.js',
    'python', 'django', 'flask', 'fastapi', 'java', 'spring boot', 'kotlin', 'c++', 'c#', 'dotnet', '.net',
    'ruby', 'rails', 'php', 'laravel', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'graphql',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'git', 'github', 'jira', 'agile', 'scrum',
    'html', 'css', 'tailwind', 'bootstrap', 'sass', 'webpack', 'vite', 'figma', 'ui/ux', 'machine learning',
    'deep learning', 'data science', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'c', 'go', 'rust'
  ];

  // List of action verbs for metrics
  const actionVerbsList = [
    'led', 'managed', 'developed', 'designed', 'built', 'implemented', 'optimized', 'created',
    'engineered', 'collaborated', 'delivered', 'improved', 'reduced', 'increased', 'saved', 'spearheaded'
  ];

  // Detect skills
    // Detect skills
  const detectedSkills = [];

  technicalSkillsList.forEach((skill) => {
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const regex = new RegExp(
      `(^|\\s|,|;|:|\\(|\\)|\\[|\\]|/|-)${escapedSkill}(?=\\s|,|;|:|\\.|\\(|\\)|\\[|\\]|/|-|$)`,
      'i'
    );

    if (regex.test(lowercaseText)) {
      const formatted =
        skill === 'javascript' ? 'JavaScript' :
        skill === 'typescript' ? 'TypeScript' :
        skill === 'react' ? 'React.js' :
        skill === 'vue' ? 'Vue.js' :
        skill === 'node.js' ? 'Node.js' :
        skill === 'next.js' ? 'Next.js' :
        skill === 'c++' ? 'C++' :
        skill === 'c#' ? 'C#' :
        skill === 'ci/cd' ? 'CI/CD' :
        skill === 'ui/ux' ? 'UI/UX' :
        skill === 'aws' ? 'AWS' :
        skill === 'gcp' ? 'GCP' :
        skill === 'sql' ? 'SQL' :
        skill === 'html' ? 'HTML' :
        skill === 'css' ? 'CSS' :
        skill.split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

      detectedSkills.push(formatted);
    }
  });

  // Calculate Action Verbs count
  let actionVerbsCount = 0;
  actionVerbsList.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi');
    const matches = lowercaseText.match(regex);
    if (matches) {
      actionVerbsCount += matches.length;
    }
  });

  // Quantifiable metrics count (numbers or percentages)
  const metricRegex = /\b\d+(%|\s?\+?k|\s?million|\s?percent|\s?x|%)\b|\$\d+/gi;
  const metricsMatches = lowercaseText.match(metricRegex);
  const metricsCount = metricsMatches ? metricsMatches.length : 0;

  // Search section headers
  const hasExperience = /experience|work history|employment|career/i.test(lowercaseText);
  const hasEducation = /education|university|college|academic/i.test(lowercaseText);
  const hasSkills = /skills|technologies|expertise/i.test(lowercaseText);
  const hasProjects = /projects|portfolio|personal work/i.test(lowercaseText);
  const hasContact = /email|phone|contact|linkedin|github|@|\d{3}-\d{3}-\d{4}/i.test(lowercaseText);

  // Scoring algorithm (simulated heuristic based on findings)
  let contentScore = 50;
  let skillsScore = 50;
  let experienceScore = 50;
  let educationScore = 50;
  let formattingScore = 60;

  const strengths = [];
  const suggestions = [];

  // 1. Content Scoring
  if (hasContact) contentScore += 15;
  else suggestions.push('Add contact details including professional email, phone number, and LinkedIn profile.');

  if (hasProjects) contentScore += 15;
  else suggestions.push('Include a "Projects" section to highlight hands-on work or personal achievements.');

  if (metricsCount > 3) {
    contentScore += 20;
    strengths.push('Excellent use of quantifiable achievements and business impact metrics.');
  } else {
    suggestions.push('Add more quantifiable achievements. Use numbers, dollar amounts, or percentages to show the business impact of your work.');
  }

  // 2. Skills Scoring
  if (detectedSkills.length > 8) {
    skillsScore += 40;
    strengths.push('Highly comprehensive technical skills section mapping back to standard industry terms.');
  } else if (detectedSkills.length > 4) {
    skillsScore += 25;
  } else {
    suggestions.push('Expand your skills section with more technical terms and toolsets matching your target jobs.');
  }

  // 3. Experience Scoring
  if (hasExperience) {
    experienceScore += 20;
    if (actionVerbsCount > 5) {
      experienceScore += 20;
      strengths.push('Strong use of action verbs (e.g. Developed, Led, Engineered) to describe responsibilities.');
    } else {
      suggestions.push('Begin resume bullet points with strong action verbs rather than passive terms like "Responsible for".');
    }
  } else {
    suggestions.push('Create a clear "Professional Experience" section detailing your career timeline.');
  }

  // 4. Education Scoring
  if (hasEducation) {
    educationScore += 40;
    strengths.push('Well-structured academic history mapping credentials and institutions.');
  } else {
    suggestions.push('Add your "Education" credentials indicating degree, institution, and graduation year.');
  }

  // 5. Formatting Scoring
  if (hasExperience && hasEducation && hasSkills) {
    formattingScore += 25;
    strengths.push('Clean layout with proper section boundaries (Experience, Education, Skills).');
  } else {
    suggestions.push('Ensure consistent formatting with clear visual section boundaries.');
  }

  // Cap scores at 100
  contentScore = Math.min(contentScore, 100);
  skillsScore = Math.min(skillsScore, 100);
  experienceScore = Math.min(experienceScore, 100);
  educationScore = Math.min(educationScore, 100);
  formattingScore = Math.min(formattingScore, 100);

  const overallScore = Math.round(
    (contentScore * 0.3) + 
    (skillsScore * 0.25) + 
    (experienceScore * 0.25) + 
    (educationScore * 0.1) + 
    (formattingScore * 0.1)
  );

  const atsScore = Math.round(
    (skillsScore * 0.4) +
    (contentScore * 0.3) +
    (experienceScore * 0.3)
  );

  return {
    overallScore,
    atsScore,
    sectionScores: {
      content: contentScore,
      skills: skillsScore,
      experience: experienceScore,
      education: educationScore,
      formatting: formattingScore
    },
    skills: detectedSkills.slice(0, 15),
    strengths: strengths.length > 0 ? strengths : ['Clear and easy-to-read resume layout.'],
    suggestions: suggestions.length > 0 ? suggestions : ['Optimize your resume summary for keyword relevance.']
  };
}

// AI Resume Analyzer utilizing Gemini API or OpenAI API
async function performAIAnalysis(text) {
  // If OpenAI API Key is present
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log('Utilizing OpenAI API for resume analysis...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume analyzer and ATS screening engine. Provide a rigorous, constructive, and highly accurate analysis of the provided resume text. Your response must be in valid JSON only with the following keys: overallScore (0-100), atsScore (0-100), sectionScores (content, skills, experience, education, formatting), skills (array of detected technical skills), strengths (array of strings), suggestions (array of strings).'
            },
            {
              role: 'user',
              content: `Analyze this resume text:\n\n${text}`
            }
          ]
        })
      });
      const data = await response.json();
      if (data.choices && data.choices[0]) {
        return JSON.parse(data.choices[0].message.content);
      }
    } catch (err) {
      console.error('OpenAI Analysis failed, trying Gemini API...', err);
    }
  }

  // If Gemini API Key is present (the preferred default for Google AI Studio!)
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('Utilizing Google Gemini API for resume analysis...');
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Analyze the following resume text. Output your response as a valid JSON object matching the requested schema. Ensure the response contains overallScore (0-100), atsScore (0-100), sectionScores (content, skills, experience, education, formatting), skills (array of detected technical skills), strengths (array of strings), and suggestions (array of strings).

Resume text:
${text}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER },
              atsScore: { type: Type.INTEGER },
              sectionScores: {
                type: Type.OBJECT,
                properties: {
                  content: { type: Type.INTEGER },
                  skills: { type: Type.INTEGER },
                  experience: { type: Type.INTEGER },
                  education: { type: Type.INTEGER },
                  formatting: { type: Type.INTEGER }
                },
                required: ['content', 'skills', 'experience', 'education', 'formatting']
              },
              skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['overallScore', 'atsScore', 'sectionScores', 'skills', 'strengths', 'suggestions']
          }
        }
      });

      if (response && response.text) {
        return JSON.parse(response.text.trim());
      }
    } catch (err) {
      console.error('Gemini Analysis failed, trying fallback heuristic analyzer...', err);
    }
  }

  // Fallback to local heuristic keyword-based analyzer if both are unavailable
  console.log('Utilizing fallback keyword heuristic analyzer...');
  return fallbackAnalysis(text);
}

// POST /api/resumes/upload
router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a file.' });
    }

    const { originalname, filename, path: filePath, size } = req.file;
    const ext = path.extname(originalname).toLowerCase();
    let extractedText = '';

    // Extract Text from Uploaded File
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (ext === '.docx') {
      const data = await mammoth.extractRawText({ path: filePath });
      extractedText = data.value;
    }

    if (!extractedText || extractedText.trim() === '') {
      // Create some default placeholder text if extraction is empty so the analysis works
      extractedText = `Resume of candidate containing file ${originalname}. Empty or unreadable text block.`;
    }

    // Run AI analysis
    const analysisJson = await performAIAnalysis(extractedText);

    // Save Analysis Result
    const analysisResult = await db.analysisResults.create({
      overallScore: analysisJson.overallScore || 70,
      atsScore: analysisJson.atsScore || 70,
      sectionScores: analysisJson.sectionScores || { content: 70, skills: 70, experience: 70, education: 70, formatting: 70 },
      skills: analysisJson.skills || [],
      strengths: analysisJson.strengths || [],
      suggestions: analysisJson.suggestions || []
    });

    const analysisResultId = analysisResult._id || analysisResult.id;

    // Save Resume
    const resume = await db.resumes.create({
      userId: req.user.id,
      originalFileName: originalname,
      filePath: filename, // Store the relative filename inuploads
      extractedText,
      analysisResult: analysisResultId
    });

    res.status(201).json({
      message: 'Resume uploaded and analyzed successfully!',
      resume: {
        id: resume._id || resume.id,
        originalFileName: resume.originalFileName,
        uploadedAt: resume.uploadedAt,
        analysisResult
      }
    });
  } catch (error) {
    console.error('File upload/parsing error:', error);
    res.status(500).json({ error: error.message || 'Server error during resume upload and analysis.' });
  }
});

// GET /api/resumes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const resumes = await db.resumes.find({ userId: req.user.id });
    res.json(resumes);
  } catch (error) {
    console.error('Fetch resumes error:', error);
    res.status(500).json({ error: 'Server error fetching resumes.' });
  }
});

// GET /api/resumes/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await db.resumes.findById(req.targetId || req.params.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    // Ensure authorization
    if (resume.userId !== req.user.id && resume.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to view this resume.' });
    }

    res.json(resume);
  } catch (error) {
    console.error('Fetch resume detail error:', error);
    res.status(500).json({ error: 'Server error fetching resume details.' });
  }
});

// POST /api/resumes/:id/analyze
router.post('/:id/analyze', authMiddleware, async (req, res) => {
  try {
    const resumeId = req.params.id;
    const resume = await db.resumes.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    if (resume.userId !== req.user.id && resume.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to re-analyze this resume.' });
    }

    // Run AI analysis again
    const analysisJson = await performAIAnalysis(resume.extractedText);

    // Save Analysis Result
    const analysisResult = await db.analysisResults.create({
      overallScore: analysisJson.overallScore || 70,
      atsScore: analysisJson.atsScore || 70,
      sectionScores: analysisJson.sectionScores || { content: 70, skills: 70, experience: 70, education: 70, formatting: 70 },
      skills: analysisJson.skills || [],
      strengths: analysisJson.strengths || [],
      suggestions: analysisJson.suggestions || []
    });

    const analysisResultId = analysisResult._id || analysisResult.id;

    // Update Resume association
    await db.resumes.findByIdAndUpdate(resumeId, {
      analysisResult: analysisResultId
    });

    res.json({
      message: 'Resume re-analyzed successfully!',
      analysisResult
    });
  } catch (error) {
    console.error('Re-analyze error:', error);
    res.status(500).json({ error: 'Server error during re-analysis.' });
  }
});

// GET /api/resumes/:id/download
router.get('/:id/download', authMiddleware, async (req, res) => {
  try {
    const resumeId = req.params.id;
    const resume = await db.resumes.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    if (resume.userId !== req.user.id && resume.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to download this resume.' });
    }

    const filePath = path.join(UPLOADS_DIR, resume.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Physical file not found on server.' });
    }

    res.download(filePath, resume.originalFileName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Server error downloading file.' });
  }
});

// DELETE /api/resumes/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const resumeId = req.params.id;
    const resume = await db.resumes.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    if (resume.userId !== req.user.id && resume.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to delete this resume.' });
    }

    const filePath = path.join(UPLOADS_DIR, resume.filePath);
    
    // Delete physical file if exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete db records
    if (resume.analysisResult) {
      const analysisId = resume.analysisResult._id || resume.analysisResult.id || resume.analysisResult;
      await db.analysisResults.findByIdAndDelete(analysisId);
    }
    await db.resumes.findByIdAndDelete(resumeId);

    res.json({ message: 'Resume and associated analysis reports deleted successfully.' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Server error deleting resume.' });
  }
});

export default router;
