import { prisma } from "./prisma"
import { Service } from "./service"
const service = new Service()

async function main() {
  console.time()

  const urlPdf = "https://wp-intranet.defensoria.mg.def.br/wp-content/uploads/2024/02/Ato-5931-2024-Designacao-para-SAI-1687.3105.2023.0.003.pdf"


  const buffer = await service.downloadBufferPdf(urlPdf)
  const text = await service.bufferPdfToText(buffer)
  const content = text.length > 5 ? text : await service.processBufferPdfImage('0',buffer)

  const embedding = await service.embeddingsText(content)

  console.log('content => ', content)
  // console.log('embedding => ', embedding)
  
  const post = await service.saveRegister({
    id: 0,
    content,
    embedding,
    urlPdf,
    url: urlPdf,
    type: 'NAO_ENCONTRADO',
    number: ''
  })
// console.log(embedding)

  return
  // for (let count = 1; count <= 193; count++) {
  
  const start = 64
  const end = 64
    for (let count = start; count <= end; count++) {

    const pdfsInfo = await service.getInfoPdfs(count)

    // console.log('pdfsInfo => ', pdfsInfo)
    await Promise.all(pdfsInfo.map(pdf => service.processPdf(pdf)))

  }


  const test = await prisma.post.findMany({
    where:{
      type: 'NAO_ENCONTRADO'
    }
  })


  console.log('test => ',test)
  console.timeEnd()
}

main()




