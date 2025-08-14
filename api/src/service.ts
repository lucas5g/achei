import axios, { AxiosError } from "axios"
import fs from "fs/promises"
const pdfParse = require('pdf-parse')

export class Service {


  async getUrlsPdfs(page: number) {
    try {

      const url = `https://wp-intranet.defensoria.mg.def.br/wp-json/wp/v2/pages?per_page=100&page=${page}`

      const { data }: {
        data: {
          id:number,
          acf: {
            uuidarquivo: string,
            arquivo: {
              url: string
            }
          }
        }[]
      } = await axios.get(url)

      return data.map(row => {
        return {
          id:row.id,
          url,
          urlPdf: row.acf.arquivo?.url
        }
      })

      // return {
      //   url,
      //   urlPdf:data[0].acf.arquivo?.url,
      // }

    } catch {
      throw new Error('Erro page ' + page)
    }
  }

  async getUuids(page: number) {

    try {

      const { data }: {
        data: {
          acf: {
            uuidarquivo: string,
            arquivo: {
              url: string
            }
          }
        }[]
      } = await axios.get('https://wp-intranet.defensoria.mg.def.br/wp-json/wp/v2/pages', {
        params: {
          per_page: 1,
          // per_page: 10,
          page,
          _fields: 'acf.arquivo.url'
        }
        // ?per_page=100&page=1&_fields=acf.uuidarquivo
      })

      const uuids = data
        .map(page => page.acf.arquivo?.url)
      // .filter(uuid => uuid)

      return uuids
    } catch {
      throw new Error('Erro page ' + page)
    }
  }

  async downloadPdf(id:number, url:string, page: number) {

    try {

      
      const { data } = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/pdf',
        }
      })
      await fs.writeFile(`pdfs/${id}.pdf`, data)
    } catch {
      await fs.writeFile(`pdfs/${id}-nao-existe.txt`, 'não existe')
      // throw new Error(`Erro page ${page} id ${id}`)
    }
    
  }

  async downloadPromise(uuid: string) {
    try {

      const { data } = await axios.get('https://gerais.defensoria.mg.def.br/file/service/download/Intranet/' + uuid, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: 'Bearer eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDI2OTAwYi0xYTIzLTQ0MGEtOTljOC04YTA5YTVlMWY2ZjMiLCJ0eXBlIjoiVVNVQVJJT19JTlRFUk5PIiwiZmlzdCI6ZmFsc2UsImlhdCI6MTc1NTAwNzMzNCwiZXhwIjoxNzU1MDE0NTM0LCJqdGkiOiIxMC4xMDAuNjYuNDIifQ.H7GdeT5-LBeOX3-r6zi00aF_BFvdyCh2MJYfrn0OlfjTonbFPqUnm-HHTweXAPBf'
        }
      })


      await fs.writeFile(`pdfs/${uuid}.pdf`, data)
      // const { text } = await pdfParse(data)
    } catch (error) {
      if (error instanceof AxiosError) {
        return console.error(uuid, error.response)
      }
      console.error(uuid, error)
    }

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

  async downloadsPdfs() {
    await fs.mkdir('pdfs', { recursive: true })
    const uuids = await this.getUuids(1)

    await Promise.all(uuids.map(uuid => this.downloadPromise(uuid)))

    return { message: `Arquivos criados com sucesso ${uuids.length}.` }

  }

  async compressFolder() {
    Bun.spawn(['tar', '-zcf', 'pdfs.tar.gz', 'pdfs'])
  }

  async pdfs() {
    const pdfs = await fs.readdir('pdfs')
    return pdfs.map(pdf => {
      return {
        uuid: pdf.replace('.pdf', ''),
        url: `${Bun.env.BASE_URL}/pdf/${pdf}`
      }
    })
  }
}