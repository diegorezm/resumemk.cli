import {useSearchParams} from "next/navigation"

export const useCreateQueryString = () => {
  const searchParams = useSearchParams()

  const createQueryString = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    return params.toString()
  }
  return {
    createQueryString
  }
}
