import { Service } from "./service"
const service = new Service()
import fs from 'fs/promises'

async function main(){
  for(let count = 1; count <= 20_000; count++){
    const { urlPdf, url} = await service.getUrlPdf(count)

    if(!urlPdf){
      await fs.writeFile(`pdfs/${count}-nao-encontrado.txt`, url)
      continue
    }

    await service.downloadPdf(urlPdf, count)

    console.log(url)

  }
 
}

main()




