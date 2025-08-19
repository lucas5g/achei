import axios, { AxiosError } from "axios"
import fs from "fs/promises"
const pdfParse = require('pdf-parse')
import { fromBuffer, fromPath } from 'pdf2pic'
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { prisma } from "./prisma";
import { Prisma, Type } from "./generated/prisma";
import { file } from "bun";
import { setTimeout } from "timers/promises";
import { error } from "console";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { execSync } from "child_process";
interface PdfInfoInterface {
  id: number
  url: string
  urlPdf: string
  number: string,
  type: Type
}

export class Service {


  async processPdf({ id, url, urlPdf, number, type }: PdfInfoInterface) {

    try {

      const buffer = await this.downloadBufferPdf(urlPdf)

      const text = await this.bufferPdfToText(buffer)

      const content = text.length > 5 ? text : await this.processBufferPdfImage(number, buffer)


      const embedding = await this.embeddingsText(content)

      const post = await this.saveRegister({
        id,
        content,
        embedding,
        urlPdf,
        url,
        type,
        number
      })

      return post
    } catch (e) {
      console.log({
        id,
        url,
        urlPdf,
        number
      })
      throw error(e)
    }

  }

  getTypeDocument(url: string) {
    const startType = url.split('/').pop()?.toLowerCase()

    if (startType?.includes('ato')) return Type.ATO
    if (startType?.includes('del')) return Type.DELIBERACAO
    if (startType?.includes('res')) return Type.RESOLUCAO

    return Type.NAO_ENCONTRADO

  }

  async saveRegister(data: Prisma.PostCreateInput) {
    return await prisma.post.upsert({
      where: {
        id: data.id
      },
      create: data,
      update: data
    })
  }
  async embeddingsText(text: string) {


    const limitedText = text.length > 34000 ? text.slice(0, 34000) : text

    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004",
      apiKey: Bun.env.GOOGLE_API_KEY
    })
    const embedding = await embeddings.embedQuery(limitedText)
    return embedding
  }
  async getInfoPdfs(page: number, per_page = 100) {
    const url = `https://wp-intranet.defensoria.mg.def.br/wp-json/wp/v2/pages?per_page=${per_page}&page=${page}&order=desc`

    const { data }: {
      data: {
        id: number,
        class_list: string[],
        acf: {
          numero: string
          uuidarquivo: string,
          arquivo?: {
            url: string
          }
        }
      }[]
    } = await axios.get(url)

    const types = {
      'category-resolucao': Type.RESOLUCAO,
      'category-atos-dpg': Type.ATO,
      'category-deliberacoes': Type.DELIBERACAO
    }


    return data
      .filter(row => row.acf.arquivo?.url)
      .map(row => {
        return {
          id: row.id,
          url,
          urlPdf: row.acf.arquivo!.url,
          number: row.acf!.numero,
          type: types[row.class_list.pop()!]
        }
      })

  }

  async downloadBufferPdf(url: string) {
    const { data } = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/pdf',
      }
    })

    return data
  }

  async bufferPdfToText(buffer: Buffer): Promise<string> {
    const { text } = await pdfParse(buffer)

    //Remover o caractere nulo (\0) 
    return text.replace(/\u0000/g, '')
  }

  async bufferPdfImageToText(buffer: Buffer) {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0,
      apiKey: Bun.env.GOOGLE_API_KEY
    });

    const converter = fromBuffer(buffer, {
      density: 150,      // resolução
      saveFilename: "page",
      savePath: "./output",
      format: "png",
      width: 1240,
      height: 1754,
    });

    const pageCount = 10; // ou detecte dinamicamente
    const images = [];

    for (let i = 1; i <= pageCount; i++) {
      const pageImage = await converter(i);
      images.push(pageImage.path); // caminho da imagem
    }

    return images;


    const messages = [
      new SystemMessage('Transcreva o contéudo do pdf'),
      new HumanMessage(buffer.toString('base64'))
    ]

    const res = await model.invoke(messages)
    return res.text;
  }


  async searchPdf(term: string) {
    const files = await fs.readdir('pdfs')

    const matchingFiles: string[] = []

    for (const file of files) {
      const data = await fs.readFile(`pdfs/${file}`)
      const { text } = await pdfParse(data)

      if (text.toLowerCase().includes(term.toLowerCase())) {
        matchingFiles.push(file)
      }
    }

    return matchingFiles

  }

  async processBufferPdfImage(number: string, buffer: Buffer) {

    await this.savePdf(buffer, `${number}.pdf`)
    this.pdfToImage(number)
    return await this.transcribeImage(number)

  }

  async transcribeImage(number: string) {

    const imageBuffer = await fs.readFile(`img/${number}.png`)

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0,
      apiKey: Bun.env.GOOGLE_API_KEY
    });

    const messages = [
      new HumanMessage({
        content: [
          { type: "text", text: "Transcreva o texto desta imagem escaneada:" },
          {
            type: "image_url",
            image_url: `data:image/png;base64,${imageBuffer.toString("base64")}`,
          },
        ],
      }),
    ];


    const res = await model.invoke(messages);
    return res.text;

  }

  async savePdf(buffer: Buffer, name: string) {
    await fs.writeFile(`pdfs/${name}`, buffer)
  }

  pdfToImage(number: string) {
    const command = `convert -density 150 -quality 100 -resize 1240x1754 pdfs/${number}.pdf img/${number}.png`

    execSync(command)
  }

  async bufferPdfToImage(buffer: Buffer) {

    // const converter = fromBuffer(buffer, {
    //   density: 150,      // resolução
    //   saveFilename: "page",
    //   savePath: "./img",
    //   format: "png",
    //   width: 1240,
    //   height: 1754,
    // })

    // await converter(1)
  }


}