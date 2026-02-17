import { getItem } from "@/services/local-storage.service";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const ProfileGuard = ({children}) => {
    const [loading, setLoading] = useState(false)

    const { push } = useRouter();
    useEffect(() =>{
        if(!!!getItem('isloggedin')) {
            push('/signin');
            return;
        }
        setLoading(true)
    },[])
    
    return <>{!!loading ? <>{children}</> : <></> }</>
}