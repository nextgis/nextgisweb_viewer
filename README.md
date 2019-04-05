# NextGIS WEB Viewer

Service for viewing map resources from NextGIS WEB.

## Docker

```bash
docker build -t registry.nextgis.com/ngw-viewer:0.0.0 .
docker build -t registry.nextgis.com/ngw-viewer:latest .
docker run -it -p 8080:8080 --rm --name ngw-viewer-1 registry.nextgis.com/ngw-viewer:latest
```
