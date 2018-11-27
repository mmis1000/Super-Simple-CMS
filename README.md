#A example to upload / append / delete file throug http post

[![Greenkeeper badge](https://badges.greenkeeper.io/mmis1000/Super-Simple-CMS.svg)](https://greenkeeper.io/)

###upload

    curl -d "path=index.html&content=hello%20worlf" https://localhost:8080/

###append

    curl -d "mode=append&path=index.html&content=hello%20worlf" https://localhost:8080/
    
###delete

    curl -d "mode=delete&path=index.html" https://localhost:8080/