const apiKey = "366984552808749ba281d7846991b9cb"
const youtubeApiKey = "AIzaSyBJO2FGGy5knwSKJ374pyfoU4B9gd9_oh8"
const apiEndPoint = "https://api.themoviedb.org/3"
const imgPath = "https://image.tmdb.org/t/p/original"
const youtubeEndPoint = "https://www.googleapis.com/youtube/v3"
const apiPaths = {
    fetchAllCategories : `${apiEndPoint}/genre/movie/list?api_key=${apiKey}`,
    fetchAllMoviesList : (id) => `${apiEndPoint}/discover/movie?api_key=${apiKey}&with_genres=${id}`,
    fetchTrending : `${apiEndPoint}/trending/all/day?api_key=${apiKey}&language=en-US`,
    fetchPopular: `${apiEndPoint}/movie/popular?api_key=${apiKey}`,
    searchOnYoutube: (query) => `${youtubeEndPoint}/search?part=snippet&q=${query}&key=${youtubeApiKey}`
}
const bannerSection = document.querySelector("#banner-section")

function init(){
    // fetchPopular()
    fetchTrendingMovies()
    fetchAndBuildAllSections()
}



function fetchTrendingMovies(){
    fetchAndBuildMovieSection(apiPaths.fetchTrending, "Trending Now")
    .then( list => {
        const randomIndex = ~~(Math.random()*list.length)
        buildBannerSection(list[randomIndex])
    })
    .catch(err => console.error(err))
}

function fetchPopular(){
    fetchAndBuildMovieSection(apiPaths.fetchPopular,"Popular")
}

function buildBannerSection(movie){

   bannerSection.style.background = `url(${imgPath}${movie.backdrop_path
   })`

   bannerSection.style.backgroundSize = "cover"
   bannerSection.style.backgroundRepeat = "no-repeat"
   bannerSection.style.position = "relative"

   const bannerHtml = `
   <h2 class="banner-title">${movie.title && movie.title.length > 20 ? movie.title.slice(0,20).trim() + "..." : movie.title}</h2>
   <p class="movie-rating">Released on: ${movie.release_date}</p>
   <p class="movie-info">${movie.overview && movie.overview.length > 200 ? movie.overview.slice(0,200).trim() + "..." : movie.overview}</p>
   <div class="action-button-container">
    <button class="action-btn">
      <i class="fa-solid fa-play"></i> &nbsp;
      Play</button>
    <button class="action-btn">
      <i class="fa-solid fa-circle-info"></i> &nbsp;
      More Info</button>
   </div>
  <div class="fade-overlay"></div>`

  const div = document.createElement("div")
  div.className = "banner-content container"
  div.innerHTML = bannerHtml

  bannerSection.appendChild(div)

}

function fetchAndBuildAllSections(){
    fetch(apiPaths.fetchAllCategories)
    .then(res => res.json())
    .then(res =>{
        const categories = res.genres

        if(Array.isArray(categories) && categories.length){
            categories.slice(0,5).forEach(category =>{
                fetchAndBuildMovieSection(
                    apiPaths.fetchAllMoviesList(category.id), category.name
                )
            })
        }
    })
    .catch(err => console.error(err))
}

function fetchAndBuildMovieSection(fetchUrl, categoryName){
return fetch(fetchUrl)
       .then(res => res.json())
       .then(res => {
    const movies = res.results
    if(Array.isArray(movies) && movies.length){
        buildMoviesSection(movies, categoryName)
    } 
    return movies
})
.catch(err => console.log(err))
}


function buildMoviesSection(list, categoryName){

    const moviesContainer = document.querySelector("#movies-container")

    const moviesListHTML = list.map(item =>{  
    return `
    <div class="movie-item" onmouseleave="stopMovie('yt${item.id}')" onmouseenter="searchMovieTrailer('${item.title}','yt${item.id}')">
          <img class="movie-item-img" src="${imgPath}${item.poster_path}" alt="${item.title}">
          <iframe id="yt${item.id}" width="100" height="150" src="">
</iframe>
          </div>
          `
    }).slice(0,9).join("")

const moviesSectionHTML = `
<h2 class="movie-section-heading"> <span>Explore All</span>${categoryName}</h2>
<div class="movies-row">
${moviesListHTML}
</div>
`

const sectionDiv = document.createElement("div")
sectionDiv.className = "movies-section"
sectionDiv.innerHTML = moviesSectionHTML

moviesContainer.appendChild(sectionDiv)
}

function stopMovie(iFrameId){
    document.getElementById(iFrameId).src = ""
}


function searchMovieTrailer(movieName, iFrameId){
    if(!movieName) return
    console.log(movieName, iFrameId)

    fetch(apiPaths.searchOnYoutube(movieName))
    .then(res => res.json())
    .then(res =>{
        const bestResult = res.items[0]
       document.getElementById(iFrameId).src = `https://www.youtube.com/embed/${bestResult.id.videoId}?autoplay=1`
    })
    .catch(err => console.error(err))

    // fetch(apiPaths.searchOnYoutube("batman"))
    // .then(res => res.json())
    // .then(res => {
    //    const bestResult = res.items[0]
    //    console.log(res)
    // //    const youtubeUrl = `https://www.youtube.com/watch?v=${bestResult.id.videoId}`
    // // document.getElementById(iFrameId).src = `https://www.youtube.com/embed/${bestResult.id.videoId}?autoplay=1`
    // // //    window.open(youtubeUrl, "blank")

    
    // })
    // .catch(err => console.error(err))
}

window.addEventListener("load",()=>{
    init()

// header transition
const header = document.querySelector("header")

window.addEventListener("scroll",()=>{
    window.scrollY > 10 ? header.classList.add("scrolled") : header.classList.remove("scrolled")
})
// header transition
}) 

