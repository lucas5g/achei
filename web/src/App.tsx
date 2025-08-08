import { api } from "@/utils/api";
import { wait } from "@/utils/wait";
import { Box, Button, Flex, Input, Spinner, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export function App() {

  const [list, setList] = useState<string[]>([])
  const [text, setText] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)


  async function handleDownloadPdfs(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotFound(false)
    setIsLoading(true)

    // await wait(2000)
    api.get(`/pesquisar?texto=${text}`)
      .then(res => {
        setList(res.data)
        if (!res.data.length) {
          setNotFound(true)
        }
      })
      .finally(() => setIsLoading(false))



  }

  return (
    <Flex
      alignItems={"center"}
      height={"100vh"}
      flexDirection={"column"}
      gap={"15px"}
      paddingX={200}
      paddingTop={100}

    >

      <form
        onSubmit={handleDownloadPdfs}
        style={{ width: "100%" }}
      >
        <Flex
          gap={2}
          width={"100%"}

        >

          <Input
            placeholder="Buscar PDF"
            onChange={e => setText((e.target as HTMLInputElement).value)}
            required
            // min={4}
            minLength={4}
          />
          <Button
            type="submit"
            disabled={isLoading}
            width={120}
          >
            {isLoading ? <Spinner /> : "Buscar"}
          </Button>
        </Flex>
      </form>

      {list.map((pdf) => (
        <iframe
          src={`http://localhost:8000/pdf/${pdf}`}
          title="pdf"
          height={"500px"}
          // width={"100%"}
          style={{
            width: "100%",
            minHeight: "300px"
          }}

          key={pdf}
        />
      ))}

      {notFound && <Box>Não foi encontrado nenhum PDF</Box>}

    </Flex>
  );
}

export default App;
