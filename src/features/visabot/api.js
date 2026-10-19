
export async function createProfile({firstName,lastName,email,company,agree,platform}){
    const response=await fetch('/profile',{
        method:'POST',
        headers:{'Content-Type':'appliction/json'},
        body:JSON.stringfy({firstName,lastName,email,company,agree,platform})
    })
    if (!response.ok){
        const err=await response.json().catch(()=>({}))
    }
    return response.json()
}

export async function fetchProfile(email) {
    const res=await fetch(`profile?email=${encodeURIComponent(email)}`)
    
    if (res.status === 404) return null // no profile yet
    if (!res.ok) throw new Error('Unable to fetch profile')
    return res.json()

}

export async function fetchStats(email){
    const response=await fetch(`profile?email=${encodeURIComponent(email)}`)
    if (response.status==404) return null
    if (!response.ok) throw new Error('Unable to fetch Stats')
    return response.json
}