import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const exampleDataPath = 'pdfs';
const directoryLoader = new DirectoryLoader(exampleDataPath, {
  ".pdf": (path: string) => new PDFLoader(path),
});


const directoryDocs = await directoryLoader.load();

console.log('directoryDocs => ', directoryDocs);  