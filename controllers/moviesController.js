exports.getMovies = (req, res) => {
    res.json({ message: 'Movies retrieved successfully' });
};

exports.createMovie = (req, res) => {
    console.log("Running createMovie");
    const { imdb, title, director, year, poster } = req.body;
    res.json({ message: 'Movie created successfully', imdb, title, director, year, poster });
};

exports.deleteMovie = (req, res) => {
    const { imdbId } = req.params;
    res.json({ message: `Movie with IMDb ID ${imdbId} deleted successfully` });
};
