# Stickets
Stickets (Super-tickets!) app, a very simple n' cool app to help you keep your ideas ordered.

That's at least how I do use it.

---

## Setup

This app uses VueJS (vanilla) and SASS. Since VueJS is added to the project via script tag, all you have to do is clone this repo and start the SASS watcher:

```shell
> cd stickets/
> sass scss/styles.scss css/styles.css --watch
```

I usually start a python SimpleHTTPServer in the project root folder in order to develop on localhost:3000, but any http server would be ok for this purpose. You can even just open index.html on your browser, but be aware this has some limitations.

```shell
> python -m SimpleHTTPServer 3000
```

All the code is inside index.js. I'm not using vue components (therefore, there's no need to use webpack) since this project started being pretty simple and I didn't think it would grow this much, though it still being a pretty small app and maybe it's worth using components now.

[![HitCount](http://hits.dwyl.io/andreuscafe/stickets.svg)](http://hits.dwyl.io/andreuscafe/stickets)
