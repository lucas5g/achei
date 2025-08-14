import { Service } from "./service"
const service = new Service()
import fs from 'fs/promises'

async function main(){
  console.time()
  const urls = []
  for(let count = 24; count <= 150; count++){
    const data = await service.getUrlsPdfs(count)

    // console.log(data)
    Promise.all(data.map(row => service.downloadPdf(row.id, row.urlPdf, count)))

  }

  console.timeEnd()
}

main()




