// node imdbScrapper.js --url=https://www.imdb.com/chart/top --year=2020

let minimist = require("minimist");
let axios = require("axios");
let jsdom = require("jsdom");
let pdf = require("pdf-lib");
let fs = require("fs");
let path = require("path");

let args = minimist(process.argv);

let movies=[];
let Year = [];

let responsekapromise= axios.get(args.url);
responsekapromise.then(async function(response){
    let html = response.data;

    let dom = new jsdom.JSDOM(html);
    let document = dom.window.document;


    let Movieblocks = document.querySelectorAll(".titleColumn");
    let ratings = document.querySelectorAll(".ratingColumn.imdbRating strong");

    for(let i=0; i<Movieblocks.length-80; i++){
        let Movieblock = Movieblocks[i];
        let movie={
            MovieName: "",
            YearofRelease: "",
            ImdbRating: "",
            url: ""
        }

        movie.MovieName = Movieblock.querySelector("a").textContent;
        movie.YearofRelease = Movieblock.querySelector("span.secondaryInfo").textContent;
        movie.ImdbRating = ratings[i].textContent;
        let halfurl = Movieblock.querySelector("a").getAttribute("href");
        movie.url = "https://www.imdb.com"+halfurl;

        movies.push(movie);

    }

    for(let i=0; i<movies.length; i++){
        SortAccordingToYear(Year,movies[i]);
    }


    for(let i=0; i<movies.length; i++){
        // fetch information from each url
        await fetchInfo(movies[i].url,i);
    }

})


count=0;

async function fetchInfo(movieUrl,idx){

    let HtmlPromise = axios.get(movieUrl);
    HtmlPromise.then(async function(response){
        let html = response.data;

        let dom = new jsdom.JSDOM(html);
        let document = dom.window.document;

        let yridx = getYearidx(movies[idx].YearofRelease, Year);
        let movieidx = getMovieIdx(movies[idx].MovieName,Year[yridx]);

        let genres = document.querySelectorAll(".GenresAndPlot__GenreChip-cum89p-3 span");

        genreString="";
        for(let i=0; i<genres.length; i++){
            let attr = genres[i].textContent;
            genreString+=attr+"  ";
        }

        Year[yridx].MoviesInfo[movieidx].Genres = genreString;

        let infos = document.querySelectorAll("li[data-testid='title-pc-principal-credit']");

        let DirectorString="";
        let DirectorDiv = infos[0].querySelectorAll("a.ipc-metadata-list-item__list-content-item.ipc-metadata-list-item__list-content-item--link");
        for(let i=0; i<DirectorDiv.length; i++){
            DirectorString+= DirectorDiv[i].textContent + "  ";
        }
        Year[yridx].MoviesInfo[movieidx].Directors = DirectorString;

        let WritersString="";
        let WritorDiv = infos[1].querySelectorAll("a.ipc-metadata-list-item__list-content-item.ipc-metadata-list-item__list-content-item--link");
        for(let i=0; i<WritorDiv.length; i++){
            WritersString+= WritorDiv[i].textContent+"  ";
        }
        Year[yridx].MoviesInfo[movieidx].Writers = WritersString;

        let StarsString="";
        let StarDiv = infos[2].querySelectorAll("a.ipc-metadata-list-item__list-content-item.ipc-metadata-list-item__list-content-item--link");
        for(let i=0; i<StarDiv.length; i++){
            StarsString+= StarDiv[i].textContent+"  ";
        }
        Year[yridx].MoviesInfo[movieidx].Stars = StarsString;

        count++;
        console.log(count);

        if(count==169){
            yearsJson = JSON.stringify(Year);
            fs.writeFileSync("years.json", yearsJson, "utf-8"); 
        }

    })

}

function SortAccordingToYear(Year, movie){

    let idx = -1;
    for(let i=0; i<Year.length; i++){
        if(Year[i].YearofRelease == movie.YearofRelease){
            Year[i].MoviesInfo.push({
                MovieName: movie.MovieName,
                ImdbRating: movie.ImdbRating,
            })
            idx = 1;
            break;
        }
    }

    if(idx == -1){
        Year.push({
            YearofRelease: movie.YearofRelease,
            MoviesInfo: [{
                MovieName: movie.MovieName,
                ImdbRating: movie.ImdbRating,
            }]
        })
    }
}

function getMovieIdx(name, yr){
    for(let i=0; i<yr.MoviesInfo.length; i++){
        if(yr.MoviesInfo[i].MovieName == name){
            return i;
        }
    }
}

function getYearidx(movieYr, Year){
    for(let i=0; i<Year.length; i++){
        if(Year[i].YearofRelease == movieYr){
            return i;
        }
    }
}

