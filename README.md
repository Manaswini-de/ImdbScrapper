# ImdbScrapper
In this project I have scrapped the data from IMDB site of 'Top 250 Best Rated Movies' using JavaScript and Node.js. 
If the user wishes to see all the movies released in a particular year, then he/she can pass that year as command line argument. On running the first file ie. imdbScrapper.js , a JSON file will be created where all the 250 best rated movies will get sorted according to their year of release and in decreasing order of their rating.
Let's say the year passed by the user is 2019, then On running the ImdbScrapperPDfmaking.js file, a directory named "Best Movies of 2019" will be created. Inside that directory, you'll find pdfs with the names of movies which released in the year 2019 sorted in decreasing order of their IMDB ratings.
The node libraries used are: minimist, axios, jsdom, and pdf-lib 
