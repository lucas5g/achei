import axios, { AxiosError } from "axios"
import fs from "fs/promises"
const pdfParse = require('pdf-parse')

export class Service {
  async getUuids(page: number) {

    const { data }: {
      data: {
        acf: {
          uuidarquivo: string
        }
      }[]
    } = await axios.get('https://wp-intranet.defensoria.mg.def.br/wp-json/wp/v2/pages', {
      params: {
        // per_page: 100,
        per_page: 10,
        page,
        _fields: 'acf.uuidarquivo'
      }
      // ?per_page=100&page=1&_fields=acf.uuidarquivo
    })

    const uuids = data
      .map(page => page.acf.uuidarquivo)
      .filter(uuid => uuid)

    return uuids
  }

  async downloadPromise(uuid: string) {
    try {

      const { data } = await axios.get('https://gerais.defensoria.mg.def.br/file/service/download/Intranet/' + uuid, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: 'Bearer eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTMyNTIwOC03ZmIzLTRhMWUtYjhhNC1mOGUyNWYzNTIxZWUiLCJ0eXBlIjoiVVNVQVJJT19JTlRFUk5PIiwiZmlzdCI6ZmFsc2UsImlhdCI6MTc1NDY4NTMwNywiZXhwIjoxNzU0NjkyNTA3LCJqdGkiOiIxMC4yMzMuMTE0LjE3NiJ9.qUBVVfES5MnFQtFAAlkiTw7At3UgjGQCpOYhNA5Ol8fCTUupmTLuQc8LPKKtxWEk'
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

}