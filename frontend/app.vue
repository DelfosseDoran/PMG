<script lang="ts" setup>
import { ref } from 'vue'
import type { SearchHistory, SearchPopular, SearchResult } from './types/search'
import Account from './components/icons/account.vue'

const userId = ref<number>()
const userName = ref<string>('')
const search = ref('')
const oldSearch = ref('')
const searchResultsRecant = ref<SearchHistory[]>([])
const searchResultsFavorite = ref<SearchPopular[]>([])
const articlesResults = ref()
const showResult=ref(false)
const searchQueryIndex=ref(-1)
const totalResults=ref(-1)

const navigate=(position:string)=>{
  if (!showResult.value) return;

    totalResults.value = searchResultsRecant.value.length + searchResultsFavorite.value.length+1;
    if (totalResults.value==0)return
    if (position === 'down') {
      searchQueryIndex.value = (searchQueryIndex.value + 1) % totalResults.value;
      // search.value=
    } else if (position === 'up') {
      searchQueryIndex.value = (searchQueryIndex.value - 1 + totalResults.value) % totalResults.value;
    }
    if (totalResults.value-1==searchQueryIndex.value)
    {search.value=oldSearch.value}
    else{
    const totalRecant = searchResultsRecant.value.length;
    search.value = searchQueryIndex.value < totalRecant
        ? searchResultsRecant.value[searchQueryIndex.value].search_query
        : searchResultsFavorite.value[searchQueryIndex.value - totalRecant].search_query
      }
}
const selectResult=(event:any)=> {
    const totalRecant = searchResultsRecant.value.length;
    if(totalResults.value-1!=searchQueryIndex.value)
    {    doSearch(search.value);}
    if (searchQueryIndex.value >= 0) {
      const selectedResult = searchQueryIndex.value < totalRecant
        ? searchResultsRecant.value[searchQueryIndex.value]
        : searchResultsFavorite.value[searchQueryIndex.value - totalRecant];
        doSearch(selectedResult.search_query);
      }
      showResult.value = false;
      searchQueryIndex.value = -1;
      event.target.blur();
  }

const selectWrittenData = (text: string) => {
  const BoldSearch = text.slice(0, search.value.length)
  const restOfSearch = text.slice(search.value.length)
  return `<strong>${BoldSearch}</strong>${restOfSearch}`
}

const getSearch = async () => {
  //@ts-ignore
  const data: SearchResult = await $fetch(`http://localhost:3000/search/${userId.value}.${search.value}`)
  console.log(data)
  searchResultsRecant.value = data.dataOwnSearches.map(
    (result: SearchHistory) => {
      result.htmlSearch_query = selectWrittenData(result.search_query)
      return result
    }
  )
  searchResultsFavorite.value = data.dataMostSuccesFull.map(
    (result: SearchPopular) => {
      result.htmlSearch_query = selectWrittenData(result.search_query)
      return result
    }
  )
}

const getId = async () => {
  const data:any= await $fetch(
    `http://localhost:3000/Users/id/${userName.value}`
  )
  userId.value = data.id
  getSearch()
}

const makeAccount = async () => {
  await $fetch(`http://localhost:3000/Users`, {
    method: 'post',
    body: {
      name: userName.value,
    },
  }).then((result:any) => {
    userId.value = result.id
    getSearch()
  })
}

const doSearch = async (clickedSearch: string) => {
  search.value=clickedSearch
  await $fetch(`http://localhost:3000/search`, {
    method: 'post',
    body: {
      search: clickedSearch,
      user_Id: userId.value,
    },
  }).then(() => {
    getSearch()
    getArticles(clickedSearch)
  })
}

const getArticles = async (articleSearch: string) => {
  if (articleSearch)
    articlesResults.value = await $fetch(
      `http://localhost:3000/article/${articleSearch}`
    )
}

const changeSearch =()=>{
  oldSearch.value=search.value
  searchQueryIndex.value=-1
  getSearch()
}

const logout = () => {
  userId.value = undefined;
  userName.value = '';
  showResult.value = false;
  search.value = '';
  oldSearch.value = '';
  articlesResults.value=[]
}
</script>

