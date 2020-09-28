# Stickets - https://stickets.io

Stickets (Super-tickets!) app, a very simple n' cool app to help you keep your ideas ordered.

That's at least how I do use it.

A live version of this app is running on github pages. It persist all your tickets and categories on your browser's localstorage, so they'll remain until you clear your browser data or manually delete it. Be aware of this!
https://andreuscafe.github.io/stickets/

## Setup

This app uses VueJS and SASS. Since VueJS is added to the project via script tag, all you have to do is follow the next commands.

Make sure you have **npm** installed:

```shell
> git clone git@github.com:andreuscafe/stickets.git
> cd stickets/
> npm install
> npm run start
```

For deploy:

```shell
> firebase init
> firebase deploy
```

All the code is inside js/index.js. I'm not using vue components (therefore, there's no need to use webpack) since this project started being pretty simple and I didn't think it would grow this much, though it still being a pretty small app and maybe it's worth using components now.

## Features incoming

-   I'm working on a firebase based storage, so you'll be able to share your sticket's board. This will be optional, and you may explicitly share your board in order to make it persistent and public.

I'm thinking to make them optionally protected by password, but it sounds a little weak by now. I'll think on a workaround to achieve this without needing to make a whole login system.

-   Also, I'll add images upload support. It may be useful, but the main idea is to keep it simple.

[![HitCount](http://hits.dwyl.io/andreuscafe/stickets.svg)](http://hits.dwyl.io/andreuscafe/stickets)
