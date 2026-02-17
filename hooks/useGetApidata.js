import { useMutation } from 'react-query'
import { getApiData } from '@/services/data-manager.service' 

export default function useGetApiMutate() {
    return useMutation((url) => getApiData(url))
}