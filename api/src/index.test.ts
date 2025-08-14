import { describe, expect, it } from "bun:test";
import { app } from ".";
import { treaty } from '@elysiajs/eden'
import { Service } from "./service";


// const api = 'http://localhost:8000'
const api = treaty(app)
const service = new Service()

describe("api", () => {

  it.skip('downloads-pdfs', async () => {
    const { data } = await api["downloads-pdfs"].get()

    expect(data?.message).toContain('Arquivos criados com sucesso')
  });

  it('pesquisar', async () => {
    const { data } = await api.pesquisar.get({
      query: {
        texto: 'estágio'
      }
    })

    expect(data?.length).toBeGreaterThan(0)
  })

  // it.only('pdfs', async () => {
  //   const { data } = await api.pdfs.get()

  //   expect(data).toBeTruthy()
  // })


})

describe('service', () => {
  it('compress folder', async () => {
    await service.compressFolder()
  })

  it('pdfs', async () => {
    const res = await service.pdfs()

    console.log(res)
  })

  it.only('downloadAllPdfs', async () => {
    const urls = []
    for(let count = 1; count < 200; count++) {
      urls.push(await service.getUuids(count))
    }

    const urlsFlat = urls.flat()
    console.log(urlsFlat.length)

    // console.log(urlsFlat)
    // await service.downloadsPdfs()
  }, 200_000)

})