// Given a directory with code files, a DB, and a language, this script will extract embeddings for code chat.
// The embeddings are stored in a tenant in Nile database
import { v4 as uuidv4 } from "uuid";
import { Nile, Server } from "@niledatabase/server";
import { EMBEDDING_TABLE, createVectorEmbedding } from "./embeddingUtils";
import { Octokit } from "octokit";

const LanguageMappings: Map<string, string[]> = new Map([
  ["python", ["py"]],
  ["javascript", ["js", "jsx"]],
  ["typescript", ["ts", "tsx"]],
  ["java", ["java"]],
  ["go", ["go"]],
  ["rust", ["rs"]],
]);

function createOctokit(authtoken?: string) {
  try {
    if (authtoken) {
      return new Octokit({ auth: authtoken });
    }
    return new Octokit();
  } catch (error) {
    console.error("Error creating octokit", error);
    throw error;
  }
}

// Function to read files and create embeddings
async function getOrCreateTenantId(
  nile: Server,
  tenant_name: string
): Promise<string> {
  try {
    const tenants = await nile.db.query(
      "select id from tenants where name = $1",
      [tenant_name]
    );
    if (tenants.rows.length > 0) {
      console.log(`Using existing tenant: ${tenants.rows[0]}`);
      return tenants.rows[0].id;
    } else {
      const tenant_id = uuidv4();
      console.log(`Creating new tenant with ${tenant_name} and ${tenant_id}`);
      await nile.db.query("INSERT INTO tenants(id, name) VALUES($1, $2)", [
        tenant_id,
        tenant_name,
      ]);
      return tenant_id;
    }
  } catch (error) {
    console.error("Error getting or creating tenant", error);
    throw error;
  }
}

async function getOrCreateProject(
  nile: Server,
  project_name: string,
  project_url: string,
  tenant_id: string
): Promise<string> {
  try {
    const projects = await nile.db.query(
      "select id from projects where name = $1",
      [project_name]
    );
    if (projects.rows.length > 0) {
      console.log(`Using existing project: ${projects.rows[0]}`);
      return projects.rows[0].id;
    } else {
      const project_id = uuidv4();
      console.log(
        `Creating new project with ${project_name} and ${project_id}`
      );
      await nile.db.query(
        "INSERT INTO projects(id, name, url, tenant_id) VALUES($1, $2, $3, $4)",
        [project_id, project_name, project_url, tenant_id]
      );
      return project_id;
    }
  } catch (error) {
    console.error("Error getting or creating project", error);
    throw error;
  }
}

async function processGitHubRepo(
  repoUrl: string,
  language: string | string[],
  project_id: string,
  nile: Server,
  tenant_id: string,
  authToken?: string
) {
  const octokit = createOctokit(authToken);
  const [owner, repo] = repoUrl.split("/").slice(-2);

  const fileExtensions: string[] = [];
  if (Array.isArray(language)) {
    for (const lang of language) {
      const extensions = LanguageMappings.get(lang);
      if (extensions) {
        fileExtensions.push(...extensions);
      }
    }
  } else {
    const extensions = LanguageMappings.get(language);
    if (extensions) {
      fileExtensions.push(...extensions);
    }
  }

  if (fileExtensions.length === 0) {
    throw new Error(`Language ${language} not supported`);
  }

  const client = await nile.db.connect();
  client.query("BEGIN");

  try {
    async function processContent(path: string) {
      console.log(`Processing dir : ${path}`);
      const { data: fileContent } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      if (Array.isArray(fileContent)) {
        for (const item of fileContent) {
          if (item.type === "file") {
            await processFile(item.path, item.download_url);
          } else if (item.type === "dir") {
            await processContent(item.path);
          }
        }
      } else if (fileContent.type === "file") {
        await processFile(path, fileContent.download_url);
      }
    }

    async function processFile(filePath: string, downloadUrl: string | null) {
      console.log(`Processing file: ${filePath}`);
      const fileExtension = filePath.split(".").pop()?.toLowerCase();
      if (
        fileExtension &&
        fileExtensions &&
        downloadUrl &&
        (fileExtensions.includes(fileExtension) ||
          filePath.endsWith("README.md"))
      ) {
        const response = await fetch(downloadUrl);
        const content = await response.text();

        if (content.length > 0 && content.length < 8192) {
          const result = await client.query(
            "INSERT INTO file_content(tenant_id, project_id, file_name, contents) VALUES($1, $2, $3, $4) RETURNING id",
            [tenant_id, project_id, filePath, content]
          );
          const file_id = result.rows[0].id;

          const embedding = await createVectorEmbedding(content);
          const formattedEmbedding = JSON.stringify(embedding);

          await client.query(
            `INSERT INTO ${EMBEDDING_TABLE}(tenant_id, file_id, embedding) VALUES($1, $2, $3)`,
            [tenant_id, file_id, formattedEmbedding]
          );

          console.log(`Processed ${filePath}`);
        }
      }
    }

    await processContent("");
    client.query("COMMIT");
  } catch (error) {
    client.query("ROLLBACK");
    console.error("Error processing GitHub repository:", error);
    throw error;
  }
}
export async function embedRepo(
  repoUrl: string,
  language: string | string[],
  project_name?: string,
  authtoken: string | undefined = process.env.GITHUB_ACCESS_TOKEN
) {
  try {
    console.log(process.env.NILEDB_DBNAME);
    const nile = await Nile();
    const [owner, repo] = repoUrl.split("/").slice(-2);
    const tenant_id = await getOrCreateTenantId(nile, owner!);
    nile.tenantId = tenant_id;

    const project_id = await getOrCreateProject(
      nile,
      project_name ?? repo!,
      repoUrl,
      tenant_id
    );

    await processGitHubRepo(
      repoUrl,
      language,
      project_id,
      nile,
      tenant_id,
      authtoken
    );
    console.log(
      "File embeddings stored successfully for Github repository : ",
      repoUrl.split("/").pop()
    );
  } catch (error) {
    console.error("Error processing files:", error);
  }
  return;
}
