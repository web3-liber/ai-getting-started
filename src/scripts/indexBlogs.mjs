// Major ref: https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/pinecone
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import fs from "fs";
import path from "path";

dotenv.config({ path: `.env.local` });

const MAX_TOKENS = 8191;

const fileNames = fs.readdirSync("blogs");

const fields = {
  model: 'text-embedding-3-small',  
};

const configuration = {
  apiKey: process.env.OPENAI_API_KEY,  
  basePath: process.env.OPENAI_BASE_PATH, 
};

const embeddings = new OpenAIEmbeddings(fields, configuration);

// Helper function to chunk a string into smaller parts
const chunkString = (str, length) => {
  const size = Math.ceil(str.length / length); //向上取整
  const r = Array(size);
  let offset = 0;

  for (let i = 0; i < size; i++) {
    r[i] = str.substr(offset, length);
    offset += length;
  }

  return r;
};

const langchainDocs = [];

fileNames.forEach((fileName) => { //遍历所有的文件名
  const filePath = path.join("blogs", fileName);
  const fileContent = fs.readFileSync(filePath, "utf8");
  console.log("Processing", fileName);

  const chunks = chunkString(fileContent, MAX_TOKENS);
  
  chunks.forEach((chunk, index) => {
    console.log("Processing chunk", index);
    langchainDocs.push(new Document({
      metadata: { fileName, chunkIndex: index },
      pageContent: chunk,
    }));
  });
});

const client = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

await PineconeStore.fromDocuments(langchainDocs, embeddings, {
  pineconeIndex,
  maxConcurrency: 5, // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
});

