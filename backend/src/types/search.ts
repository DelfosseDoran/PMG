export interface SearchPopular{
    id:number
    amount_of_hits:number
    search_query:string
    htmlSearch_query?:string
}

export interface SearchHistory{
    id:number
    search_query:string
    searched_at:Date
    user_id:number
    htmlSearch_query?:string
}

export interface SearchResult{
    dataOwnSearches:[SearchHistory]
    dataMostSuccesFull:[SearchPopular]
}