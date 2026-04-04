const fs = require('fs');
const path = require('path');
const { categories } = require('./data.cjs');

const reposFile = path.resolve(__dirname, '../../repos.txt');
const repos = fs.readFileSync(reposFile, 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const CONCURRENCY = 10;

if (!GITHUB_TOKEN) {
  console.error("Error: GITHUB_TOKEN environment variable is not set.");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
};

async function ghFetch(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`${url} responded ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function checkRateLimit() {
  const data = await ghFetch('https://api.github.com/rate_limit');
  const remaining = data.resources.core.remaining;
  const resetTime = data.resources.core.reset;

  if (remaining < CONCURRENCY * 3) {
    const waitTime = resetTime * 1000 - Date.now() + 5000;
    console.log(`Rate limit low (${remaining}). Waiting ${Math.round(waitTime / 1000)}s...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    console.log('Resuming requests...');
  }
}

function assignCategory(description, tags, language) {
  const lowerDesc = description.toLowerCase();
  const lowerTags = tags.map(tag => tag.toLowerCase());
  const matchedCategories = [];

  for (const [category, keywords] of Object.entries(categories)) {
    if (
      keywords.some(keyword => lowerDesc.includes(keyword)) ||
      keywords.some(keyword => lowerTags.includes(keyword)) ||
      keywords.some(keyword => language.toLowerCase().includes(keyword))
    ) {
      matchedCategories.push(category);
    }
  }
  return matchedCategories.length > 0 ? matchedCategories : ["Uncategorized"];
}

async function fetchRepoData(repo) {
  // Fetch repo info and topics in parallel
  const [repoData, topicsData] = await Promise.all([
    ghFetch(`https://api.github.com/repos/${repo}`),
    ghFetch(`https://api.github.com/repos/${repo}/topics`),
  ]);

  // Use default branch from repo data (no extra API call)
  const defaultBranch = repoData.default_branch;
  const branchData = await ghFetch(
    `https://api.github.com/repos/${repoData.owner.login}/${repoData.name}/branches/${defaultBranch}`
  );

  const fullRepoName = `${repoData.owner.login}/${repoData.name}`;
  const description = repoData.description || "";
  const tags = topicsData.names || [];
  const language = repoData.language || "";
  const assignedCategories = assignCategory(description, tags, language);

  return {
    name: fullRepoName,
    repo: repoData.html_url,
    stars: repoData.stargazers_count,
    last_commit: branchData.commit.commit.committer.date,
    language,
    description,
    tags,
    categories: assignedCategories,
    install_options: [],
  };
}

async function fetchData() {
  const toolsData = [];
  let completed = 0;

  // Process in batches of CONCURRENCY
  for (let i = 0; i < repos.length; i += CONCURRENCY) {
    await checkRateLimit();

    const batch = repos.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(repo => fetchRepoData(repo))
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      if (result.status === 'fulfilled') {
        toolsData.push(result.value);
      } else {
        const repo = batch[j];
        const errorMsg = `[${new Date().toISOString()}] Error fetching ${repo}: ${result.reason.message}\n`;
        fs.appendFileSync('errors.log', errorMsg);
        console.error(errorMsg);
      }
    }

    completed += batch.length;
    console.log(`Progress: ${completed}/${repos.length}`);
  }

  fs.writeFileSync('src/data/tools.json', JSON.stringify(toolsData, null, 2), 'utf8');
  console.log(`Done. ${toolsData.length} tools written to src/data/tools.json`);
}

fetchData();
