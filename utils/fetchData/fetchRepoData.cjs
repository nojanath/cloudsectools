const fs = require('fs');
const path = require('path');
const { categories } = require('./data.cjs');

const reposFile = path.resolve(__dirname, '../../repos.txt');
const repos = fs.readFileSync(reposFile, 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

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

  console.log(`Remaining requests: ${remaining}`);

  if (remaining === 0) {
    const waitTime = resetTime * 1000 - Date.now() + 5000;
    console.log(`Rate limit reached. Waiting for ${Math.round(waitTime / 1000)} seconds...`);
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

async function fetchLastAcceptedCommit(repo) {
  const [owner, name] = repo.split("/");
  const repoInfo = await ghFetch(`https://api.github.com/repos/${owner}/${name}`);
  const defaultBranch = repoInfo.default_branch;
  const branchData = await ghFetch(`https://api.github.com/repos/${owner}/${name}/branches/${defaultBranch}`);
  return branchData.commit.commit.committer.date;
}

async function fetchRepoData(repo) {
  try {
    await checkRateLimit();

    const repoData = await ghFetch(`https://api.github.com/repos/${repo}`);
    const topicsData = await ghFetch(`https://api.github.com/repos/${repo}/topics`);

    const fullRepoName = `${repoData.owner.login}/${repoData.name}`;
    const description = repoData.description || "";
    const tags = topicsData.names || [];
    const language = repoData.language || "";
    const lastAcceptedCommit = await fetchLastAcceptedCommit(repo);
    const assignedCategories = assignCategory(description, tags, language);

    return {
      name: fullRepoName,
      repo: repoData.html_url,
      stars: repoData.stargazers_count,
      last_commit: lastAcceptedCommit,
      language,
      description,
      tags,
      categories: assignedCategories,
      install_options: [],
    };
  } catch (error) {
    const timestamp = new Date().toISOString();
    const errorMsg = `[${timestamp}] Error fetching data for ${repo}: ${error.message}\n`;
    fs.appendFileSync('errors.log', errorMsg);
    console.error(errorMsg);
    return null;
  }
}

async function fetchData() {
  const toolsData = [];

  for (const repo of repos) {
    const data = await fetchRepoData(repo);
    if (data) {
      toolsData.push(data);
    }
  }

  fs.writeFileSync('src/data/tools.json', JSON.stringify(toolsData, null, 2), 'utf8');
  console.log('Data has been written to src/data/tools.json');
}

fetchData();
