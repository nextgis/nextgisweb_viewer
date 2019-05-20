# NextGIS WEB Viewer

Service for viewing map resources from NextGIS WEB.

[VIEWER](http://viewer.nextgis.com)

made using

[NEXTGIS_FRONTEND](http://code.nextgis.com)

## Installation

```bash
git clone https://github.com/nextgis/nextgisweb_viewer.git
cd ./nextgisweb_viewer
npm i
# to use the latest changes or make their own in the library bextgis_frontend
git submodule update --init
# start development server
npm start
# run prod version for deploy
npm run prod
```

## Docker

After `npm run prod`

```bash
docker build -t registry.nextgis.com/ngw-viewer:0.2.0 .
docker build -t registry.nextgis.com/ngw-viewer:latest .
docker run -it -p 8080:8080 --rm --name ngw-viewer-1 registry.nextgis.com/ngw-viewer:latest

docker push registry.nextgis.com/ngw-viewer:0.2.0
docker push registry.nextgis.com/ngw-viewer:latest
```
