// API RELATED
// Declaring Variables

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
    searchOnYoutube: (query) => `${youtubeEndPoint}/search?part=snippet&q=${query}&key=${youtubeApiKey}`,
    getRatings : (movieId) => `${apiEndPoint}/movie/${movieId}/reviews?api_key=${apiKey}`
}
const bannerSection = document.querySelector("#banner-section")


// Making Funntions
function init(){
    fetchPopular()
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
   <h2 class="banner-title">${movie.title && movie.title.length > 20 ? movie.title.slice(0,20).trim() + "..." : movie.title || movie.name}</h2>
   <span class="movie-rating">Released on: ${movie.release_date || movie.first_air_date
}</span>
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
        const categories = res.genres.slice(0,4)

        if(Array.isArray(categories) && categories.length){
            categories.forEach(category =>{
                
                fetchAndBuildMovieSection(
                    apiPaths.fetchAllMoviesList(category.id), category.name )
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

async function buildMoviesSection(list, categoryName){

    const moviesContainer = document.querySelector("#movies-container")

    const moviesListHTML = (await Promise.all(list.map( async item =>{ 
        const ratingsHTML = await buildRatings(item.title || item.name, item.id)
        // pass item.name too on onclick
    return `
    <div class="movie-item-cont">
     <div class="movie-item" onmouseenter="searchMovieTrailer('${item.title || item.name}','yt${item.id}')" onmouseleave="stopMovie('yt${item.id}')">
    <img class="movie-item-img" src="${imgPath}${item.poster_path}" alt="${item.title}">
    <div class="rating-info">
    <iframe id="yt${item.id}" width="100" height="150" src="">
    </iframe>
    ${ratingsHTML}
    </div>
    </div>
  </div>
          `
    }))).slice(0,6).join("")

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

function buildRatings(movieName, itemId){
        return new Promise((resolve,reject) =>{
              fetch(apiPaths.getRatings(itemId))
        .then(res => res.json())
        .then(res =>{
            const result = res.results
            if(Array.isArray(result) && result.length){
            const randomIndex = ~~(Math.random()*result.length)
            const randomAuthor = result[randomIndex].author
            const rating = result[randomIndex].author_details.rating
            const overview = result[randomIndex].content

            const html = 
            `
            <div class="ratings-div">
            <h2>${movieName}</h2>
            <h4>Reviewer : <span>${randomAuthor}</span></h4>
            <p>Rating : <span>${rating}</span></p>
            <p class="thoughts">Thoughts : ${overview && overview.length > 500 ? overview.slice(0,500).trim() + "..." : overview}</p>
            </div>
            `
            resolve(html)
            } else{
                resolve('No ratings available')
            }
            
           }) 
           .catch(err => console.error(err))
            })
      
    }

 function stopMovie(iFrameId){
    document.getElementById(iFrameId).src = ""
} 

function searchMovieTrailer(movieName, iFrameId){
    if(!movieName || movieName == "undefined") return

    fetch(apiPaths.searchOnYoutube(movieName))
    .then(res => res.json())
    .then(res =>{
        const bestResult = res.items[0]
       document.getElementById(iFrameId).src = `https://www.youtube.com/embed/${bestResult.id.videoId}?autoplay=1`
    })
    .catch(err => console.error(err))
}

// Adding Event Listeners

window.addEventListener("load",()=>{
    init()

// header transition
const header = document.querySelector("header")

window.addEventListener("scroll",()=>{
    window.scrollY > 10 ? header.classList.add("scrolled") : header.classList.remove("scrolled")
})
// header transition
}) 

////////////////////////////////////////
////////////////////////////////////////

// CSS RELATED
// Declaring Variables
const hamMenu = document.querySelector(".ham-menu")
const hamburgerMenu = document.querySelector(".hamburger-menu")
const scrollOverlay = document.querySelector(".scroll-overlay")
const mainBody = document.querySelector(".body")

// Making Functions
function toggleHamMenu(){
    triggerLineThrough()
    hamburgerMenu.classList.toggle("opened")
    addScrollOverlay()
}

function triggerLineThrough(){
    gsap.from(".underline", {duration : 1, delay: 1.1, x: "-100%",})
}

function addScrollOverlay(){
    hamburgerMenu.classList.contains("opened")
    ? (scrollOverlay.classList.add("scroll-opacity"), mainBody.style.overflow = "hidden")
    : (scrollOverlay.classList.remove("scroll-opacity"),mainBody.style.overflow = "auto")
}

function closeHamburgerMenu(e){
    e.target.classList.contains("scroll-overlay")
    ?(hamburgerMenu.classList.remove("opened"), scrollOverlay.classList.remove("scroll-opacity"), mainBody.style.overflow = "auto")
    : null
}

function setSelectedNavLinks(){
    const navLinks = Array.from(document.querySelectorAll(".nav-item"))
    const underLineClass = "underline"

    const activeLink = localStorage.getItem("activeLink")
    
    activeLink
    ? (document.getElementById(activeLink).classList.add("active"),
     (underline = document.createElement("div")).className = underLineClass,
     document.getElementById(activeLink).appendChild(underline))
    : null;

    function lineThroughOnClick(){
        gsap.from(".underline", {duration: 1, delay: .7, x: "-100%"})

        if(!this.classList.contains("active")){
            const activeLink = document.querySelector(".nav-item.active")

            if(activeLink){
                activeLink.classList.remove("active")
                const underline = activeLink.querySelector(`.${underLineClass}`)
                if(underline){
                    activeLink.removeChild(underline) 
                }
            } 

            this.classList.add("active")
            localStorage.setItem("activeLink",this.id)

            const underline = document.createElement("div")
            underline.className = underLineClass
            this.appendChild(underline)  
        }
    }

    navLinks.forEach((nav) =>{
        nav.addEventListener("click", lineThroughOnClick)
    })
}

// Adding Event Listeners
hamMenu.addEventListener("click", toggleHamMenu)

document.addEventListener("DOMContentLoaded", setSelectedNavLinks)
document.addEventListener("click",closeHamburgerMenu)

////////////////////////////////////////
////////////////////////////////////////