<template>
  <main class="bg-sky-50 p-2 min-h-screen">
    <header
      class="flex justify-between items-center px-10 p-4 mb-6 bg-sky-800 rounded-lg shadow-lg"
    >
      <img
        src="https://www.pmg.be/uploads/logos/svg/293303.svg"
        alt=""
        class="h-12"
      />
      <div class="flex gap-3 items-center">
        <div class="w-52" v-if="userId == undefined">
          <label class="flex flex-col items-end mb-1">
            <input
              v-model="userName"
              type="text"
              class="rounded-sm p-1 w-full"
              placeholder="account name"
            />
          </label>
          <div class="gap-1 flex w-full">
            <button
              @click="getId"
              class="w-1/2 bg-sky-200 rounded-sm shadow-sm"
            >
              login
            </button>
            <button
              @click="makeAccount"
              class="w-1/2 bg-sky-200 rounded-sm shadow-sm"
            >
              new account
            </button>
          </div>
        </div>
        <div class="text-right" v-else>
          <p class="text-white text-xl font-bold">{{ userName }}</p>
          <button
            @click="logout"
            class="px-2 bg-sky-200 rounded-sm shadow-sm"
          >
            log-out
          </button>
        </div>
        <Account class="h-16 fill-white" />
      </div>
    </header>
    <div class="flex justify-center" v-if="userId == undefined">
      <p class="min-w-72 w-2/3 mb-2">
        geef je naam op bij account voor verder te kunnen
      </p>
    </div>
    <div class="flex items-center flex-col group gap-6">
      <div class="shadow-xl rounded-lg min-w-72 w-2/3 bg-white">
        <input
          v-model="search"
          :disabled="userId == undefined"
          type="search"
          placeholder="zoek iets op"
          class="disabled:bg-gray-300 outline-1 outline-sky-800 w-full p-2 rounded-lg"
          @change="getArticles(search)"
          @input="changeSearch"
          @keydown.down="navigate('down')"
          @keydown.up.prevent="navigate('up')"
          @keydown.enter="selectResult"
          @focus="showResult = true"
        />
        <div v-if="showResult" class="flex flex-col items-start">
          <hr class="w-full mb-2" />
          <p class="p-1 text-sm">Recente zoekopdrachten</p>
          <p class="p-2" v-if="searchResultsRecant.length === 0">
            Nog geen overeenkomende zoekopdrachten
          </p>
          <button
            @click="doSearch(result.search_query); showResult = false; searchQueryIndex = -1;"
            :key="index+10"
            v-for="(result, index) in searchResultsRecant"
            :class="[
              'p-2 hover:bg-sky-400 active:focus:bg-sky-800 active:focus:text-white w-full text-left rounded-lg',
              { 'bg-sky-600': searchQueryIndex === index },
            ]"
            v-html="result.htmlSearch_query"
          ></button>
          <hr class="w-full" />
          <p class="p-1 text-sm">Populaire zoekopdrachten</p>
          <p v-if="searchResultsFavorite.length === 0">
            Nog geen overeenkomende zoekopdrachten
          </p>
          <button
            @click="
              doSearch(result.search_query);
      searchQueryIndex = -1;
              showResult = false
            "
            :key="index"
            v-for="(result, index) in searchResultsFavorite"
            :class="[
              'p-2 hover:bg-sky-400 active:focus:bg-sky-800 active:focus:text-white w-full text-left rounded-lg',
              {
                'bg-sky-600':
                  searchQueryIndex === index + searchResultsRecant.length,
              },
            ]"
            v-html="result.htmlSearch_query"
          ></button>
        </div>
      </div>
      <div
        v-if="articlesResults && articlesResults.length > 0"
        class="shadow-xl rounded-lg min-w-72 w-2/3 bg-white"
      >
        <p class="p-1 text-sm">overeenkomende artikelen</p>
        <p
          class="p-2 w-full text-left rounded-lg"
          v-for="article in articlesResults"
        >
          {{ article.title }}
        </p>
      </div>
    </div>
  </main>
</template>
