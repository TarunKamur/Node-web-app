import { useMutation } from 'react-query'
import { postApiData } from '@/services/data-manager.service' 

export default function usePostApiMutate() {
    return useMutation(({url,apiData}) =>postApiData(url,apiData)
    )
}