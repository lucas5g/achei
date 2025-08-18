import { Service } from "./service"
import fs from 'fs/promises'
const service = new Service()
const pdfParse = require('pdf-parse')
import { fromPath } from "pdf2pic";
import { createWorker } from 'tesseract.js'

async function main() {
  console.time()

  // for (let count = 193; count <= 193; count++) {
  //   const data = await service.getUrlsPdfs(count)

  //   Promise.all(data.map(row => service.downloadPdf(row.id, row.urlPdf, count)))

  // }

  const files = await fs.readdir('pdfs')
  // console.log(files);

  for (const file of files) {
    const data = await fs.readFile(`pdfs/${file}`)

    const { text } = await pdfParse(data)

    const filename = file.replace('.pdf', '')

    const converted = fromPath(`pdfs/${file}`, {
      density: 500,
      savePath: `imgs`,
      saveFilename: filename,
      format: 'png',

    })

    await converted()

    const worker = await createWorker('por');

    const ret = await worker.recognize(`imgs/${filename}.1.png`)

    console.log(ret.data.text);

  }

  console.timeEnd()
}

main()




