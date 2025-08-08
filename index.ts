import axios, { AxiosError } from 'axios'
import fs from 'fs/promises'
// import pdfParse from 'pdf-parse'
const pdfParse = require('pdf-parse')


async function getUuids(page: number) {

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

async function download(uuids: string[]) {
  for (const uuid of uuids) {
    try {
      const { data } = await axios.get('https://gerais.defensoria.mg.def.br/file/service/download/Intranet/' + uuid, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: 'Bearer eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTMyNTIwOC03ZmIzLTRhMWUtYjhhNC1mOGUyNWYzNTIxZWUiLCJ0eXBlIjoiVVNVQVJJT19JTlRFUk5PIiwiZmlzdCI6ZmFsc2UsImlhdCI6MTc1NDY3MTU3NSwiZXhwIjoxNzU0Njc4Nzc1LCJqdGkiOiIxMC4yMzMuMTE0LjE3NiJ9.-60eP89A8Yr6WbrwonTzVeiomkJgkdzgo_8gJ3aVTZnQD4aXIbTs2xi9Bl8QZriF'
        }
      })


      await fs.writeFile(`pdfs/${uuid}.pdf`, data)
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(uuid, error.response)
      }
    }

  }
}

async function downloadPromise(uuid: string) {
  try {


    const { data } = await axios.get('https://gerais.defensoria.mg.def.br/file/service/download/Intranet/' + uuid, {
      responseType: 'arraybuffer',
      headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMTMyNTIwOC03ZmIzLTRhMWUtYjhhNC1mOGUyNWYzNTIxZWUiLCJ0eXBlIjoiVVNVQVJJT19JTlRFUk5PIiwiZmlzdCI6ZmFsc2UsImlhdCI6MTc1NDY3MTU3NSwiZXhwIjoxNzU0Njc4Nzc1LCJqdGkiOiIxMC4yMzMuMTE0LjE3NiJ9.-60eP89A8Yr6WbrwonTzVeiomkJgkdzgo_8gJ3aVTZnQD4aXIbTs2xi9Bl8QZriF'
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
  // try {
  // const { text } = await pdfParse(data)
  //   return text
  // } catch (error) {
  //   console.error(`Error downloading ${uuid}`, error)
  // }

}

async function searchPdf(term: string) {
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

async function main() {

  console.time()
  // await fs.mkdir('pdfs', { recursive: true })

  // const pages = Array.from({ length: 1 }, (_, i) => i + 1) // [1..10]
  // const uuids = await Promise.all(pages.map(page => getUuids(page)))
  // const uuidsFlat = uuids.flat()

  // console.log(uuidsFlat.length)
  // await Promise.all(uuidsFlat.map(uuid => downloadPromise(uuid)))
  // await download(uuidsFlat)


  const res = await searchPdf('Maria')
  console.log(res)

  console.timeEnd()
}

main()