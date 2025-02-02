
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Post = require('./models/post')
const Contact = require('./models/contact');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'ejs-views'));  // ✅ Указываем папку шаблонов

const PORT = 4000;
const db = 'mongodb+srv://kostiadid228:Pass321@cluster0.cvfgl.mongodb.net/node-blog?retryWrites=true&w=majority';
mongoose
.connect(db)
.then((res)=> console.log('Connect to DB'))
.catch((error) => console.log(error));

app.listen(PORT, (error) => {
  error ? console.log(error) : console.log(`✅ Server is running at http://localhost:${PORT}`);
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.use(express.urlencoded({ extended: false }));

app.use(express.static('styles'));

app.get('/', (req, res) => {
  const title = 'Home';
  res.render('index', { title });  
});

app.get('/contacts', (req, res) => {
  const title = 'Contacts';
  Contact
  .find()
  .then((contacts) => res.render('contacts', { contacts, title }))
  .catch((error) =>{
    console.log(error);
    res.render('error', { title: 'Error' });
  });
});

app.get('/posts/:id', (req, res) => {
  const title = 'Post';
  Post.findById(req.params.id)
    .then((post) => {
      if (!post) {
        return res.status(404).render('error', { title: 'Post Not Found' });
      }
      res.render('post', { post, title });  
    })
    .catch((error) => {
      console.log(error);
      res.render('error', { title: 'Error' });  
    });
});

app.get('/posts', (req, res) => {
  const title = 'Posts';
  Post.find()
    .sort({ createdAt: -1})
    .then((posts) => res.render('posts', { title, posts })) 
    .catch((error) => {
      console.log(error);
      res.render('error', { title: 'Error' });
    });
});

app.post('/add-post', (req, res) => {
  const { title, author, text } = req.body;
  const post = new Post({ title, author, text });
  post
  .save()
  .then((result) => res.redirect('/posts'))
  .catch((error) =>{
    console.log(error);
    res.render('error', { title: 'Error' });
  })
});

app.get('/add-post', (req, res) => {
  const title = 'Add Post';
  res.render('add-post', { title });  
});

app.use((req, res) => {
  const title = 'Error Page';
  res.status(404).render('error', { title });  
});
