// node ImdbScrapperPDfmaking.js --year=2020
let minimist = require("minimist");
let axios = require("axios");
let jsdom = require("jsdom");
let pdf = require("pdf-lib");
let fs = require("fs");
let path = require("path");

let args = minimist(process.argv);

fs.readFile("years.json","utf-8", function(err,json){
    if(err){
        console.log(err);
    }
    else{
        let years = JSON.parse(json);
        CreatePdfs(years, args.year);
    }
});


function CreatePdfs(yearsArr, year){

    let srcPath="Best Movies of " + year;
    if(!fs.existsSync("Best Movies of " + year)){
        fs.mkdirSync("Best Movies of " + year);
    }

    let yrIdx = 0;
    for(let i=0; i<yearsArr.length; i++){
        if(yearsArr[i].YearofRelease=="(" + year + ")"){
            yrIdx=i;
            break;
        }
    }

    for(let i=0; i<yearsArr[yrIdx].MoviesInfo.length; i++){
        let movieFileName = path.join(srcPath,yearsArr[yrIdx].MoviesInfo[i].MovieName+".pdf");
        CreateMovieCards(yearsArr[yrIdx].MoviesInfo[i],movieFileName);
    }

}

function CreateMovieCards(MovieInfo, movieFileName){
    let movieName= MovieInfo.MovieName;
    let rating= MovieInfo.ImdbRating;
    let genres = MovieInfo.Genres;
    let Directors = MovieInfo.Directors;
    let writers = MovieInfo.Writers;
    let stars = MovieInfo.Stars;

    let bytesOfPDFTemplate = fs.readFileSync("Template.pdf");
    let pdfDocumentkaPromise = pdf.PDFDocument.load(bytesOfPDFTemplate);

    pdfDocumentkaPromise.then(async function(pdfDoc){
        let page = pdfDoc.getPage(0);

        if(movieName.length>15){
            page.drawText(movieName,{
                size: 35,
                x: 249,
                y: 670
            })
        }else{
            page.drawText(movieName,{
                size: 45,
                x: 273,
                y: 670
            })
        }

        page.drawText(rating,{
            size: 45,
            x: 261,
            y: 538
        })

        let starsArr = stars.split("  ");

        let xc = 187;
        let yc = 470;
        for(let i=0; i<starsArr.length; i++){
            page.drawText(starsArr[i],{
                size: 16,
                x: xc,
                y: yc-20
            })
            yc=yc-20;
        }

        let DirArr = Directors.split("  ");
        yc = 355;
        for(let i=0; i<DirArr.length; i++){
            page.drawText(DirArr[i],{
                size: 16,
                x: xc,
                y: yc-20
            })
            yc=yc-20;
        }

        let WriterArr = writers.split("  ");
        yc = 245;
        for(let i=0; i<WriterArr.length; i++){
            page.drawText(WriterArr[i],{
                size: 16,
                x: xc,
                y: yc-20
            })
            yc=yc-20;
        }

        let genresArr = genres.split("  ");
        yc = 125;
        for(let i=0; i<genresArr.length; i++){
            page.drawText(genresArr[i],{
                size: 16,
                x: xc,
                y: yc-20
            })
            yc=yc-20;
        }

        

        let finalPDFBytesKaPromise= pdfDoc.save();
        finalPDFBytesKaPromise.then(function(finalPDFbytes){
            fs.writeFileSync(movieFileName,finalPDFbytes);
        })
    })


}