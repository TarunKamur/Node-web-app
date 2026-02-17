import { useMutation } from 'react-query'
import { fromApiData } from '@/services/data-manager.service' 

export default function useFromApiMutate() {
    return useMutation(({url,apiData}) =>fromApiData(url,apiData)
    )
}