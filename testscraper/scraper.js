const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const sleep = require('sleep-promise');

const app = express();
const PORT = 3000;

const CACHE_FILE = './scraper_cache.json';
const CACHE_TTL = 1000 * 60 * 30; 

const sources = {
//   'gmanetwork': 'https://www.gmanetwork.com/news/regions/regions/list/isabela',
  'bombo': 'https://news.bomboradyo.com/?s=isabela',
  'philstar': 'https://www.philstar.com/search/isabela%20accident',
//   'pna': 'https://www.pna.gov.ph/search?q=isabela',
//   'rappler': 'https://www.rappler.com/search/?q=Isabela',
//   'inquirer': 'https://newsinfo.inquirer.net/search?module=all&query=Isabela',
//   'ISPPO': 'https://isabelappo.pro2.pnp.gov.ph/category/news/',
//   'CNNPH': 'https://cnnphilippines.com/search/?q=isabela',
//   'ManilaBulletin': 'https://mb.com.ph/?s=isabela',
//   'ABS-CBN': 'https://news.abs-cbn.com/search-results?q=isabela',
  'DZRH': 'https://dzrhnews.com.ph/?s=isabela',
//   'PilipinoStar': 'https://www.pilipinostar.com/?s=isabela',
  'SunStar': 'https://www.sunstar.com.ph/search?search=isabela',
  'Tribune': 'https://tribune.net.ph/?s=isabela',
  'ManilaTimes': 'https://www.manilatimes.net/?s=isabela',
  'DailyGuardian': 'https://dailyguardian.com.ph/?s=isabela',
  'Brigadanews': 'https://www.brigadanews.ph/category/local-news/luzon/isabela/'
};

const incidentKeywords = ['car', 'accident', 'fire', 'motorcycle', 'bus', 'truck', 'pedestrian', 'injury', 'hospital', 'ambulance'];

function parseDate(text) {
  const dateRegex = /\b(\d{4}-\d{2}-\d{2}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{1,2},\s\d{4})\b/i;
  const match = text.match(dateRegex);
  return match ? match[0] : '';
}

function parseInjury(text) {
  const low = text.toLowerCase();
  return /injury|injured|hospitalized|wounded/.test(low) ? 'Yes' : 'No';
}

function parseTreatment(text) {
  const match = text.match(/(treated at|hospitalized at|admitted to|undergoing treatment)\s.*?(\.|,|\n)/i);
  return match ? match[0] : '';
}

const cities = ['Isabela', 'Cauayan', 'Santiago', 'Ilagan', 'Alicia', 'Cabagan'];
function parseCity(text) {
  for (const city of cities) {
    if (text.includes(city)) return city;
  }
  return '';
}

async function fetchHtml(url) {
  try {
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'PatientCareScraper/1.0 (+your@email.example)' },
      timeout: 12000
    });
    return res.data;
  } catch (err) {
    console.error('Fetch error:', url, err.message);
    return null;
  }
}

function extractLinks(html, base) {
  const $ = cheerio.load(html);
  const links = [];
  $('a[href]').each((i, el) => {
    let href = $(el).attr('href');
    if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
      if (!href.startsWith('http')) {
        href = new URL(href, base).href;
      }
      links.push(href.split('#')[0]);
    }
  });
  return [...new Set(links)];
}

function isRelevant(text) {
  const low = text.toLowerCase();
  return incidentKeywords.some(k => low.includes(k));
}

async function scrapeData() {

  if (fs.existsSync(CACHE_FILE)) {
    const stats = fs.statSync(CACHE_FILE);
    if (Date.now() - stats.mtimeMs < CACHE_TTL) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
  }

  const collected = [];

  for (const [sourceName, url] of Object.entries(sources)) {
    const html = await fetchHtml(url);
    if (!html) continue;

    const links = extractLinks(html, url);

    for (const link of links.slice(0, 30)) { 
      await sleep(300); 
      const articleHtml = await fetchHtml(link);
      if (!articleHtml) continue;

      const $ = cheerio.load(articleHtml);
      const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
      const snippet = $('article p, div.entry p, div.post p, p').first().text() || '';
      const body = $('article p, div.entry p, div.post p, p').map((i, el) => $(el).text()).get().join('\n\n');

      const combined = `${title}\n\n${snippet}\n\n${body}`;
      if (!isRelevant(combined)) continue;

      collected.push({
        incident_date: parseDate(combined),
        incident_number: '',
        incident_address: '',
        incident_city: parseCity(combined),
        incident_state: 'Isabela',
        zip_code: '',
        chief_complaint: title.trim(),
        notes: snippet.trim() || body.trim(),
        injury_present: parseInjury(combined),
        treatment: parseTreatment(combined),
        source_url: link
      });
    }
  }

  const response = {
    success: true,
    fetched_at: new Date().toISOString(),
    count: collected.length,
    data: collected
  };

  fs.writeFileSync(CACHE_FILE, JSON.stringify(response, null, 2));
  return response;
}

app.get('/scraper/data', async (req, res) => {
  const data = await scrapeData();
  res.json(data);
});

app.listen(PORT, () => console.log(`Scraper API running at http://localhost:${PORT}/scraper/data`));
