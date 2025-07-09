const fs = require("fs");
const path = require("path");

async function getReleaseLine() {
  const changelogPath = path.join(process.cwd(), "./CHANGELOG.md");

  if (
    !fs.existsSync(changelogPath) ||
    fs.statSync(changelogPath).isDirectory()
  ) {
    return "";
  }

  let changelog;
  try {
    changelog = fs.readFileSync(changelogPath, "utf-8");
  } catch (error) {
    return "";
  }

  const lines = changelog.split("\n");

  const unreleasedIndex = lines.findIndex(
    (line) => line.trim().toLowerCase() === "## [unreleased]"
  );

  if (unreleasedIndex === -1) {
    return "";
  }

  const nextVersionIndex = lines.findIndex(
    (line, index) =>
      index > unreleasedIndex && line.startsWith("## [") && line.includes("]")
  );

  const endIndex = nextVersionIndex === -1 ? lines.length : nextVersionIndex;

  const unreleasedContent = lines
    .slice(unreleasedIndex + 1, endIndex)
    .join("\n")
    .trim();

  if (!unreleasedContent) {
    return "";
  }

  return unreleasedContent;
}

async function getDependencyReleaseLine(_, dependenciesUpdated) {
  return dependenciesUpdated.length > 0
    ? `dependencies updated: ${dependenciesUpdated
        .map((item) => item.name)
        .join(", ")}`
    : "";
}

module.exports = {
  getReleaseLine,
  getDependencyReleaseLine,
};
