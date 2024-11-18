const axios = require('axios');
const fs = require('fs');
const { repos, categories } = require('./data.cjs'); // Import repos and categories

// Use an environment variable for the GitHub token
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error("Error: GITHUB_TOKEN environment variable is not set.");
  process.exit(1);
}

async function checkRateLimit() {
  const rateLimitResponse = await axios.get('https://api.github.com/rate_limit', {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
  });

  const remainingRequests = rateLimitResponse.data.resources.core.remaining;
  const resetTime = rateLimitResponse.data.resources.core.reset;

  console.log(`Remaining requests: ${remainingRequests}`);

  if (remainingRequests === 0) {
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
  try {
    const [owner, name] = repo.split("/");
    const repoInfoResponse = await axios.get(`https://api.github.com/repos/${owner}/${name}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });

    const defaultBranch = repoInfoResponse.data.default_branch;

    const branchResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${name}/branches/${defaultBranch}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    );

    return branchResponse.data.commit.commit.committer.date;
  } catch (error) {
    console.error(`Error fetching last commit for ${repo}:`, error.response?.data || error.message);
    throw error;
  }
}

async function fetchRepoData(repo) {
  try {
    await checkRateLimit();

    const repoResponse = await axios.get(`https://api.github.com/repos/${repo}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });

    const topicsResponse = await axios.get(`https://api.github.com/repos/${repo}/topics`, {
      headers: {
        Accept: 'application/vnd.github.mercy-preview+json',
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });

    const fullRepoName = `${repoResponse.data.owner.login}/${repoResponse.data.name}`;
    const description = repoResponse.data.description || "";
    const tags = topicsResponse.data.names || [];
    const language = repoResponse.data.language || "";
    const lastAcceptedCommit = await fetchLastAcceptedCommit(repo);
    const assignedCategories = assignCategory(description, tags, language);

    return {
      name: fullRepoName,
      repo: repoResponse.data.html_url,
      stars: repoResponse.data.stargazers_count,
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

  fs.writeFileSync('tools.json', JSON.stringify(toolsData, null, 2), 'utf8');
  console.log('Data has been written to tools.json');
}

fetchData();