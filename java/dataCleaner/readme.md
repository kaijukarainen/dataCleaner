1. Build the image:
   `docker build -t pdfparser:latest .`
2. Run the container:
   `docker run -p 8080:8080 pdfparser:latest`
3. POST
   `curl -X POST -F "file=@/path/to/your/file.pdf" http://localhost:8080/api/parse`