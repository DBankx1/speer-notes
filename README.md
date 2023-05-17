# speer-notes
This is for the speer job application backend assesment

## How to run
To run the application i implemented docker and the use of docker compose to make it as easy as possible to run anywhere and everywhere

- First make sure docker desktop/deamon is running on your machine
- Clone the repository anc cd into the root of the project
- Run the command ```docker-compose up``` on the root of the project. This would run the ngix proxy, mysql and the app server it self
- Open anthoer tab in the terminal and exec into the container running the app server using ```docker exec -it <container id> /bin/sh```
- Once in the container we want to run the migrations to apply the db schema/changes so run ```npx prisma migrate deploy```
- Here the app should be running smooth on port ```3000``` on your pc so visit ```http://localhost:3000/api-docs``` to start using the api
- To run the tests - while in the exec'd container run ```npm test``` this should run all the tests on the project


## Project Framework details & explaination
For the backend-assesment time was of the essence as i was given 48 hours to complete the task so i voted to use ```Express``` as my server framework of choice
as its easy to understand and fast to write.

For the project structure as being a developer i personally think time is of the essence as we know most of what we are doing has been done before and
i have a rule to myself if its not necesary, dont re-invent the wheel, saying that i opted to use a boilerplate starter for an express and typescript 
backend server. the github for the tool i used can be found [here](https://github.com/ljlm0402/typescript-express-starter)

For my Database i chose MySQL, knowing i was asked to use either PostgreSQL or MongoDB. this was because i chose to use ```Prisma``` for my Data access
layer/ORM, because prisma is smooth, mind dumbingly easy to use, and has very good documentation as support and when using prisma the full text index
that was required for the search was only supported with the MySQL Database as of now. I truly apologize for this.

For the rate limiting again for speed and the sake of not re-inventing the wheel i used a npm package named ```Express-rate-limit``` found [here](https://www.npmjs.com/package/express-rate-limit)
and this allowed me to easily and quickly implement rate limiting for the api. i allowed only 30 requests per 15 mins. the only downside here is the rate
limiting has no state so when you stop and start the server it resets to have 30 request per 15 min. In a production environment i think using redis to store
the state of the rate limits would be effective in what was needed to do.

Thank you for the opportunity of undergoing this exercise. Hope to hear from you soon.

Thanks!
