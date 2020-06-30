import express from 'express';
const mongoose = require('mongoose');
import path from 'path';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, '/build')));
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const ArticleSchema = new mongoose.Schema({
    name: String,
    upvotes: Number,
    comments: Array,
});
const Articles = mongoose.model('Article', ArticleSchema);

mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true });

app.get('/api/articles', async (req, res) => {
    try {
        const articles = await Articles.find({});
        res.send(articles);
    } catch (err) {
        res.status(500).send(err);
    }
});
app.get('/api/articles/:name', async (req, res) => {
    try {
        const article = await Articles.findOne({ name: req.params.name });

        res.status(200).send(article);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/api/articles/:name/upvote', async (req, res) => {
    try {
        const updateUpvote = await Articles.findOneAndUpdate(
            { name: req.params.name },
            {
                $inc: { upvotes: 1 },
            },
            { new: true }
        );
        res.status(200).json(updateUpvote);
    } catch (err) {
        res.status(400);
    }
});

app.post('/api/articles/:name/add-comment', async (req, res) => {
    try {
        const { username, text } = req.body;
        const addComment = await Articles.findOneAndUpdate(
            { name: req.params.name },
            {
                $push: { comments: { username, text } },
            },
            { new: true }
        );
        res.status(200).json(addComment);
    } catch (err) {
        res.status(400);
    }

    // const { username, text } = req.body;
    // const articleName = req.params.name;

    // articlesInfo[articleName].comments.push({ username, text });

    // res.status(200).send(articlesInfo[articleName]);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(8000, () => console.log('Listening on port 8000'));
