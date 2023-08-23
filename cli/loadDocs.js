// iterate through files in docs/ihr

const dotenv = require('dotenv');
const fs = require('fs');
const openai = require('langchain/embeddings/openai');
const { nanoid } = require('nanoid');

dotenv.config({
    path: './.env.local'
})

const DOC_ROOT = './docs/ihr';

const loadDocs = (path) => {
    const docs = [];
    const files = fs.readdirSync(path);
    files.forEach(file => {
        const doc = fs.readFileSync(`${path}/${file}`, 'utf8');
        docs.push({
            pageContent: doc,
            metadata: {
                filename: file,
                source: 'ihr'
            }
        });
    });
    return docs;
}

const addVectors = async (
    vectors,
    documents
) => {
    const apiVersion = process.env.AZURE_SEARCH_API_VERSION;
    const baseUrl = `https://${process.env.AZURE_SEARCH_NAME}.search.windows.net/indexes/${process.env.AZURE_SEARCH_INDEX_NAME}/docs`;
    const apiKey = process.env.AZURE_SEARCH_API_KEY;
    const indexes = [];
    documents.forEach((document, i) => {
        indexes.push({
            id: 'id' + nanoid(),
            pageContent: document.pageContent,
            meta: document.metadata,
            embedding: vectors[i],
        });
    });

    const documentIndexRequest = {
        value: indexes,
    };

    const url = `${baseUrl}/index?api-version=${apiVersion}`;
    const responseObj = await fetcher(
        url,
        documentIndexRequest,
        apiKey
    );
    return responseObj.value.map((doc) => doc.key);
};


const fetcher = async (url, body, apiKey) => {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    console.log(err);
    throw new Error(err);
  }

  return await response.json();
};

const main = async () => {
    const docs = await loadDocs(DOC_ROOT);
    const embedding = new openai.OpenAIEmbeddings({
        openAIApiKey: process.env.AZURE_OPENAI_API_KEY,
        azureOpenAIApiDeploymentName: 'embedding'
    });
    const vectors = await embedding.embedDocuments(docs.map((doc) => doc.pageContent));
    await addVectors(vectors, docs);
};

main();
