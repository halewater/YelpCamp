We need to make changes when we go from local development, local mongo database (everyting is on localhost) upto the real world, there are changes that need to be made

We will start with our mongo database
Right now the entire database is in a single local database:
`yelp-camp`

```js
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp3");
```

This is not really gonna work for us when we are in production

We could theoretically connect to the same database, but it is gonna be very difficuilt because of the fact that when we deploy an application, its no longer running on my laptop. Instead it is running on a server somewhere, a Heroku server, an AWS server.
And then my database is running on my machine, that mongo database is here.

So I would have to serve this mongo database over the internet myself and connect to it, lets say from heroku Or I would need to export my data, from this local database `yelp-camp` and then somehow sync it up with a database that we are using on Heroku, its just not that easy and more importantly we want a separation we want a development database and a production, at least a lot of the time we do.

THat way we can play around with things delete data and not worry that it's real user data

So in this video we are gonna set up our production database which is not going to be a local instance of mongo at all
We are gonna use ATLAS.

Atlas is one of Mongo's cloud database services

So we are gonna create a new mongo database that we dont actually store on our machine at all. It is stored in the cloud and then we can connect to it very easily.

There are other reasons to use Atlas
One being it makes it very easy to manage permissions and privacy, security. We can set up a user and a password very easily etc.

So we can go on and make an account.

# Next we replace memory store for sessions with mongodb store

so now we have an extra collection called sessions along with campgrounds, reviews, and users

Also the session expires after 14 days
